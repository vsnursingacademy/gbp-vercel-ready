import fetch from 'node-fetch'
import { supabaseServer } from '../../lib/supabaseServer'

export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  try{
    const { location_id, docs } = req.body
    const OPENAI_KEY = process.env.OPENAI_API_KEY
    if(!OPENAI_KEY) return res.status(500).json({ error: 'no openai key' })
    for(const d of docs){
      const embRes = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_KEY}` },
        body: JSON.stringify({ model: 'text-embedding-3-small', input: d.content })
      })
      const embJson = await embRes.json()
      const vector = embJson.data[0].embedding
      await supabaseServer.from('embeddings').insert([{ doc_id: d.doc_id, location_id, content: d.content, embedding: vector }])
    }
    res.status(200).json({ ok:true })
  }catch(err){
    console.error(err)
    res.status(500).json({ ok:false, error: String(err) })
  }
}
