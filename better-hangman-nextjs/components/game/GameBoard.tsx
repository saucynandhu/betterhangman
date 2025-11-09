'use client';

import { GameState, GameMode } from '@/lib/game/types';
import { getHangmanStage } from '@/lib/game/gameLogic';

interface GameBoardProps {
  gameState: GameState;
  mode: GameMode;
  onLetterGuess: (letter: string) => void;
}

export default function GameBoard({ gameState, mode, onLetterGuess }: GameBoardProps) {
  const renderWord = () => {
    return Array.from({ length: gameState.currentWord.length }, (_, i) => {
      const isRevealed = gameState.revealedPositions.has(i);
      return (
        <span
          key={i}
          className="inline-flex items-center justify-center w-10 h-12 sm:w-14 sm:h-16 md:w-16 md:h-20 mx-0.5 sm:mx-1 text-center relative"
        >
          {isRevealed ? (
            <span className="text-3xl sm:text-5xl md:text-6xl font-bold text-white drop-shadow-lg animate-slide-in bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              {gameState.currentWord[i]}
            </span>
          ) : (
            <span className="text-2xl sm:text-4xl md:text-5xl text-gray-600 font-bold">_</span>
          )}
          <div className="absolute bottom-0 left-1 right-1 h-0.5 sm:h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"></div>
        </span>
      );
    });
  };

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const letterGroups = [
    letters.slice(0, 7),
    letters.slice(7, 14),
    letters.slice(14, 21),
    letters.slice(21)
  ];

  return (
    <div className="space-y-6 sm:space-y-8 md:space-y-12 px-2 sm:px-4">
      {/* Hangman Display */}
      <div className="text-center text-6xl sm:text-7xl md:text-8xl mb-4 sm:mb-6 md:mb-8 min-h-[80px] sm:min-h-[100px] md:min-h-[120px] flex items-center justify-center transform transition-transform duration-300 active:scale-95">
        <span className="filter drop-shadow-2xl">{getHangmanStage(gameState.wrongGuesses)}</span>
      </div>

      {/* Word Display */}
      <div className="glass rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-gray-700/50">
        <div className="text-center font-mono text-3xl sm:text-5xl md:text-6xl tracking-[8px] sm:tracking-[12px] md:tracking-[20px] min-h-[60px] sm:min-h-[80px] text-white flex items-center justify-center overflow-x-auto no-scrollbar">
          <div className="flex flex-nowrap justify-center gap-0.5 sm:gap-1 md:gap-2 px-2 py-4">
            {renderWord()}
          </div>
        </div>
      </div>

      {/* Keyboard */}
      <div className="space-y-2 sm:space-y-3 max-w-full overflow-hidden">
        {letterGroups.map((group, groupIndex) => (
          <div 
            key={groupIndex} 
            className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-3 w-full max-w-full overflow-x-auto no-scrollbar px-1"
          >
            {group.map((letter) => {
              const isUsed = gameState.guessedLetters.has(letter);
              const isWrong = gameState.wrongLetters.has(letter);
              const isCorrect = isUsed && !isWrong;
              
              return (
                <button
                  key={letter}
                  onClick={() => !isUsed && onLetterGuess(letter)}
                  disabled={isUsed || gameState.gameOver}
                  className={`
                    py-2.5 sm:py-3 md:py-4 px-1 sm:px-2 rounded-lg sm:rounded-xl text-sm sm:text-base md:text-lg font-bold 
                    transition-all duration-200 transform active:scale-95 flex-1 min-w-[10%] sm:min-w-0
                    ${isUsed
                      ? isWrong
                        ? 'bg-red-500/20 border border-red-500/40 text-red-400 cursor-not-allowed opacity-70 animate-shake'
                        : isCorrect
                        ? 'bg-green-500/20 border border-green-500/40 text-green-400 cursor-not-allowed'
                        : 'bg-gray-800/50 border border-gray-700/70 text-gray-500 cursor-not-allowed'
                      : 'bg-gray-800/80 border border-gray-700/70 text-white hover:bg-purple-600/90 hover:border-purple-400/80 hover:shadow-lg hover:shadow-purple-500/30 active:bg-purple-700/90 active:scale-95 active:shadow-inner'
                    }
                    ${!isUsed && !gameState.gameOver ? 'cursor-pointer' : ''}
                  `}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Mobile Controls */}
      <div className="sm:hidden flex justify-between gap-3 mt-4">
        <button
          onClick={() => window.location.reload()}
          className="flex-1 py-3 px-4 bg-gray-800/80 border border-gray-700/70 rounded-lg text-white font-medium text-sm active:bg-gray-700/90 transition-colors"
        >
          New Game
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex-1 py-3 px-4 bg-gray-800/80 border border-gray-700/70 rounded-lg text-white font-medium text-sm active:bg-gray-700/90 transition-colors"
        >
          Scroll Up
        </button>
      </div>
    </div>
  );
}

