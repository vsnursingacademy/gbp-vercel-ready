import fetch from 'node-fetch'
import { supabaseServer } from '../../lib/supabaseServer'

async function refreshToken(client_id){
  const { data } = await supabaseServer.from('oauth_tokens').select('*').eq('client_id', client_id).single()
  if(!data) throw new Error('no token')
  const refresh_token = data.refresh_token
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      grant_type: 'refresh_token',
      refresh_token
    })
  })
  const j = await res.json()
  await supabaseServer.from('oauth_tokens').update({
    access_token: j.access_token,
    expires_at: new Date(Date.now() + (j.expires_in || 3600)*1000).toISOString()
  }).eq('client_id', client_id)
  return j.access_token
}

export default async function handler(req,res){
  // protect with scheduler token if called externally
  const auth = req.headers.authorization || ''
  if(process.env.SCHEDULER_TOKEN && auth !== `Bearer ${process.env.SCHEDULER_TOKEN}`){
    return res.status(403).json({ error: 'forbidden' })
  }
  try{
    const now = new Date().toISOString()
    const { data: due } = await supabaseServer.from('posts').select('*').lte('scheduled_at', now).eq('status','scheduled')
    let published = 0
    for(const post of due || []){
      try{
        const { data: loc } = await supabaseServer.from('locations').select('*').eq('id', post.location_id).single()
        const client_id = loc.client_id
        const access_token = await refreshToken(client_id)
        const googleRes = await fetch(`https://businessprofile.googleapis.com/v1/${loc.google_location_name}/localPosts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: post.summary,
            languageCode: 'en-US',
            media: post.media_url ? [{ mediaFormat: 'PHOTO', sourceUrl: post.media_url }] : undefined
          })
        })
        if(!googleRes.ok){
          const t = await googleRes.text()
          console.error('google post error', t)
          await supabaseServer.from('posts').update({ status: 'failed' }).eq('id', post.id)
          continue
        }
        await supabaseServer.from('posts').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', post.id)
        published++
      }catch(err){
        console.error('publish err', err)
        await supabaseServer.from('posts').update({ status:'failed' }).eq('id', post.id)
      }
    }
    res.status(200).json({ published })
  }catch(err){
    console.error(err)
    res.status(500).json({ error: String(err) })
  }
}
