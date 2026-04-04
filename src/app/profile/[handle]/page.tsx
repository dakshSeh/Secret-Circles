import { createClient } from '@/utils/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default async function ProfilePage({ params }: { params: Promise<{ handle: string }> }) {
  const supabase = await createClient()
  const { handle } = await params

  // 1. Fetch User Data
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select(`
      *,
      memberships(
        role,
        circle:circles(id, name, genre, rep_score)
      ),
      drops(
        id,
        type,
        content,
        score,
        created_at,
        circle:circles(name)
      )
    `)
    .eq('handle', handle.toLowerCase())
    .single()

  if (profileError || !profile) return notFound()

  // 2. Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  const isOwnProfile = user?.id === profile.id

  const sortedDrops = (profile.drops as any[])?.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ) || []

  return (
    <main className="min-h-screen bg-bg-primary text-text-primary p-6 md:p-12 lg:p-24 selection:bg-gold selection:text-bg-primary">
      <div className="max-w-6xl mx-auto space-y-32">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-16 border-b border-border-custom pb-20 enter">
           <div className="space-y-8">
              <p className="label text-gold tracking-[0.4em] !text-[10px]">USER_AUTH // {profile.id.slice(0, 8)}</p>
              <h1 className="heading-xl uppercase !text-7xl lg:!text-9xl tracking-tighter">@{profile.handle}</h1>
              <div className="flex gap-8 items-center">
                 {profile.real_name && <p className="body-sm opacity-40 uppercase tracking-[0.2em] !text-[11px] font-ibm">{profile.real_name}</p>}
                 <span className="w-12 h-px bg-border-custom"></span>
                 <p className="label !text-[9px] opacity-40">ESTABLISHED {new Date(profile.created_at).getFullYear()}</p>
              </div>
           </div>
           
           <div className="text-right flex items-end gap-16">
              <div className="space-y-2">
                 <p className="label !text-[10px] opacity-30 tracking-[0.3em]">SIGNAL STATUS</p>
                 <p className="text-7xl lg:text-8xl font-ibm text-gold tracking-tighter shadow-gold/20 drop-shadow-2xl">{profile.rep_score}</p>
              </div>
              {isOwnProfile && (
                <div className="space-y-2 pb-1">
                   <p className="label !text-[10px] opacity-30 text-upvote tracking-[0.3em]">QUOTA</p>
                   <p className="text-5xl font-ibm text-upvote/80">{profile.invite_quota}</p>
                </div>
              )}
           </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-24">
           {/* Column Left: Collectives */}
           <div className="lg:col-span-4 space-y-16">
              <div className="space-y-10">
                 <div className="flex items-center gap-4">
                    <p className="label text-gold tracking-[0.3em] !text-[11px]">COLLECTIVES // {profile.memberships?.length}</p>
                    <div className="flex-1 h-px bg-border-custom/50"></div>
                 </div>
                 <div className="space-y-3">
                    {profile.memberships?.map((m: any, idx: number) => (
                      <Link 
                        key={idx} 
                        href={`/circles/${m.circle.id}`}
                        className="flex justify-between items-center group bg-bg-surface/10 p-5 border border-border-custom/30 hover:border-gold/40 transition-all duration-500"
                      >
                         <div className="space-y-2">
                            <p className="text-sm font-ibm uppercase text-text-primary group-hover:text-gold tracking-widest transition-colors">{m.circle.name}</p>
                            <p className="text-[9px] label opacity-30 tracking-widest uppercase">{m.role}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-xs font-ibm text-gold">{m.circle.rep_score}</p>
                         </div>
                      </Link>
                    ))}
                 </div>
              </div>
              
              {isOwnProfile && (
                 <div className="card !bg-bg-surface/50 p-8 space-y-6 border-gold/10">
                    <p className="label !text-gold tracking-[0.2em]">IDENTITY CONFIG</p>
                    <p className="body-sm opacity-40 leading-relaxed uppercase !text-[10px]">Your personal signal is the weighted average of your arena transmissions. Distribution is permanent.</p>
                    <button className="btn-primary w-full py-3 !text-[9px] tracking-widest">Update Signature</button>
                    <button className="body-sm w-full text-center py-2 opacity-30 hover:opacity-100 transition-opacity text-[9px] tracking-widest">Sign Out</button>
                 </div>
              )}
           </div>

           {/* Column Right: Log */}
           <div className="lg:col-span-8 space-y-16">
              <div className="flex items-center gap-4">
                 <p className="label text-gold tracking-[0.3em] !text-[11px]">TRANSMISSION HISTORY</p>
                 <div className="flex-1 h-px bg-border-custom/50"></div>
              </div>
              
              <div className="space-y-10">
                 {sortedDrops.map((drop: any, idx: number) => (
                    <div key={idx} className="flex gap-10 group enter border-b border-border-custom/10 pb-10 last:border-0">
                       <div className="pt-3">
                          <div className="w-2.5 h-2.5 rotate-45 border border-white/10 group-hover:bg-gold group-hover:border-gold transition-all duration-1000 shadow-[0_0_15px_rgba(201,169,110,0)] group-hover:shadow-[0_0_15px_rgba(201,169,110,0.4)]"></div>
                       </div>
                       <div className="flex-1 space-y-4">
                          <div className="flex justify-between items-center">
                             <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                                <span className="label !text-[9px] text-text-tertiary opacity-50">{new Date(drop.created_at).toLocaleDateString()}</span>
                                <span className="label !text-gold !text-[10px] uppercase tracking-[0.2em]">{drop.type}</span>
                                <span className="label !text-text-primary !text-[9px] tracking-widest opacity-80 decoration-gold/30 underline-offset-4 underline">{drop.circle?.name}</span>
                             </div>
                             <div className="flex flex-col items-end">
                                <p className="font-ibm text-lg text-gold tracking-tight">{drop.score >= 0 ? '+' : ''}{drop.score}</p>
                                <p className="label !text-[8px] opacity-20">SIGNAL</p>
                             </div>
                          </div>
                          <p className="body leading-relaxed text-[#F0EDE8]/80 group-hover:text-white transition-colors !text-[15px]">
                             {drop.content}
                          </p>
                       </div>
                    </div>
                 ))}
                 
                 {sortedDrops.length === 0 && (
                    <div className="py-32 text-center opacity-20 grayscale border-2 border-dashed border-border-custom/50">
                       <div className="mb-6 w-12 h-12 border border-white/20 mx-auto rotate-45 flex items-center justify-center">
                          <div className="w-6 h-6 border border-white/10"></div>
                       </div>
                       <p className="label tracking-[0.3em]">NO PUBLIC TRANSMISSIONS RECORDED</p>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </div>
    </main>
  )
}
