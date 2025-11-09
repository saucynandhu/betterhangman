import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col items-center justify-center flex-1">
      <div className="w-full max-w-md space-y-8">
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Better Hangman
          </h1>
          <p className="text-muted-foreground">
            The AI is thinking of a word. Each wrong guess brings YOU closer to hanging.
          </p>
        </header>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-center">Choose Your Mode</h2>
          
          <div className="space-y-3">
            <Link
              href="/game?mode=hard"
              className="block p-6 bg-card border rounded-xl hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="text-5xl mb-3">💪</div>
              <h3 className="text-xl font-semibold mb-1">Hard</h3>
              <p className="text-sm text-muted-foreground">6 wrong guesses allowed</p>
            </Link>

            <Link
              href="/game?mode=impossible"
              className="block p-6 bg-card border rounded-xl hover:border-destructive/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="text-5xl mb-3">🔥</div>
              <h3 className="text-xl font-semibold mb-1">Impossible</h3>
              <p className="text-sm text-muted-foreground">4 wrong guesses allowed</p>
            </Link>

            <Link
              href="/game?mode=kitten"
              className="block p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border border-border rounded-xl hover:border-primary/50 transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
            >
              <div className="flex flex-col items-center">
                <div className="text-5xl mb-3">🐱</div>
                <span className="text-xs px-2 py-1 bg-primary/20 text-primary-foreground rounded-full mb-2 font-medium">
                  SPECIAL MODE
                </span>
                <h3 className="text-xl font-semibold mb-1">Kitten Mode</h3>
                <p className="text-sm text-muted-foreground text-center">
                  The AI adapts and changes the word on wrong guesses.
                </p>
              </div>
            </Link>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          {user ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/leaderboard"
                  className="btn btn-secondary flex items-center justify-center gap-2"
                >
                  <span>🏆</span> Leaderboard
                </Link>
                <Link
                  href="/profile"
                  className="btn btn-secondary flex items-center justify-center gap-2"
                >
                  <span>👤</span> Profile
                </Link>
              </div>
              <form action="/auth/logout" method="post" className="w-full">
                <button
                  type="submit"
                  className="btn btn-destructive w-full"
                >
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/login"
                  className="btn btn-secondary"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="btn btn-primary"
                >
                  Sign Up
                </Link>
              </div>
              <Link
                href="/game?mode=hard&guest=true"
                className="btn btn-outline w-full"
              >
                Play as Guest
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
