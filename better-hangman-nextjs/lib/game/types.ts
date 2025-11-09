export type GameMode = 'hard' | 'impossible' | 'kitten';

export interface GameState {
  currentWord: string;
  possibleWords: string[];
  guessedLetters: Set<string>;
  wrongLetters: Set<string>;
  wrongGuesses: number;
  revealedPositions: Set<number>;
  maxWrong: number;
  adaptationHistory: AdaptationStep[];
  gameOver: boolean;
  won: boolean | null;
}

export interface AdaptationStep {
  word: string;
  guess: string | null;
  correct: boolean | null;
  oldWord?: string;
}

export interface GameStats {
  wordLength: number;
  wrongCount: number;
  remainingCount: number;
  totalGuesses: number;
}

