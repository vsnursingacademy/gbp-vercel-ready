import fetch from 'node-fetch'
import { supabaseServer } from '../../lib/supabaseServer'

export default async function handler(req,res){
  const { code, state } = req.query
  if(!code) return res.status(400).send('Missing code')
  try{
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method:'POST',
      headers: {'Content-Type':'application/x-www-form-urlencoded'},
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.OAUTH_REDIRECT_URI,
        grant_type: 'authorization_code'
      })
    })
    const tokenJson = await tokenRes.json()
    // store tokens - state should be client_id (uuid)
    if(state){
      const client_id = state
      await supabaseServer.from('clients').upsert({ id: client_id, name: client_id })
      await supabaseServer.from('oauth_tokens').upsert({
        client_id,
        access_token: tokenJson.access_token,
        refresh_token: tokenJson.refresh_token,
        scope: tokenJson.scope,
        expires_at: new Date(Date.now() + (tokenJson.expires_in || 3600)*1000).toISOString()
      })
    }
    res.status(200).json(tokenJson)
  }catch(err){
    console.error(err)
    res.status(500).json({ error: String(err) })
  }
}
