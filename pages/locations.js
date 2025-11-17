import useSWR from 'swr'
import axios from 'axios'
const fetcher = url => axios.get(url).then(r=>r.data)
export default function Locations(){
  const { data, error } = useSWR('/api/locations', fetcher)
  if(error) return <div>Error</div>
  if(!data) return <div>Loading...</div>
  return (
    <div style={{padding:24}}>
      <h1>Locations</h1>
      {data.map(l => <div key={l.id} style={{border:'1px solid #eee', margin:8, padding:8}}>{l.display_name || l.google_location_name}</div>)}
    </div>
  )
}
