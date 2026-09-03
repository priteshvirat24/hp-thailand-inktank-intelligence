import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'HP Thailand Ink Tank Competitive Intelligence',
  description: 'Evidence-based competitive intelligence platform for HP vs Epson vs Canon vs Brother in Thailand.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="light-theme">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {children}
      </body>
    </html>
  );
}
