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
    <div className="space-y-2 sm:space-y-3">
      {/* Header - Hidden on mobile, shown on sm and up */}
      <div className="hidden sm:grid grid-cols-12 gap-2 sm:gap-3 p-3 sm:p-4 glass rounded-xl border border-gray-700/50 font-bold text-xs md:text-sm">
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
          className={`grid grid-cols-12 gap-2 sm:gap-3 p-3 sm:p-4 glass rounded-xl border transition-all duration-200 ${
            index === 0 
              ? 'border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-transparent shadow-lg' 
              : index === 1
              ? 'border-gray-400/50 bg-gradient-to-r from-gray-500/10 to-transparent'
              : index === 2
              ? 'border-orange-500/50 bg-gradient-to-r from-orange-500/10 to-transparent'
              : 'border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/30'
          }`}
        >
          {/* Position - Always visible */}
          <div className={`col-span-2 sm:col-span-1 flex items-center font-bold ${
            index < 3 ? 'text-xl sm:text-2xl' : 'text-gray-400'
          }`}>
            {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
          </div>
          
          {/* Username - Takes more space on mobile */}
          <div className="col-span-7 sm:col-span-4 text-white font-semibold flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <span className="truncate">{entry.profile.username}</span>
            {index < 3 && (
              <span className="text-[10px] sm:text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full w-fit">
                Top {index + 1}
              </span>
            )}
            {/* Mobile stats - Only show on small screens */}
            <div className="sm:hidden flex items-center gap-2 text-xs mt-1">
              <span className="text-green-400">W: {entry.wins}</span>
              <span className="text-red-400">L: {entry.losses}</span>
              <span>{entry.win_rate.toFixed(1)}%</span>
            </div>
          </div>
          
          {/* Desktop stats - Hidden on mobile */}
          <div className="hidden sm:grid sm:col-span-2 text-center text-green-400 font-bold">
            {entry.wins}
          </div>
          <div className="hidden sm:grid sm:col-span-2 text-center text-red-400 font-bold">
            {entry.losses}
          </div>
          <div className="hidden sm:grid sm:col-span-2 text-center text-white font-semibold">
            {entry.win_rate.toFixed(1)}%
          </div>
          
          {/* Level - Always visible */}
          <div className="col-span-3 sm:col-span-1 flex items-center justify-end sm:justify-center">
            <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold">
              Lv.{entry.profile.level}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

