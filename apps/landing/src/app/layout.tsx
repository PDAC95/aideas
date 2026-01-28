import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'aideas - AI Automation for SMBs',
  description: 'Affordable AI automations that work 24/7. Save thousands on repetitive tasks with our ready-to-deploy solutions.',
  keywords: ['AI automation', 'SMB', 'business automation', 'artificial intelligence', 'process automation'],
  openGraph: {
    title: 'aideas - AI Automation for SMBs',
    description: 'Affordable AI automations that work 24/7. Save thousands on repetitive tasks.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
