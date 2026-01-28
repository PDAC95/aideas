import { MessageSquare, Wrench, Rocket } from 'lucide-react';

const steps = [
  {
    number: '01',
    icon: MessageSquare,
    title: 'Describe Your Need',
    description:
      'Tell us about the repetitive tasks eating your time. Our AI helps document your requirements.',
  },
  {
    number: '02',
    icon: Wrench,
    title: 'We Build It',
    description:
      'Our team adapts a proven template to your specific needs. Fast, reliable, tested.',
  },
  {
    number: '03',
    icon: Rocket,
    title: 'Your Business Grows',
    description:
      'Watch your automation work 24/7. Track results, save time, and scale with confidence.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-gradient-to-b from-gray-50 to-white py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        {/* Section header */}
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Simple Process,{' '}
            <span className="gradient-text">Powerful Results</span>
          </h2>
          <p className="text-lg text-gray-600">
            Getting started with AI automation has never been easier. 
            Three steps to transform your operations.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-primary-200 via-primary-400 to-accent-400 md:block lg:hidden" />
          <div className="absolute top-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-primary-200 via-primary-400 to-accent-400 lg:block" />
          
          <div className="relative grid gap-12 md:gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={index}
                className="group relative flex flex-col items-center text-center"
              >
                {/* Step number badge */}
                <div className="relative mb-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-xl ring-1 ring-gray-100">
                    <step.icon className="h-8 w-8 text-primary-500" />
                  </div>
                  <span className="absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-accent-500 text-xs font-bold text-white shadow-lg">
                    {step.number}
                  </span>
                </div>
                
                {/* Content */}
                <h3 className="mb-3 text-xl font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="max-w-xs text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
