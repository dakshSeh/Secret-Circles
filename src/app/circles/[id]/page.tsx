import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ApplyModal } from './components/apply-modal'
import { FounderControls } from './components/founder-controls'
import { DropModal } from './components/drop-modal'

export default async function CirclePage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient()
  const { id } = await params

  // 1. Fetch Circle Details
  const { data: circle, error: circleError } = await supabase
    .from('circles')
    .select(`
      *,
      founder:users!founder_id(handle),
      memberships(
        user_id,
        role,
        user:users(handle, rep_score)
      )
    `)
    .eq('id', id)
    .single()

  if (circleError || !circle) return redirect('/circles')

  const members = (circle.memberships as any[]) || []

  // 2. Auth & Membership Check
  const { data: { user } } = await supabase.auth.getUser()
  const userMembership = members?.find(m => m.user_id === user?.id)
  const isMember = !!userMembership
  const isFounder = circle.founder_id === user?.id
  const totalMembers = members.length

  // 3. Fetch Drops for this circle
  const { data: drops } = await supabase
    .from('drops')
    .select(`
      *,
      author:users!author_id(handle, rep_score),
      arena_publish_votes(voter_id)
    `)
    .eq('circle_id', id)
    .order('created_at', { ascending: false })

  // 3. Pending Applications (for Founder)
  const { data: pendingApplications } = isFounder
    ? await supabase
      .from('applications')
      .select('*, user:users(handle, rep_score)')
      .eq('circle_id', id)
      .eq('status', 'pending')
    : { data: [] }

  // 4. Current User Application (for non-members)
  const { data: myApplications } = !isMember && user
    ? await supabase
      .from('applications')
      .select('*')
      .eq('circle_id', id)
      .eq('user_id', user.id)
      .order('applied_at', { ascending: false })
    : { data: [] }

  const pendingApp = myApplications?.find(a => a.status === 'pending')

  const genreColor = `var(--${circle.genre.toLowerCase()})`

  if (!isMember) {
    return (
      <main className="min-h-screen bg-bg-primary text-text-primary flex flex-col items-center justify-center p-6 text-center space-y-12 selection:bg-gold selection:text-bg-primary">
        <div className="space-y-4 enter">
           <div className="badge mx-auto" style={{ color: genreColor, borderColor: genreColor }}>{circle.genre}</div>
           <h1 className="heading-lg uppercase tracking-tight">{circle.name}</h1>
           <p className="label tracking-[0.3em] text-gold">RESTRICTED ACCESS</p>
        </div>

        <div className="max-w-md w-full space-y-8 bg-bg-surface/50 border border-border-custom p-10 enter">
           <p className="body text-text-secondary leading-relaxed">
             This circle is private. Participation requires an approved application from the founder. Intent must be verified.
           </p>
           
           {pendingApp ? (
             <div className="label text-gold border border-gold/30 py-4 px-8 tracking-[0.2em] bg-gold/5 animate-pulse">APPLICATION PENDING</div>
           ) : (
             <ApplyModal circleId={id} circleName={circle.name} />
           )}
           
           <Link href="/circles" className="block label text-[10px] hover:text-gold transition-colors pt-4 opacity-40">
             ← Return to Directory
           </Link>
        </div>
      </main>
    )
  }

  // Member View
  return (
    <main 
      className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-12 lg:px-24 space-y-16 selection:bg-gold selection:text-bg-primary"
      style={{
        backgroundImage: `radial-gradient(circle at 50% -20%, ${genreColor}15, transparent)`,
      } as any}
    >
      <header className="flex flex-col md:flex-row justify-between items-start gap-12 border-b border-border-custom pb-12 enter">
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <span className="badge" style={{ color: genreColor, borderColor: genreColor }}>{circle.genre}</span>
            <span className="label text-gold tracking-[0.2em]">{userMembership.role.toUpperCase()} // SIGNAL {circle.rep_score}</span>
          </div>
          <h1 className="heading-lg uppercase tracking-tighter" style={{ textShadow: `0 0 60px ${genreColor}30` }}>{circle.name}</h1>
          
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3">
              {members.slice(0, 10).map((m, i) => (
                <div 
                  key={i} 
                  className="w-10 h-10 border-2 border-bg-primary bg-bg-surface flex items-center justify-center text-[10px] uppercase font-ibm rounded-full ring-1 ring-border-custom"
                  title={m.user?.handle}
                >
                  {m.user?.handle?.slice(0, 2)}
                </div>
              ))}
            </div>
            <p className="label !text-[9px] text-text-tertiary">{members.length} / {circle.member_limit} MEMBERS</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
           <Link href={`/circles/${id}/chat`} className="btn-primary px-10 py-3 text-center border-gold text-gold hover:bg-gold hover:text-bg-primary">
             Circle Chat →
           </Link>
           <button className="btn-primary !border-white/5 text-text-tertiary">Settings</button>
        </div>
      </header>

      {isFounder && pendingApplications && pendingApplications.length > 0 && (
         <FounderControls applications={pendingApplications} />
      )}

      {circle.is_frozen && (
        <div className="bg-gold border border-gold/40 text-bg-primary p-4 text-center label tracking-widest animate-pulse">
           THIS CIRCLE IS FROZEN. POSTING DISABLED.
        </div>
      )}

      <section className="space-y-12 pb-24">
         <div className="flex justify-between items-end border-b border-border-custom pb-8">
            <p className="label tracking-[0.2em] text-text-tertiary">Internal Feed // Signal {circle.rep_score}</p>
            {!circle.is_frozen && (
               <DropModal circleId={id} />
            )}
         </div>
         
         <div className="grid grid-cols-1 gap-12 max-w-4xl mx-auto">
            {drops && drops.length > 0 ? (
               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {drops.map(drop => (
                    <DropCard 
                      key={drop.id} 
                      drop={drop} 
                      totalMembers={totalMembers} 
                      currentUserId={user?.id || ''} 
                    />
                  ))}
               </div>
            ) : (
              <div className="text-center space-y-6 py-32 grayscale opacity-20">
                <p className="heading-md tracking-widest text-[#F0EDE8]">THE FEED IS QUIET.</p>
                <p className="body-sm tracking-widest uppercase">ESTABLISH DOMINANCE WITH A NEW DROP.</p>
              </div>
            )}
         </div>
      </section>
    </main>
  )
}

