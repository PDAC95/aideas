import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Contact Us - aideas',
  description: 'Get in touch with the aideas team. We\'re here to help you automate your business.',
};

const contactInfo = [
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@aideas.com',
    href: 'mailto:hello@aideas.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+1 (555) 123-4567',
    href: 'tel:+15551234567',
  },
  {
    icon: MapPin,
    label: 'Office',
    value: 'Austin, TX',
  },
];

export default function ContactPage() {
  return (
    <>
      {/* Header */}
      <nav className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-2xl font-bold">
            <span className="gradient-text">aideas</span>
          </Link>
          <Link
            href="/"
            className="text-sm text-gray-600 transition hover:text-gray-900"
          >
            ← Back to Home
          </Link>
        </div>
      </nav>

      <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          {/* Page header */}
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className="text-lg text-gray-600">
              Have questions about our automation solutions? 
              We&apos;d love to hear from you. Send us a message and we&apos;ll respond within 24 hours.
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-12 lg:grid-cols-5">
            {/* Contact form */}
            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  Send us a message
                </h2>
                <ContactForm />
              </div>
            </div>

            {/* Contact info */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <h2 className="mb-6 text-xl font-semibold text-gray-900">
                  Contact Information
                </h2>
                <div className="space-y-6">
                  {contactInfo.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-gray-900 transition hover:text-primary-600"
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-gray-900">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* FAQ link */}
                <div className="mt-8 rounded-xl bg-gradient-to-br from-primary-50 to-accent-50 p-6">
                  <h3 className="mb-2 font-semibold text-gray-900">
                    Need quick answers?
                  </h3>
                  <p className="mb-4 text-sm text-gray-600">
                    Check out our frequently asked questions for instant help.
                  </p>
                  <Link
                    href="/#features"
                    className="inline-flex text-sm font-medium text-primary-600 hover:text-primary-700"
                  >
                    View Features →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
