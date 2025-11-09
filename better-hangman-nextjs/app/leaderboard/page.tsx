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

  let entries: LeaderboardEntry[];
  if (type === 'global') {
    entries = await getGlobalLeaderboard(mode);
  } else if (type === 'local') {
    entries = await getLocalLeaderboard(mode);
  } else {
    if (user) {
      entries = await getFriendsLeaderboard(user.id, mode);
    } else {
      entries = [];
    }
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition mb-4 inline-block font-medium"
          >
            ← Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Leaderboards
          </h1>
          <p className="text-gray-400">Compete with players worldwide</p>
        </div>

        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex gap-2 glass rounded-xl p-1 border border-gray-700/50">
            {(['hard', 'impossible', 'kitten'] as const).map((m) => (
              <Link
                key={m}
                href={`/leaderboard?mode=${m}&type=${type}`}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  mode === m
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                }`}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Link>
            ))}
          </div>
          <div className="flex gap-2 glass rounded-xl p-1 border border-gray-700/50">
            <Link
              href={`/leaderboard?mode=${mode}&type=global`}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                type === 'global'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              Global
            </Link>
            <Link
              href={`/leaderboard?mode=${mode}&type=local`}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
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
                className={`px-4 py-2 rounded-lg font-semibold transition ${
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
                className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition font-semibold"
              >
                Friends (Login)
              </Link>
            )}
          </div>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8 shadow-2xl border border-gray-700/50">
          <Leaderboard entries={entries} mode={mode} type={type} />
        </div>
      </div>
    </div>
  );
}

