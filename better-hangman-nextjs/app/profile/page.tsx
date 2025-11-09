import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const profile = await getProfile(user.id);

  if (!profile) {
    redirect('/');
  }

  const totalWins = profile.wins_hard + profile.wins_impossible + profile.wins_kitten;
  const totalLosses = profile.losses_hard + profile.losses_impossible + profile.losses_kitten;
  const totalGames = totalWins + totalLosses;
  const winRate = totalGames > 0 ? (totalWins / totalGames) * 100 : 0;

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="mb-8">
          <Link
            href="/"
            className="text-gray-400 hover:text-white transition mb-4 inline-block font-medium"
          >
            ← Back to home
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Profile
          </h1>
        </div>

        <div className="glass rounded-3xl p-6 md:p-8 space-y-8 shadow-2xl border border-gray-700/50">
          <div className="flex items-center justify-between pb-6 border-b border-gray-700/50">
            <div>
              <div className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Username</div>
              <div className="text-3xl font-black text-white">{profile.username}</div>
            </div>
            <div className="text-right">
              <div className="text-gray-400 text-sm mb-2 uppercase tracking-wider">Level</div>
              <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Lv.{profile.level}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Total XP</div>
              <div className="text-4xl font-black text-white">{profile.xp.toLocaleString()}</div>
            </div>
            <div className="glass rounded-2xl p-6 border border-gray-700/50">
              <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Win Rate</div>
              <div className="text-4xl font-black text-green-400">{winRate.toFixed(1)}%</div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Overall Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-6 border border-gray-700/50 text-center">
                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Total Wins</div>
                <div className="text-3xl font-black text-green-400">{totalWins}</div>
              </div>
              <div className="glass rounded-2xl p-6 border border-gray-700/50 text-center">
                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Total Losses</div>
                <div className="text-3xl font-black text-red-400">{totalLosses}</div>
              </div>
              <div className="glass rounded-2xl p-6 border border-gray-700/50 text-center">
                <div className="text-gray-400 text-xs mb-2 uppercase tracking-wider">Total Games</div>
                <div className="text-3xl font-black text-white">{totalGames}</div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Mode-Specific Stats</h2>
            <div className="space-y-4">
              {(['hard', 'impossible', 'kitten'] as const).map((mode) => {
                const wins = profile[`wins_${mode}` as keyof typeof profile] as number;
                const losses = profile[`losses_${mode}` as keyof typeof profile] as number;
                const modeGames = wins + losses;
                const modeWinRate = modeGames > 0 ? (wins / modeGames) * 100 : 0;
                const modeColors = {
                  hard: 'from-purple-500/20 to-purple-600/20 border-purple-500/30',
                  impossible: 'from-red-500/20 to-red-600/20 border-red-500/30',
                  kitten: 'from-pink-500/20 to-pink-600/20 border-pink-500/30',
                };

                return (
                  <div
                    key={mode}
                    className={`glass rounded-2xl p-6 border bg-gradient-to-r ${modeColors[mode]}`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-xl font-bold text-white capitalize">
                        {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
                      </div>
                      <div className="text-sm font-semibold text-gray-300 bg-gray-800/50 px-3 py-1 rounded-full">
                        {modeWinRate.toFixed(1)}% win rate
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="glass rounded-xl p-4 border border-green-500/20">
                        <div className="text-gray-400 text-xs mb-1 uppercase">Wins</div>
                        <div className="text-2xl font-black text-green-400">{wins}</div>
                      </div>
                      <div className="glass rounded-xl p-4 border border-red-500/20">
                        <div className="text-gray-400 text-xs mb-1 uppercase">Losses</div>
                        <div className="text-2xl font-black text-red-400">{losses}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-700/50">
            <form action="/auth/logout" method="post">
              <button
                type="submit"
                className="px-6 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl hover:bg-red-500/20 hover:border-red-500/50 transition-all font-semibold"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

