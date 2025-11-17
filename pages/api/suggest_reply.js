import fetch from 'node-fetch'
import { supabaseServer } from '../../lib/supabaseServer'

export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  try{
    const { location_id, user_message } = req.body
    const OPENAI_KEY = process.env.OPENAI_API_KEY
    if(!OPENAI_KEY) return res.status(500).json({ error:'no openai key' })
    // get embedding for user message
    const embRes = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({ model: 'text-embedding-3-small', input: user_message })
    })
    const embJson = await embRes.json()
    const queryVec = embJson.data[0].embedding
    // call rpc function via SQL to match embeddings
    const { data } = await supabaseServer.rpc('match_embeddings', { vec: queryVec, location_id_input: location_id, limit_input: 5 })
    const context = (data || []).map(r => r.content).join('\n---\n')
    const prompt = `You are a helpful assistant for a business. Use the CONTEXT below to craft a short polite reply. Context:\n${context}\nCustomer message:\n${user_message}\nReply:`
    const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role:'system', content:'You are a concise assistant.' }, { role:'user', content: prompt }],
        max_tokens: 200
      })
    })
    const chatJson = await chatRes.json()
    const reply = chatJson.choices?.[0]?.message?.content || ''
    res.status(200).json({ ok:true, reply })
  }catch(err){
    console.error(err)
    res.status(500).json({ ok:false, error: String(err) })
  }
}
