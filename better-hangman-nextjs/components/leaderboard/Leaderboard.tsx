'use client';

import { LeaderboardEntry } from '@/lib/db/queries';
import { GameMode } from '@/lib/game/types';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  mode: GameMode;
  type: 'global' | 'local' | 'friends';
}

export default function Leaderboard({ entries, mode, type }: LeaderboardProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center text-[#888] py-8">
        No entries yet. Be the first to play!
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-12 gap-4 p-4 glass rounded-xl border border-gray-700/50 font-bold text-xs md:text-sm">
        <div className="col-span-1 text-gray-400">#</div>
        <div className="col-span-4 text-white">Username</div>
        <div className="col-span-2 text-center text-white">Wins</div>
        <div className="col-span-2 text-center text-white">Losses</div>
        <div className="col-span-2 text-center text-white">Win Rate</div>
        <div className="col-span-1 text-center text-white">Level</div>
      </div>
      {entries.map((entry, index) => (
        <div
          key={entry.profile.id}
          className={`grid grid-cols-12 gap-4 p-4 glass rounded-xl border transition-all duration-200 ${
            index === 0 
              ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-transparent shadow-lg' 
              : index === 1
              ? 'border-gray-400/50 bg-gradient-to-r from-gray-500/10 to-transparent'
              : index === 2
              ? 'border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-transparent'
              : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30'
          }`}
        >
          <div className={`col-span-1 font-bold ${index < 3 ? 'text-2xl' : 'text-gray-400'}`}>
            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
          </div>
          <div className="col-span-4 text-white font-semibold flex items-center gap-2">
            {entry.profile.username}
            {index < 3 && <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">Top {index + 1}</span>}
          </div>
          <div className="col-span-2 text-center text-green-400 font-bold">{entry.wins}</div>
          <div className="col-span-2 text-center text-red-400 font-bold">{entry.losses}</div>
          <div className="col-span-2 text-center text-white font-semibold">
            {entry.win_rate.toFixed(1)}%
          </div>
          <div className="col-span-1 text-center">
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold">
              Lv.{entry.profile.level}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

