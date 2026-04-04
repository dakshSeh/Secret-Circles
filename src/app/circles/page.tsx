import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function CirclesPage() {
  const supabase = await createClient()

  // 1. Fetch authenticated user to check memberships
  const { data: { user } } = await supabase.auth.getUser()

  // 2. Fetch Circles with founder handle and counts
  const { data: circles, error: fetchError } = await supabase
    .from('circles')
    .select(`
      id,
      name,
      description,
      genre,
      rep_score,
      member_limit,
      founder_id,
      founder:users!founder_id(handle),
      memberships(count)
    `)
    .eq('is_dev_circle', false)
    .eq('is_deleted', false)
    .order('rep_score', { ascending: false })

  if (fetchError) {
    console.error('Fetch Error:', fetchError)
  }

  // 3. Current User Memberships
  const { data: myMemberships } = user 
    ? await supabase.from('memberships').select('circle_id').eq('user_id', user.id)
    : { data: [] }
  
  const joinedCircleIds = new Set(myMemberships?.map(m => m.circle_id) || [])

  // 4. Platform Stats
  const { count: totalCircleCount } = await supabase
    .from('circles')
    .select('*', { count: 'exact', head: true })
    .eq('is_deleted', false)
    .eq('is_dev_circle', false)

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-12 lg:p-24 space-y-24 scroll-smooth selection:bg-gold selection:text-bg-primary">
      <header className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-border-custom pb-16 enter">
        <div className="space-y-6">
          <p className="label text-gold flex items-center gap-3">
             <span className="w-8 h-[1px] bg-gold"></span>
             DISCOVER / JOIN
          </p>
          <h1 className="heading-lg tracking-tight uppercase">The Directory.</h1>
          <p className="body max-w-sm text-text-tertiary">
            Small groups of collective intent. Scarcity is the engine of value.
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-6">
           <div className="text-right">
             <p className="label opacity-40">ACTIVE CIRCLES</p>
             <p className="heading-md">{totalCircleCount ?? 0} / 4</p>
           </div>
           <Link href="/circles/create" className="btn-primary px-10">
             Initialize New Circle
           </Link>
        </div>
      </header>

      {/* Grid - Asymmetric Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        {circles?.map((circle, idx) => {
          const isFeatured = idx === 0;
          const membershipCount = (circle.memberships?.[0] as any)?.count ?? 0;
          const isJoined = joinedCircleIds.has(circle.id);
          const isFull = membershipCount >= circle.member_limit;
          const genreKey = circle.genre.toLowerCase();

          return (
            <div 
              key={circle.id} 
              className={`group flex flex-col justify-between border-l border-border-custom transition-all duration-700 bg-bg-primary hover:bg-bg-surface p-8 space-y-12 ${isFeatured ? 'md:col-span-2' : ''}`}
              style={{
                borderLeftColor: `var(--border)`,
              }}
            >
              <div className="space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span 
                      className="badge border-none px-0 tracking-[0.2em]"
                      style={{ color: `var(--${genreKey})` }}
                    >
                      {circle.genre}
                    </span>
                    <h2 className={`font-ibm tracking-tight uppercase ${isFeatured ? 'text-5xl lg:text-6xl' : 'text-2xl'}`}>
                      {circle.name}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="label !text-[9px] opacity-40">Reputation</p>
                    <p className="text-2xl font-ibm text-gold">{circle.rep_score}</p>
                  </div>
                </div>
                
                <p className={`body font-inter ${isFeatured ? 'text-lg max-w-2xl' : 'text-sm text-text-secondary line-clamp-3'}`}>
                  {circle.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-8 pt-8 border-t border-border-custom/30">
                <div className="flex gap-12">
                  <div className="space-y-1">
                    <p className="label !text-[8px] opacity-40">FOUNDER</p>
                    <p className="text-xs uppercase tracking-widest text-text-primary">@{(circle.founder as any)?.handle || 'anon'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="label !text-[8px] opacity-40">CAPACITY</p>
                    <p className="text-xs uppercase tracking-widest text-text-primary">{membershipCount} / {circle.member_limit}</p>
                  </div>
                </div>

                <div className="w-full sm:w-auto">
                   {isJoined ? (
                     <div className="py-2 px-8 border border-gold/40 text-gold label text-center">JOINED</div>
                   ) : isFull ? (
                     <div className="py-2 px-8 border border-white/5 text-text-tertiary label text-center">FULL</div>
                   ) : (
                     <Link 
                      href={`/circles/${circle.id}`}
                      className="btn-primary w-full sm:w-auto py-2 text-center"
                     >
                       Apply
                     </Link>
                   )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
