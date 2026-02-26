import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If logged in, redirect to dashboard
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">AIDEAS</h1>
        <nav className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium hover:text-blue-600 transition-colors"
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className="text-sm font-medium bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-5xl font-bold tracking-tight mb-6">
          AI Automations for Your Business
        </h2>
        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          Eliminate repetitive tasks and optimize your operations with custom AI solutions.
          We handle everything — you focus on growing your business.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/signup"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className="border border-gray-300 px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Sign In
          </Link>
        </div>

        {/* Features */}
        <div className="mt-24 grid md:grid-cols-3 gap-8 text-left">
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border">
            <span className="text-4xl mb-4 block">⚡</span>
            <h3 className="text-xl font-semibold mb-2">Custom Automations</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Tell us your needs, we build the solution. No technical knowledge required.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border">
            <span className="text-4xl mb-4 block">📊</span>
            <h3 className="text-xl font-semibold mb-2">Real-time Monitoring</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Track your automations performance and ROI from a simple dashboard.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-white dark:bg-gray-800 shadow-sm border">
            <span className="text-4xl mb-4 block">💬</span>
            <h3 className="text-xl font-semibold mb-2">Direct Support</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Chat with our team anytime. We&apos;re here to help you succeed.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-500 text-sm">
        <p>&copy; 2026 AIDEAS. All rights reserved.</p>
      </footer>
    </div>
  );
}
