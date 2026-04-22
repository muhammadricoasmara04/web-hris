import { ArrowRight, Users, Sparkles, Activity, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Dynamic Background Elements */}
      <div className="glow-effect w-[600px] h-[600px] bg-blue-600/20 top-[-20%] left-[-10%] rounded-full animate-float"></div>
      <div className="glow-effect w-[500px] h-[500px] bg-purple-600/20 bottom-[-10%] right-[-5%] rounded-full animate-float" style={{ animationDelay: '2s' }}></div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass border-b-0 border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-2 rounded-xl">
            <Users className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-foreground">NextHRIS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground pt-1">
          <Link href="#features" className="hover:text-foreground transition-colors text-zinc-500 dark:text-zinc-400">Features</Link>
          <Link href="#solutions" className="hover:text-foreground transition-colors text-zinc-500 dark:text-zinc-400">Solutions</Link>
          <Link href="#pricing" className="hover:text-foreground transition-colors text-zinc-500 dark:text-zinc-400">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium hover:text-foreground transition-colors text-zinc-600 dark:text-zinc-300">
            Sign In
          </Link>
          <Link href="/register" className="bg-foreground text-background px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-opacity-90 transition-all hover:scale-105 active:scale-95 flex items-center gap-2">
            Get Started <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <Sparkles className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">The Future of HR Management</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl mb-8 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Elevate Your Workforce with <br className="hidden md:block" />
          <span className="text-gradient">Intelligent HRIS</span>
        </h1>
        
        <p className="text-lg md:text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mb-12 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
          Streamline payroll, optimize talent acquisition, and empower your team with a platform designed for modern, ambitious enterprises.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <Link href="/demo" className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg hover:shadow-purple-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2">
            Request Demo <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/features" className="glass px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/5 transition-all text-zinc-800 dark:text-zinc-100 flex items-center justify-center gap-2">
            Explore Features
          </Link>
        </div>

        {/* Dashboard Preview */}
        <div className="mt-20 w-full max-w-5xl relative animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-black/50 backdrop-blur-sm p-2 shadow-2xl overflow-hidden glass relative">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/50 bg-zinc-100/50 dark:bg-zinc-900/50 rounded-t-xl">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 h-[400px]">
              {/* Fake dashboard cards inside */}
              <div className="flex flex-col gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-zinc-500">Total Employees</span>
                    <Users className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="text-3xl font-bold text-foreground">1,248</div>
                  <div className="text-xs text-green-500 mt-2 flex items-center gap-1">+12% from last month</div>
                </div>
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-zinc-500">Activity</span>
                    <Activity className="w-4 h-4 text-purple-500" />
                  </div>
                  <div className="w-full h-32 flex items-end gap-2 px-2">
                    {[40, 70, 45, 90, 65, 85, 100].map((height, i) => (
                      <div key={i} className="flex-1 bg-gradient-to-t from-blue-500/20 to-purple-500/60 rounded-t-sm" style={{ height: `${height}%` }}></div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="col-span-1 md:col-span-2 flex flex-col gap-6">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm h-full flex flex-col">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-sm font-medium text-zinc-500">Recent Onboarding</span>
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                  </div>
                  <div className="flex-1 flex flex-col justify-center items-center opacity-50 dark:opacity-30">
                     <Zap className="w-12 h-12 text-zinc-400 mb-4" />
                     <p className="text-zinc-500 font-medium">Dashboard Data Rendered</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