function DropCard({ drop, totalMembers, currentUserId }: { drop: any; totalMembers: number; currentUserId: string }) {
  const votes = (drop.arena_publish_votes as any[]) || []
  const hasVoted = votes.some(v => v.voter_id === currentUserId)
  const votesCount = votes.length
  
  return (
    <div className="card !bg-bg-surface/30 p-8 space-y-6 hover:!bg-bg-surface transition-all duration-500 enter border-border-custom/50">
       <div className="flex justify-between items-start">
         <div className="flex items-center gap-2">
            <span className="label !text-gold !text-[9px] uppercase">{drop.type}</span>
            <span className="text-[10px] text-text-tertiary opacity-40">· {new Date(drop.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
         </div>
         {drop.is_anonymous ? (
           <span className="label !text-text-tertiary tracking-[0.2em] !text-[9px]">ANONYMOUS</span>
         ) : (
           <span className="label !text-text-primary !text-[9px] tracking-widest">@{drop.author?.handle}</span>
         )}
       </div>

       {drop.media_url && (
         <div className="aspect-video bg-bg-primary overflow-hidden border border-border-custom/30 group relative">
            <img src={drop.media_url} alt="Drop Media" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
         </div>
       )}

       <p className="body-sm leading-relaxed text-[#F0EDE8]/90">{drop.content}</p>

       <div className="flex justify-between items-center pt-6 border-t border-border-custom/20">
          <div className="flex gap-4">
             <div className="flex items-center gap-3">
                <button className="text-text-tertiary hover:text-upvote transition-colors text-[10px]">▲</button>
                <span className="label !text-text-primary text-[11px] font-ibm">{drop.score || 0}</span>
                <button className="text-text-tertiary hover:text-downvote transition-colors text-[10px]">▼</button>
             </div>
          </div>

          <div>
             {drop.is_arena_published ? (
               <div className="badge !border-gold !text-gold !text-[8px] animate-pulse">ARENA LIVE</div>
             ) : (
               <button 
                onClick={async () => {
                   import('@/app/drops/actions').then(actions => actions.castArenaVote(drop.id)).then(res => {
                     if (res.success) window.location.reload()
                   })
                }}
                disabled={hasVoted}
                className={`label border px-3 py-1.5 text-[9px] tracking-widest transition-all duration-300 ${hasVoted ? 'border-gold text-gold bg-gold/5' : 'border-border-custom hover:border-gold text-text-tertiary hover:text-gold'}`}
               >
                 {hasVoted ? 'PUSHED' : 'ARENA PUSH'} {votesCount}/{totalMembers}
               </button>
             )}
          </div>
       </div>
    </div>
  )
}
