import useSWR from 'swr'
import axios from 'axios'
const fetcher = url => axios.get(url).then(r=>r.data)
export default function Reviews(){
  const { data } = useSWR('/api/reviews', fetcher)
  if(!data) return <div>Loading...</div>
  return (
    <div style={{padding:24}}>
      <h1>Reviews</h1>
      {data.map(r=> <div key={r.id} style={{border:'1px solid #ddd', padding:12, margin:8}}><strong>{r.author_name}</strong> - {r.rating}⭐<div>{r.text}</div></div>)}
    </div>
  )
}
