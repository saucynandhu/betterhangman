'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { GameState, GameMode } from '@/lib/game/types';
import { initializeGame, guessLetter, getMaxWrongGuesses, calculateXP } from '@/lib/game/gameLogic';
import { loadWords } from '@/lib/game/wordLoader';
import { createClient } from '@/lib/supabase/client';
import GameBoard from '@/components/game/GameBoard';
import GameStats from '@/components/game/GameStats';

export default function GamePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get('mode') || 'hard') as GameMode;
  const isGuest = searchParams.get('guest') === 'true';

  const [words, setWords] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Loading word database...');
  const [gameOver, setGameOver] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function init() {
      const loadedWords = await loadWords();
      setWords(loadedWords);
      
      if (loadedWords.length > 0) {
        const initialState = initializeGame(loadedWords);
        initialState.maxWrong = getMaxWrongGuesses(mode);
        setGameState(initialState);
        setMessage('Start guessing letters...');
      } else {
        setMessage('Failed to load words. Please refresh.');
      }
      
      setLoading(false);

      // Get user ID if logged in
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    }

    init();
  }, [mode]);

  const handleLetterGuess = useCallback(async (letter: string) => {
    if (!gameState || gameState.gameOver) return;

    const { newState, message: newMessage } = guessLetter(gameState, letter, mode);
    setGameState(newState);
    setMessage(newMessage);

    if (newState.gameOver) {
      setGameOver(true);
      
      // Save game if logged in (fire and forget - don't block UI)
      if (userId && newState.won !== null) {
        const totalGuesses = newState.guessedLetters.size;
        const xpGained = calculateXP(newState.won, mode, newState.wrongGuesses, totalGuesses);
        
        // Save in background without blocking
        fetch('/api/game/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            word: newState.currentWord,
            won: newState.won,
            wrongGuesses: newState.wrongGuesses,
            totalGuesses,
            xpGained,
          }),
        }).catch((error) => {
          console.error('Failed to save game:', error);
        });
      }
    }
  }, [gameState, mode, userId]);

  // Keyboard input
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameOver || loading) return;
      const key = e.key.toUpperCase();
      if (key >= 'A' && key <= 'Z') {
        handleLetterGuess(key);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleLetterGuess, gameOver, loading]);

  if (loading || !gameState) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
        <div className="text-center relative z-10">
          <div className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {message}
          </div>
          <div className="text-gray-400 animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-white bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Better Hangman
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              {mode.charAt(0).toUpperCase() + mode.slice(1)} Mode
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="btn-secondary px-4 py-2 rounded-xl font-semibold text-white"
          >
            ← Home
          </button>
        </div>

        <GameStats
          wordLength={gameState.currentWord.length}
          wrongCount={gameState.wrongGuesses}
          remainingCount={gameState.maxWrong - gameState.wrongGuesses}
        />

        <div className="glass rounded-3xl p-6 md:p-12 mb-8 shadow-2xl border border-gray-700/50">
          <div className="text-center text-lg md:text-xl font-semibold text-gray-300 mb-8 min-h-[30px] animate-slide-in">
            {message}
          </div>
          <GameBoard gameState={gameState} mode={mode} onLetterGuess={handleLetterGuess} />
        </div>

        {gameOver && (
          <div className="glass rounded-3xl p-8 md:p-12 text-center space-y-6 shadow-2xl border-2 animate-slide-in" style={{
            borderColor: gameState.won ? 'rgba(16, 185, 129, 0.5)' : 'rgba(239, 68, 68, 0.5)'
          }}>
            <div className="text-6xl mb-4">
              {gameState.won ? '🎉' : '💀'}
            </div>
            <h2 className={`text-5xl font-black ${gameState.won ? 'text-green-400' : 'text-red-400'}`}>
              {gameState.won ? 'YOU WON!' : 'YOU LOST!'}
            </h2>
            <div className="text-2xl md:text-3xl text-white font-mono bg-gray-900/50 rounded-xl p-4 inline-block">
              The word was: <strong className="text-purple-400">{gameState.currentWord}</strong>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
              <div className="glass rounded-xl p-4 border border-gray-700/50">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Guesses</div>
                <div className="text-2xl font-bold text-white">{gameState.guessedLetters.size}</div>
              </div>
              <div className="glass rounded-xl p-4 border border-gray-700/50">
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Accuracy</div>
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(
                    ((gameState.guessedLetters.size - gameState.wrongGuesses) /
                      gameState.guessedLetters.size) *
                      100
                  )}%
                </div>
              </div>
              {mode === 'kitten' && (
                <div className="glass rounded-xl p-4 border border-gray-700/50">
                  <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">AI Adaptations</div>
                  <div className="text-2xl font-bold text-pink-400">
                    {gameState.adaptationHistory.filter(h => !h.correct).length}
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-4 justify-center pt-4">
              <button
                onClick={() => window.location.reload()}
                className="btn-primary px-8 py-3 rounded-xl font-semibold text-white shadow-lg"
              >
                Play Again
              </button>
              <button
                onClick={() => router.push('/')}
                className="btn-secondary px-8 py-3 rounded-xl font-semibold text-white"
              >
                Home
              </button>
              {!isGuest && (
                <button
                  onClick={() => router.push('/leaderboard')}
                  className="btn-secondary px-8 py-3 rounded-xl font-semibold text-white"
                >
                  🏆 Leaderboards
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

