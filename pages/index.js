import Link from 'next/link'
export default function Home(){
  return (
    <div style={{padding:24}}>
      <h1>GBP Admin (Vercel)</h1>
      <p><Link href="/locations">Locations</Link> | <Link href="/posts">Posts</Link> | <Link href="/reviews">Reviews</Link></p>
    </div>
  )
}
