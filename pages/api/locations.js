import { supabaseServer } from '../../lib/supabaseServer'
export default async function handler(req,res){
  try{
    const { data } = await supabaseServer.from('locations').select('*')
    res.status(200).json(data||[])
  }catch(e){
    console.error(e); res.status(500).json({ error: 'db' })
  }
}
