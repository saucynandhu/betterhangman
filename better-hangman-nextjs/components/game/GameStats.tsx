'use client';

interface GameStatsProps {
  wordLength: number;
  wrongCount: number;
  remainingCount: number;
}

export default function GameStats({ wordLength, wrongCount, remainingCount }: GameStatsProps) {
  const remainingPercentage = (remainingCount / 6) * 100;
  
  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      <div className="glass rounded-2xl p-6 text-center border border-gray-700/50 hover:border-purple-500/50 transition-all duration-300">
        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">WORD LENGTH</div>
        <div className="text-4xl font-black text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          {wordLength}
        </div>
      </div>
      <div className="glass rounded-2xl p-6 text-center border border-gray-700/50 hover:border-red-500/50 transition-all duration-300">
        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">WRONG GUESSES</div>
        <div className={`text-4xl font-black ${wrongCount > 0 ? 'text-red-400' : 'text-white'}`}>
          {wrongCount}
        </div>
      </div>
      <div className="glass rounded-2xl p-6 text-center border border-gray-700/50 hover:border-green-500/50 transition-all duration-300 relative overflow-hidden">
        <div className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">REMAINING</div>
        <div className={`text-4xl font-black ${remainingCount <= 2 ? 'text-red-400' : remainingCount <= 4 ? 'text-yellow-400' : 'text-green-400'}`}>
          {remainingCount}
        </div>
        <div 
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-500 to-yellow-500 transition-all duration-300"
          style={{ width: `${remainingPercentage}%` }}
        ></div>
      </div>
    </div>
  );
}

