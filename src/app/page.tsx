import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0F0F10] text-[#F0EDE8] flex flex-col items-center justify-center p-6 relative overflow-hidden selection:bg-gold selection:text-bg-primary">
      {/* Background Particles Placeholder / Effect */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-gold/5 rounded-full blur-[100px] animate-pulse delay-700"></div>
      </div>

      <div className="z-10 w-full max-w-4xl space-y-24 text-center enter">
        <header className="space-y-6">
           <p className="label text-gold tracking-[0.5em] animate-fade-in uppercase !text-[10px]">Welcome to the Archive</p>
           <h1 className="heading-xl !text-7xl md:!text-9xl uppercase tracking-tighter !leading-[0.85] animate-slide-up">
              The Engine <br/> of Scarcity.
           </h1>
        </header>

        <p className="body-sm max-w-lg mx-auto leading-relaxed text-text-tertiary uppercase tracking-[0.2em] animate-fade-in delay-500 !text-[11px]">
           Small groups compete in a public arena feed. Access is scarce. <br className="hidden md:block" /> Identity has weight. Status is visible.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-12 animate-fade-in delay-1000 pt-8">
           <Link 
            href="/signup" 
            className="btn-primary px-16 py-5 !text-[12px] font-bold shadow-[0_0_50px_rgba(201,169,110,0.15)] hover:shadow-[0_0_70px_rgba(201,169,110,0.3)] transition-all"
           >
             Request Access
           </Link>
           <Link 
            href="/login" 
            className="label !text-text-tertiary hover:text-white transition-opacity border-b border-transparent hover:border-white/20 pb-1 tracking-[0.3em] !text-[10px]"
           >
             Sign In
           </Link>
        </div>

        <footer className="pt-32 opacity-20 flex flex-col items-center gap-6">
           <div className="w-px h-20 bg-white/20"></div>
           <p className="label !text-[8px] tracking-[0.4em]">SECRET CIRCLES // SCHOOL EXCLUSIVE // V1.0</p>
        </footer>
      </div>
    </main>
  );
}
