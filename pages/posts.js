import { useState } from 'react'
import axios from 'axios'
export default function Posts(){
  const [form,setForm] = useState({location_id:'', summary:'', scheduled_at:''})
  const handle = async e => { e.preventDefault(); await axios.post('/api/schedulePost', form); alert('Scheduled') }
  return (
    <div style={{padding:24}}>
      <h1>Schedule Post</h1>
      <form onSubmit={handle}>
        <div><label>Location ID</label><br/><input value={form.location_id} onChange={e=>setForm({...form,location_id:e.target.value})} /></div>
        <div><label>Summary</label><br/><textarea value={form.summary} onChange={e=>setForm({...form,summary:e.target.value})} /></div>
        <div><label>Scheduled At ISO</label><br/><input value={form.scheduled_at} onChange={e=>setForm({...form,scheduled_at:e.target.value})} /></div>
        <button>Schedule</button>
      </form>
    </div>
  )
}
