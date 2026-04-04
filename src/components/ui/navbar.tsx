import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export async function Navbar() {
  const supabase = await createClient()
  
  // 1. Auth Check - Only show for logged in users
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 2. Fetch Handle
  const { data: profile } = await supabase
    .from('users')
    .select('handle')
    .eq('id', user.id)
    .single()

  return (
    <nav className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-bg-surface/60 backdrop-blur-2xl border border-border-custom px-10 py-5 flex items-center gap-16 rounded-full enter shadow-[0_30px_100px_rgba(0,0,0,0.8)] border-gold/10">
       <Link href="/feed" className="label hover:text-gold transition-all duration-300 !text-[10px] tracking-[0.3em] font-ibm group">
          <span className="opacity-40 group-hover:opacity-100 transition-opacity mr-2 italic">01</span>ARENA
       </Link>
       <Link href="/circles" className="label hover:text-gold transition-all duration-300 !text-[10px] tracking-[0.3em] font-ibm group">
          <span className="opacity-40 group-hover:opacity-100 transition-opacity mr-2 italic">02</span>COLLECTIVES
       </Link>
       <Link href={`/profile/${profile?.handle}`} className="label hover:text-gold transition-all duration-300 !text-[10px] tracking-[0.3em] font-ibm group">
          <span className="opacity-40 group-hover:opacity-100 transition-opacity mr-2 italic">03</span>IDENTITY
       </Link>
    </nav>
  )
}
