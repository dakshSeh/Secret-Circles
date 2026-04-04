import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { ArenaCard } from './components/arena-card'
import { LeaderboardStrip } from './components/leaderboard-strip'

export default async function FeedPage() {
  const supabase = await createClient()

  // 1. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Fetch Arena Drops (Published only)
  const { data: drops, error: fetchError } = await supabase
    .from('drops')
    .select(`
      *,
      author:users!author_id(handle, rep_score),
      circle:circles!circle_id(name, genre),
      votes:drop_votes(user_id, direction)
    `)
    .eq('is_arena_published', true)
    .order('score', { ascending: false })

  if (fetchError) {
    console.error('Fetch Error:', fetchError)
  }

  // 3. Leaderboard - Top Circles
  const { data: leaderboard } = await supabase
    .from('circles')
    .select('name, genre, rep_score')
    .eq('is_deleted', false)
    .eq('is_dev_circle', false)
    .order('rep_score', { ascending: false })
    .limit(10)

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary selection:bg-gold selection:text-bg-primary">
       <LeaderboardStrip circles={leaderboard || []} />

       <div className="max-w-4xl mx-auto p-6 md:p-12 space-y-24">
          <header className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-border-custom pb-20 enter">
             <div className="space-y-8">
               <p className="label text-gold flex items-center gap-4 tracking-[0.4em] !text-[10px]">
                  <span className="w-12 h-[1px] bg-gold"></span>
                  GLOBAL SECTOR
               </p>
               <h1 className="heading-lg uppercase tracking-tight !text-7xl lg:!text-8xl">The Arena</h1>
               <p className="body-sm text-text-tertiary max-w-sm leading-relaxed border-l-2 border-border-custom/40 pl-8 !text-[13px]">
                 Collective intelligence on display. Content filtered through the engine of unanimous consensus.
               </p>
             </div>
             <div className="text-right pb-2">
                <p className="label !text-text-tertiary tracking-[0.3em] !text-[9px]">RANKED BY SIGNAL</p>
                <div className="flex gap-4 mt-6 label !text-[9px] justify-end">
                   <button className="text-gold border-b border-gold pb-1 tracking-[0.2em]">TOP 24H</button>
                   <button className="opacity-40 hover:opacity-100 transition-opacity tracking-[0.2em]">ALL TIME</button>
                </div>
             </div>
          </header>

          <div className="grid grid-cols-1 gap-24 pb-48">
             {drops && drops.length > 0 ? (
               drops.map(drop => (
                  <ArenaCard 
                    key={drop.id} 
                    drop={drop} 
                    currentUserId={user.id} 
                  />
               ))
             ) : (
               <div className="text-center py-60 grayscale opacity-20 enter">
                 <div className="w-24 h-24 border border-border-custom mx-auto mb-12 flex items-center justify-center animate-pulse">
                    <div className="w-12 h-12 border border-gold/40 rotate-45"></div>
                 </div>
                 <p className="heading-md tracking-[0.3em] uppercase max-w-md mx-auto !text-4xl">The Arena is expectant.</p>
                 <p className="body-sm mt-8 tracking-widest !text-[11px] opacity-60">PUSH CONTENT FROM YOUR CIRCLE TO CLAIM TERRITORY.</p>
               </div>
             )}
          </div>
       </div>
    </main>
  )
}
