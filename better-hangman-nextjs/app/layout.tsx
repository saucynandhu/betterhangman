import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { Toaster } from 'sonner';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'Better Hangman',
  description: 'The ultimate hangman game with AI adaptation',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased min-h-screen flex flex-col`}>
        <Toaster position="top-center" richColors />
        <nav className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="text-xl font-bold text-foreground">
                  Better Hangman
                </Link>
              </div>
              <div className="flex items-center space-x-4">
                {user ? (
                  <>
                    <Link 
                      href="/leaderboard" 
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Leaderboard
                    </Link>
                    <Link 
                      href="/profile" 
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Profile
                    </Link>
                    <form action="/auth/logout" method="post">
                      <button 
                        type="submit"
                        className="text-sm font-medium text-destructive hover:text-destructive/80 transition-colors"
                      >
                        Logout
                      </button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/signup" 
                      className="px-3 py-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </nav>
        
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>
        
        <footer className="border-t border-border bg-background/80 py-6 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Better Hangman {new Date().getFullYear()}
              </p>
              <div className="mt-2 text-xs text-muted-foreground/80">
                <p>Created by nandhu_sauce & zayn</p>
                <p className="mt-1 text-muted-foreground/60">Chief Muse: nivedya raj</p>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
