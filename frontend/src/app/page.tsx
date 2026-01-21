import Link from "next/link";
import { ArrowRight, Hexagon, Target, Users, Zap, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[#05050A] text-white selection:bg-purple-500/30 overflow-x-hidden relative">

      {/* BACKGROUND: Clean Premium Gradients (No Grid) */}
      <div className="fixed inset-0 z-0 pointer-events-none">

        {/* Deep Atmospheric Glow - Bottom Right */}
        <div className="absolute bottom-[-20%] right-[-10%] w-[80vw] h-[80vw] bg-purple-900/20 blur-[150px] rounded-full mix-blend-screen animate-pulse-slow" />

        {/* Sharp Accent - Top Left */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/20 blur-[120px] rounded-full mix-blend-screen" />

      </div>

      {/* NAVBAR */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative">
            <div className="absolute inset-0 bg-purple-500 blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
            <Hexagon className="relative w-8 h-8 text-white fill-white/5" strokeWidth={1.5} />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight">CreatorConnect</span>
        </div>

        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="hidden md:block text-sm font-medium text-gray-400 hover:text-white transition-colors">SignIn</Link>
          <Link
            href="#path"
            className="px-6 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-100 transition-colors shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)]"
          >
            Launch App
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-20 pb-32 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">

        {/* Pill Badge */}
        <div className="animate-fade-in-up mb-8 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-300">Live on Scroll Sepolia</span>
        </div>

        {/* Massive Typography */}
        <h1 className="font-outfit font-bold text-6xl md:text-8xl lg:text-[7rem] leading-[0.9] tracking-tight text-white mb-8 max-w-5xl mx-auto bg-gradient-to-b from-white via-white to-white/50 bg-clip-text text-transparent">
          Create. Verify. <br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Get Paid.</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-gray-400 max-w-2xl mb-12 leading-relaxed font-light">
          The first trustless collaboration protocol. <br className="hidden md:block" />
          Brands stream stablecoins. AI Agents verify the work.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <Link
            href="#path"
            className="group relative px-8 py-4 rounded-full bg-purple-600 text-white font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.5)]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative flex items-center gap-2">
              Start Creating <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2 text-lg font-medium">
            View Documentation
          </Link>
        </div>

        {/* ROLE SELECTION SECTION */}
        <div id="path" className="mt-32 w-full max-w-5xl scroll-mt-24">
          <h2 className="text-sm font-bold text-purple-400 uppercase tracking-[0.3em] mb-12">Choose Your Path</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">

            {/* Brand Card */}
            <Link
              href="/dashboard?role=brand"
              className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-purple-500/50 transition-all hover:bg-white/[0.05] overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full group-hover:bg-purple-500/20 transition-colors" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 border border-purple-500/30">
                  <Target className="w-7 h-7 text-purple-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Enterprise Brand</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Launch campaigns, manage budgets, and use AI agents to verify content performance at scale.
                </p>
                <div className="flex items-center gap-2 text-purple-400 font-bold group-hover:gap-4 transition-all uppercase tracking-widest text-xs">
                  Enter Brand Suite <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

            {/* Creator Card */}
            <Link
              href="/dashboard?role=creator"
              className="group relative p-8 rounded-3xl bg-white/[0.03] border border-white/5 hover:border-cyan-500/50 transition-all hover:bg-white/[0.05] overflow-hidden"
            >
              <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 blur-[80px] rounded-full group-hover:bg-cyan-500/20 transition-colors" />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 border border-cyan-500/30">
                  <Users className="w-7 h-7 text-cyan-400" />
                </div>
                <h3 className="text-3xl font-bold text-white mb-3">Content Creator</h3>
                <p className="text-gray-400 text-lg leading-relaxed mb-8">
                  Discover top-tier brand deals, submit your work, and get paid instantly in stablecoins.
                </p>
                <div className="flex items-center gap-2 text-cyan-400 font-bold group-hover:gap-4 transition-all uppercase tracking-widest text-xs">
                  Enter Creator Studio <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>

          </div>
        </div>

      </section>

      {/* MINIMAL FEATURES - Text Focused */}
      <section className="py-24 border-t border-white/5 relative bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16">

          {/* Feature 1 */}
          <div className="space-y-4">
            <h3 className="font-outfit text-3xl font-bold text-white">Trustless Payments</h3>
            <p className="text-lg text-gray-400 leading-relaxed">
              Escrow smart contracts hold the funds. Money is released automatically when work is verified. No invoices, no chasing.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="space-y-4">
            <h3 className="font-outfit text-3xl font-bold text-white">AI Verification</h3>
            <p className="text-lg text-gray-400 leading-relaxed">
              Our neural agents scan social platforms in real-time. They verify views, likes, and content authenticity instantly.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="space-y-4">
            <h3 className="font-outfit text-3xl font-bold text-white">Stable Income</h3>
            <p className="text-lg text-gray-400 leading-relaxed">
              All contracts are denominated in USDC/MNEE. Build your career on stable ground, not volatile tokens.
            </p>
          </div>

        </div>
      </section>

      {/* FOOTER - Simple */}
      <footer className="py-12 text-center text-sm text-gray-600 border-t border-white/5">
        <p>&copy; 2025 CreatorConnect. Define the Future.</p>
      </footer>

    </main>
  );
}
