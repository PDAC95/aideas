import { Zap, Bot, LineChart, Shield } from 'lucide-react';

const features = [
  {
    icon: Bot,
    title: 'AI-Powered Solutions',
    description:
      'Our automations use cutting-edge AI to understand context and deliver intelligent results 24/7.',
  },
  {
    icon: Zap,
    title: 'Ready in Days, Not Months',
    description:
      'Pre-built templates adapted to your needs. Go from request to live automation in record time.',
  },
  {
    icon: LineChart,
    title: 'Measurable ROI',
    description:
      'Track time saved, tasks completed, and money saved with our real-time analytics dashboard.',
  },
  {
    icon: Shield,
    title: 'Enterprise Security',
    description:
      'Bank-level encryption, 99.9% uptime, and dedicated support included in every plan.',
  },
];

export default function Features() {
  return (
    <section id="features" className="bg-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Everything You Need to{' '}
            <span className="gradient-text">Scale Efficiently</span>
          </h2>
          <p className="text-lg text-gray-600">
            Powerful AI automations designed specifically for growing businesses. 
            No technical expertise required.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl border border-gray-100 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
            >
              {/* Icon */}
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25">
                <feature.icon className="h-6 w-6" />
              </div>
              
              {/* Content */}
              <h3 className="mb-3 text-xl font-semibold text-gray-900">
                {feature.title}
              </h3>
              <p className="text-gray-600">{feature.description}</p>
              
              {/* Hover gradient border effect */}
              <div className="absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 opacity-0 transition group-hover:opacity-100" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
