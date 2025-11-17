import { supabaseServer } from '../../lib/supabaseServer'
export default async function handler(req,res){
  if(req.method !== 'POST') return res.status(405).end()
  const { location_id, summary, scheduled_at, media_url } = req.body
  try{
    const { data } = await supabaseServer.from('posts').insert([{ location_id, summary, scheduled_at, media_url }])
    res.status(200).json({ ok:true, data })
  }catch(e){
    console.error(e); res.status(500).json({ error:'db' })
  }
}
