import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DevDashboardPage() {
  const supabase = await createClient()

  // Strict Auth Check
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/dev')

  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', user.id)
    .eq('role', 'dev')
    .single()

  if (!membership) return redirect('/dev')

  // Fetch Settings
  const { data: settings } = await supabase
    .from('admin_settings')
    .select('*')
    .single()

  return (
    <div className="flex min-h-screen bg-bg-primary text-text-primary font-ibm selection:bg-gold selection:text-bg-primary">
      {/* Dev Dashboard Sidebar */}
      <aside className="w-64 border-r border-border-custom p-8 sticky top-0 h-screen hidden lg:block">
        <p className="label mb-12 text-gold">SC // COMMAND</p>
        <nav className="space-y-8">
          <div className="space-y-4">
            <p className="label tracking-[0.2em] opacity-30 text-[9px]">SYSTEMS</p>
            <a href="#controls" className="block text-xs uppercase tracking-widest hover:text-gold transition-colors">Controls</a>
            <a href="#metrics" className="block text-xs uppercase tracking-widest hover:text-gold transition-colors">Metrics</a>
          </div>
          <div className="space-y-4">
            <p className="label tracking-[0.2em] opacity-30 text-[9px]">REGISTRY</p>
            <a href="#users" className="block text-xs uppercase tracking-widest hover:text-gold transition-colors">User Ops</a>
            <a href="#circles" className="block text-xs uppercase tracking-widest hover:text-gold transition-colors">Circles</a>
          </div>
          <div className="space-y-4">
            <p className="label tracking-[0.2em] opacity-30 text-[9px]">CONTENT</p>
            <a href="#moderation" className="block text-xs uppercase tracking-widest hover:text-gold transition-colors">Drops Mod</a>
            <a href="#leaderboard" className="block text-xs uppercase tracking-widest hover:text-gold transition-colors">Arena Force</a>
          </div>
          <div className="space-y-4">
            <p className="label tracking-[0.2em] opacity-30 text-[9px]">FILES</p>
            <a href="#audit" className="block text-xs uppercase tracking-widest hover:text-gold transition-colors">Action Log</a>
          </div>
        </nav>
      </aside>

      <main className="flex-1 p-8 lg:p-12 overflow-y-auto space-y-24">
        <header className="flex justify-between items-start">
          <div className="space-y-2">
            <p className="label text-gold">IDENTIFIED :: {user.email}</p>
            <h1 className="heading-md !tracking-widest">Admin Dashboard</h1>
          </div>
          <div className="text-right space-y-1">
            <p className="label">Access Level</p>
            <p className="text-xs uppercase bg-bg-surface px-3 py-1 border border-border-custom text-gold">SUPERUSER</p>
          </div>
        </header>

        {/* Section 1: Platform Controls */}
        <section id="controls" className="space-y-8">
          <div className="flex items-center gap-4">
             <div className="h-[1px] flex-1 bg-border-custom"></div>
             <p className="label text-gold">01 // PLATFORM CONTROLS</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card space-y-4">
              <p className="label">Platform Live</p>
              <div className="flex items-center justify-between">
                <span className={settings?.platform_live ? 'text-upvote text-xs' : 'text-downvote text-xs'}>
                  {settings?.platform_live ? 'ONLINE' : 'OFFLINE'}
                </span>
                <div className={`w-8 h-1 ${settings?.platform_live ? 'bg-upvote' : 'bg-downvote'}`}></div>
              </div>
            </div>
            <div className="card space-y-4">
              <p className="label">New Signups</p>
              <div className="flex items-center justify-between">
                <span className={settings?.allow_signups ? 'text-upvote text-xs' : 'text-downvote text-xs'}>
                  {settings?.allow_signups ? 'OPEN' : 'CLOSED'}
                </span>
                <div className={`w-8 h-1 ${settings?.allow_signups ? 'bg-upvote' : 'bg-downvote'}`}></div>
              </div>
            </div>
            <div className="card space-y-4">
              <p className="label">Circle Create</p>
              <div className="flex items-center justify-between">
                <span className={settings?.allow_circle_create ? 'text-upvote text-xs' : 'text-downvote text-xs'}>
                  {settings?.allow_circle_create ? 'ENABLED' : 'PAUSED'}
                </span>
                <div className={`w-8 h-1 ${settings?.allow_circle_create ? 'bg-upvote' : 'bg-downvote'}`}></div>
              </div>
            </div>
            <div className="card space-y-4">
              <p className="label">Max Circles</p>
              <div className="flex items-end justify-between">
                <span className="text-2xl">{settings?.max_circles ?? 4}</span>
                <button className="text-[10px] text-text-tertiary hover:text-gold transition-colors border-b border-text-tertiary/20">EDIT</button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Metrics */}
        <section id="metrics" className="space-y-8">
           <div className="flex items-center gap-4">
             <div className="h-[1px] flex-1 bg-border-custom"></div>
             <p className="label text-gold">02 // METRICS OVERVIEW</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { label: 'Total Users', value: '...' },
              { label: 'Active Today', value: '...' },
              { label: 'Total Drops', value: '...' },
              { label: 'Total Votes', value: '...' },
              { label: 'Active Circles', value: '...' }
            ].map((stat, idx) => (
              <div key={idx} className="card p-5">
                <p className="label text-[9px] mb-2">{stat.label}</p>
                <p className="text-xl">{stat.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="footer" className="pt-20 opacity-20 text-center space-y-4">
           <p className="label">SECRET CIRCLES ENGINE // V1.0</p>
           <p className="text-[10px]">ALL ACTIONS LOGGED INDELIBLY.</p>
        </section>
      </main>
    </div>
  )
}
