import Link from 'next/link';
import { ArrowRight, CheckCircle } from 'lucide-react';

const benefits = [
  'No upfront development costs',
  'Cancel anytime',
  'Dedicated support team',
  '14-day free trial',
];

export default function CTA() {
  return (
    <section id="cta" className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 md:py-28">
      {/* Background decoration */}
      <div className="absolute -left-32 top-0 h-64 w-64 rounded-full bg-primary-500/30 blur-3xl" />
      <div className="absolute -right-32 bottom-0 h-64 w-64 rounded-full bg-accent-500/30 blur-3xl" />
      
      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-6 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
            Ready to Save Hours Every Week?
          </h2>
          <p className="mb-8 text-lg text-gray-300 md:text-xl">
            Join hundreds of businesses already saving time and money with AI automation. 
            Start your free trial today.
          </p>
          
          {/* Benefits list */}
          <div className="mb-10 flex flex-wrap justify-center gap-4">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white backdrop-blur-sm"
              >
                <CheckCircle className="h-4 w-4 text-green-400" />
                {benefit}
              </div>
            ))}
          </div>
          
          {/* CTA buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-slate-900 shadow-lg transition hover:shadow-xl"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 font-semibold text-white transition hover:bg-white/5"
            >
              Talk to Sales
            </Link>
          </div>
          
          <p className="mt-6 text-sm text-gray-400">
            No credit card required. Free 14-day trial.
          </p>
        </div>
      </div>
    </section>
  );
}
