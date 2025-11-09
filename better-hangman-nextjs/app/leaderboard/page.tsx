import { createClient } from '@/lib/supabase/server';
import { 
  getGlobalLeaderboard, 
  getLocalLeaderboard, 
  getFriendsLeaderboard,
  type LeaderboardEntry
} from '@/lib/db/queries';
import type { GameMode } from '@/lib/game/types';
import Leaderboard from '@/components/leaderboard/Leaderboard';
import Link from 'next/link';

interface PageProps {
  searchParams: { mode?: string; type?: string };
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Ensure searchParams is an object with the expected properties
  const params = await Promise.resolve(searchParams);
  const mode = (params.mode || 'hard') as GameMode;
  const type = (params.type || 'global') as 'global' | 'local' | 'friends';

  // Initialize with proper type
  let entries: LeaderboardEntry[] = [];
  
  try {
    switch (type) {
      case 'global':
        entries = await getGlobalLeaderboard(mode);
        break;
      case 'local':
        entries = await getLocalLeaderboard(mode);
        break;
      case 'friends':
        entries = user ? await getFriendsLeaderboard(user.id, mode) : [];
        break;
      default:
        entries = [];
    }
  } catch (error) {
    console.error('Error fetching leaderboard data:', error);
    entries = [];
  }

  return (
    <div className="min-h-screen w-full px-3 py-4 sm:px-4 sm:py-6 md:px-6 lg:px-8 relative overflow-x-hidden">
      {/* Background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 sm:w-96 sm:h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10 w-full">
        {/* Header section */}
        <div className="mb-4 sm:mb-6 md:mb-8">
          <Link
            href="/"
            className="inline-flex items-center text-sm sm:text-base text-gray-400 hover:text-white transition-colors mb-2 sm:mb-3 font-medium"
          >
            <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="truncate">Back to home</span>
          </Link>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white mb-1 sm:mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Leaderboards
          </h1>
          <p className="text-xs sm:text-sm text-gray-400">Compete with players worldwide</p>
        </div>

        {/* Filter controls */}
        <div className="mb-4 sm:mb-6 space-y-2">
          {/* Difficulty filter */}
          <div className="glass rounded-xl p-1 border border-gray-700/50 flex overflow-x-auto no-scrollbar">
            {(['hard', 'impossible', 'kitten'] as const).map((m) => (
              <Link
                key={m}
                href={`/leaderboard?mode=${m}&type=${type}`}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition whitespace-nowrap flex-shrink-0 ${
                  mode === m
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Link>
            ))}
          </div>
          
          {/* Leaderboard type filter */}
          <div className="glass rounded-xl p-1 border border-gray-700/50 flex overflow-x-auto no-scrollbar">
            <Link
              href={`/leaderboard?mode=${mode}&type=global`}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition whitespace-nowrap flex-shrink-0 ${
                type === 'global'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Global
            </Link>
            <Link
              href={`/leaderboard?mode=${mode}&type=local`}
              className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition whitespace-nowrap flex-shrink-0 ${
                type === 'local'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Local
            </Link>
            {user ? (
              <Link
                href={`/leaderboard?mode=${mode}&type=friends`}
                className={`px-3 py-2 sm:px-4 sm:py-2 rounded-lg font-semibold text-xs sm:text-sm transition whitespace-nowrap flex-shrink-0 ${
                  type === 'friends'
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                Friends
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm text-gray-400 hover:text-white transition-colors font-semibold whitespace-nowrap flex-shrink-0"
              >
                Friends (Login)
              </Link>
            )}
          </div>
        </div>

        {/* Leaderboard content */}
        <div className="glass rounded-2xl sm:rounded-3xl p-2 sm:p-4 md:p-6 lg:p-8 shadow-2xl border border-gray-700/50 w-full overflow-hidden">
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px] sm:min-w-0">
              <Leaderboard entries={entries} mode={mode} type={type} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

