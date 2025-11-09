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
          className="inline-flex items-center justify-center w-16 h-20 mx-1 text-center relative"
        >
          {isRevealed ? (
            <span className="text-6xl font-bold text-white drop-shadow-lg animate-slide-in bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              {gameState.currentWord[i]}
            </span>
          ) : (
            <span className="text-5xl text-gray-600 font-bold">_</span>
          )}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full"></div>
        </span>
      );
    });
  };

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  return (
    <div className="space-y-12">
      <div className="text-center text-8xl mb-8 min-h-[120px] flex items-center justify-center transform transition-all duration-300 hover:scale-110">
        <span className="filter drop-shadow-2xl">{getHangmanStage(gameState.wrongGuesses)}</span>
      </div>

      <div className="text-center font-mono text-6xl md:text-7xl tracking-[20px] min-h-[90px] text-white flex items-center justify-center">
        <div className="flex flex-wrap justify-center gap-2">
          {renderWord()}
        </div>
      </div>

      <div className="grid grid-cols-9 gap-3 max-w-[800px] mx-auto">
        {letters.map((letter) => {
          const isUsed = gameState.guessedLetters.has(letter);
          const isWrong = gameState.wrongLetters.has(letter);
          const isCorrect = isUsed && !isWrong;
          
          return (
            <button
              key={letter}
              onClick={() => !isUsed && onLetterGuess(letter)}
              disabled={isUsed || gameState.gameOver}
              className={`
                py-4 px-2 rounded-xl text-xl font-bold transition-all duration-200
                transform active:scale-95
                ${isUsed
                  ? isWrong
                    ? 'bg-red-500/20 border-2 border-red-500/50 text-red-400 cursor-not-allowed opacity-60 animate-shake'
                    : isCorrect
                    ? 'bg-green-500/20 border-2 border-green-500/50 text-green-400 cursor-not-allowed'
                    : 'bg-gray-800/50 border border-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                  : 'bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-gray-700 text-white hover:from-purple-600 hover:to-purple-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-500/50 hover:-translate-y-1 hover:scale-105 active:scale-95'
                }
                ${!isUsed && !gameState.gameOver ? 'cursor-pointer' : ''}
              `}
            >
              {letter}
            </button>
          );
        })}
      </div>
    </div>
  );
}

