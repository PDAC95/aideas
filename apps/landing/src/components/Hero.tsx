import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-20" />
      <div className="absolute top-1/4 -left-48 h-96 w-96 rounded-full bg-primary-500/30 blur-3xl" />
      <div className="absolute bottom-1/4 -right-48 h-96 w-96 rounded-full bg-accent-500/30 blur-3xl" />
      
      {/* Navigation */}
      <nav className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold">
            <span className="gradient-text">aideas</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#features" className="text-sm text-gray-300 transition hover:text-white">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm text-gray-300 transition hover:text-white">
              How it Works
            </Link>
            <Link href="/contact" className="text-sm text-gray-300 transition hover:text-white">
              Contact
            </Link>
          </div>
          <Link
            href="#cta"
            className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-gray-100"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm">
            <Sparkles className="h-4 w-4 text-primary-400" />
            <span className="text-sm text-gray-300">AI-Powered Automation for SMBs</span>
          </div>
          
          {/* Headline */}
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight md:text-5xl lg:text-6xl">
            Stop Wasting Money on{' '}
            <span className="gradient-text">Repetitive Tasks</span>
          </h1>
          
          {/* Subheadline */}
          <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-300 md:text-xl">
            AI automations that cost a fraction of what you pay for manual work. 
            24/7 solutions that work while you sleep.
          </p>
          
          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="#cta"
              className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 px-8 py-4 font-semibold text-white shadow-lg transition hover:shadow-xl hover:shadow-primary-500/25"
            >
              Start Free
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 font-semibold text-white transition hover:bg-white/5"
            >
              See How It Works
            </Link>
          </div>
          
          {/* Social proof */}
          <p className="mt-12 text-sm text-gray-400">
            Trusted by <span className="font-semibold text-white">100+</span> growing businesses
          </p>
        </div>
      </div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
