import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-4xl w-full text-center space-y-8 relative z-10 animate-slide-in">
        <div className="space-y-4">
          <h1 className="text-7xl font-black text-white mb-4 tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
            Better Hangman
          </h1>
          <p className="text-xl text-gray-400 mb-4 max-w-2xl mx-auto">
            The AI is thinking of a word. Each wrong guess brings YOU closer to hanging.
          </p>
        </div>

        <div className="glass rounded-3xl p-8 md:p-12 space-y-8 shadow-2xl">
          <h2 className="text-3xl font-bold text-white mb-8">Choose Your Mode</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/game?mode=hard"
              className="group relative block p-8 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl hover:border-purple-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20"
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">💪</div>
              <div className="text-2xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors">Hard</div>
              <div className="text-sm text-gray-400">6 wrong guesses allowed</div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 to-purple-500/0 group-hover:from-purple-500/10 group-hover:to-transparent transition-all duration-300"></div>
            </Link>

            <Link
              href="/game?mode=impossible"
              className="group relative block p-8 bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-2xl hover:border-red-500/50 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-red-500/20"
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">🔥</div>
              <div className="text-2xl font-bold text-white mb-3 group-hover:text-red-400 transition-colors">Impossible</div>
              <div className="text-sm text-gray-400">4 wrong guesses allowed</div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/0 to-red-500/0 group-hover:from-red-500/10 group-hover:to-transparent transition-all duration-300"></div>
            </Link>

            <Link
              href="/game?mode=kitten"
              className="group relative block p-8 bg-gradient-to-br from-gray-900 to-gray-800 border-2 border-pink-500/30 rounded-2xl hover:border-pink-500/70 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-pink-500/30 md:col-span-2 animate-pulse-glow"
            >
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-5xl transform group-hover:scale-110 transition-transform">🐱</div>
                <div className="text-xs px-3 py-1 bg-pink-500/20 text-pink-400 rounded-full border border-pink-500/30">
                  SPECIAL MODE
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors">Kitten Mode</div>
              <div className="text-sm text-gray-400">
                The AI adapts and changes the word on wrong guesses. 6 wrong guesses allowed.
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-pink-500/0 to-purple-500/0 group-hover:from-pink-500/10 group-hover:to-purple-500/10 transition-all duration-300"></div>
            </Link>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          {user ? (
            <>
              <Link
                href="/leaderboard"
                className="btn-secondary px-6 py-3 rounded-xl font-semibold text-white"
              >
                🏆 Leaderboards
              </Link>
              <Link
                href="/profile"
                className="btn-secondary px-6 py-3 rounded-xl font-semibold text-white"
              >
                👤 Profile
              </Link>
              <form action="/auth/logout" method="post">
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-semibold hover:bg-red-500/20 hover:border-red-500/50 transition-all"
                >
                  Logout
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="btn-primary px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="btn-secondary px-8 py-3 rounded-xl font-semibold text-white"
              >
                Sign Up
              </Link>
              <Link
                href="/game?mode=hard&guest=true"
                className="btn-secondary px-8 py-3 rounded-xl font-semibold text-white"
              >
                Play as Guest
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
