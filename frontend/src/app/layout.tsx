import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import AuthModal from '@/components/AuthModal';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'AuraEstate | Premium Real Estate Platform',
  description: 'Search, discover, and inquire about premium properties. Optimized clone of 99acres and NoBroker with lightning fast performance.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100 font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 flex flex-col">{children}</main>
          
          {/* Global Footer */}
          <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-sm text-slate-500">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <p className="mb-2">© {new Date().getFullYear()} AuraEstate Inc. All rights reserved.</p>
              <div className="flex justify-center gap-4 text-xs">
                <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
                <span>•</span>
                <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
                <span>•</span>
                <a href="#" className="hover:text-slate-400 transition-colors">Sitemap</a>
              </div>
            </div>
          </footer>

          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
