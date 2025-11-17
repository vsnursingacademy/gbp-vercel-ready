import fetch from 'node-fetch'
import { supabaseServer } from '../../lib/supabaseServer'
export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  try{
    const { google_review_name, location_id, reply } = req.body
    const { data: loc } = await supabaseServer.from('locations').select('*').eq('id', location_id).single()
    const client_id = loc.client_id
    // refresh token
    const tok = await supabaseServer.from('oauth_tokens').select('*').eq('client_id', client_id).single()
    if(!tok.data) throw new Error('no token')
    const refresh_token = tok.data.refresh_token
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token
      })
    })
    const j = await tokenRes.json()
    const access_token = j.access_token
    // call GBP reply endpoint
    const url = `https://businessprofile.googleapis.com/v1/${google_review_name}:reply`
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${access_token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment: reply })
    })
    if(!r.ok){
      const t = await r.text()
      console.error('reply error', t)
      return res.status(500).json({ ok:false, error: t })
    }
    await supabaseServer.from('reviews').update({ replied:true, reply_text: reply }).eq('google_review_name', google_review_name)
    res.status(200).json({ ok:true })
  }catch(err){
    console.error(err)
    res.status(500).json({ ok:false, error: String(err) })
  }
}
