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
    <div className="w-full">
      {/* Mobile Header - Only shown on small screens */}
      <div className="sm:hidden mb-3 px-2">
        <h2 className="text-lg font-bold text-white">Leaderboard</h2>
        <div className="flex items-center gap-2 mt-1 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-xs text-gray-400 whitespace-nowrap">Swipe → to see more</span>
        </div>
      </div>
      
      {/* Desktop Header - Hidden on mobile */}
      <div className="hidden sm:grid grid-cols-12 gap-3 p-4 glass rounded-xl border border-gray-700/50 font-medium text-xs md:text-sm w-full mb-3">
        <div className="col-span-1 text-gray-400 text-center">#</div>
        <div className="col-span-4 text-white">Player</div>
        <div className="col-span-2 text-center text-white">Wins</div>
        <div className="col-span-2 text-center text-white">Losses</div>
        <div className="col-span-2 text-center text-white">Win Rate</div>
        <div className="col-span-1 text-center text-white">Level</div>
      </div>
      
      <div className="space-y-2 sm:space-y-3">
        {entries.map((entry, index) => (
          <div
            key={entry.profile.id}
            className={`relative group w-full p-3 sm:p-4 rounded-xl border transition-all duration-200 ${
              index === 0 
                ? 'bg-gradient-to-r from-yellow-900/30 to-yellow-900/10 border-yellow-500/50 shadow-lg' 
                : index === 1
                ? 'bg-gradient-to-r from-gray-800/30 to-gray-800/10 border-gray-400/50'
                : index === 2
                ? 'bg-gradient-to-r from-orange-900/30 to-orange-900/10 border-orange-500/50'
                : 'bg-white/5 border-gray-700/50 hover:border-gray-600/50 hover:bg-gray-800/20'
            }`}
          >
            {/* Mobile Layout */}
            <div className="sm:hidden">
              <div className="flex items-start gap-3">
                {/* Position */}
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  index < 3 ? 'text-xl' : 'text-gray-400 bg-white/5'
                }`}>
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* Username and Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white truncate">{entry.profile.username}</span>
                        {index < 3 && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-full whitespace-nowrap">
                            Top {index + 1}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs">
                        <span className="text-green-400">W: {entry.wins}</span>
                        <span className="text-red-400">L: {entry.losses}</span>
                        <span className="text-blue-300">{entry.win_rate.toFixed(1)}%</span>
                      </div>
                    </div>
                    
                    <div className="ml-2 flex-shrink-0">
                      <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold whitespace-nowrap">
                        Lv.{entry.profile.level}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Desktop Layout */}
            <div className="hidden sm:grid grid-cols-12 gap-3 items-center">
              {/* Position */}
              <div className={`col-span-1 text-center ${index < 3 ? 'text-xl' : 'text-gray-400'}`}>
                {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
              </div>
              
              {/* Username */}
              <div className="col-span-4 flex items-center gap-2">
                <span className="font-medium text-white truncate">{entry.profile.username}</span>
                {index < 3 && (
                  <span className="hidden sm:inline-flex text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                    Top {index + 1}
                  </span>
                )}
              </div>
              
              {/* Stats */}
              <div className="col-span-2 text-center text-green-400 font-medium">
                {entry.wins}
              </div>
              <div className="col-span-2 text-center text-red-400 font-medium">
                {entry.losses}
              </div>
              <div className="col-span-2 text-center text-white font-medium">
                {entry.win_rate.toFixed(1)}%
              </div>
              
              {/* Level */}
              <div className="col-span-1 flex justify-center">
                <span className="px-2.5 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs font-bold">
                  Lv.{entry.profile.level}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

