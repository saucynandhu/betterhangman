import { GameState, AdaptationStep, GameMode } from './types';

const HANGMAN_STAGES = ['😊', '😐', '😟', '😨', '😰', '😵', '💀'];

export function getMaxWrongGuesses(mode: GameMode): number {
  switch (mode) {
    case 'hard':
      return 6;
    case 'impossible':
      return 4;
    case 'kitten':
      return 6;
    default:
      return 6;
  }
}

export function getHangmanStage(wrongGuesses: number): string {
  return HANGMAN_STAGES[Math.min(wrongGuesses, HANGMAN_STAGES.length - 1)];
}

export function initializeGame(words: string[]): GameState {
  const possibleWords = [...words];
  const currentWord = possibleWords[Math.floor(Math.random() * possibleWords.length)];
  
  return {
    currentWord,
    possibleWords,
    guessedLetters: new Set(),
    wrongLetters: new Set(),
    wrongGuesses: 0,
    revealedPositions: new Set(),
    maxWrong: 6, // Will be set by mode
    adaptationHistory: [{ word: currentWord, guess: null, correct: null }],
    gameOver: false,
    won: null,
  };
}

export function guessLetter(
  state: GameState,
  letter: string,
  mode: GameMode
): { newState: GameState; message: string } {
  if (state.gameOver || state.guessedLetters.has(letter)) {
    return { newState: state, message: 'Already guessed or game over' };
  }

  const newState = { ...state };
  newState.guessedLetters.add(letter);

  const letterInWord = newState.currentWord.includes(letter);

  if (letterInWord) {
    // Correct guess - reveal all positions
    for (let i = 0; i < newState.currentWord.length; i++) {
      if (newState.currentWord[i] === letter) {
        newState.revealedPositions.add(i);
      }
    }

    newState.adaptationHistory.push({
      word: newState.currentWord,
      guess: letter,
      correct: true,
    });

    // Check for win
    if (newState.revealedPositions.size === newState.currentWord.length) {
      newState.gameOver = true;
      newState.won = true;
      return { newState, message: `✓ Found ${letter}! You won!` };
    }

    return { newState, message: `✓ Found ${letter}!` };
  } else {
    // Wrong guess
    newState.wrongGuesses++;
    newState.wrongLetters.add(letter);

    const oldWord = newState.currentWord;

    // Only adapt word in kitten mode
    if (mode === 'kitten') {
      adaptWord(newState);
    }

    newState.adaptationHistory.push({
      word: newState.currentWord,
      guess: letter,
      correct: false,
      oldWord: oldWord !== newState.currentWord ? oldWord : undefined,
    });

    // Check for loss
    if (newState.wrongGuesses >= newState.maxWrong) {
      newState.gameOver = true;
      newState.won = false;
      return { 
        newState, 
        message: mode === 'kitten' 
          ? `✗ No ${letter}... AI adapted the word! You lost!` 
          : `✗ No ${letter}. You lost!` 
      };
    }

    return { 
      newState, 
      message: mode === 'kitten' 
        ? `✗ No ${letter}... AI adapted the word!` 
        : `✗ No ${letter}` 
    };
  }
}

function adaptWord(state: GameState): void {
  const pattern = Array(state.currentWord.length).fill(null);
  
  for (const pos of state.revealedPositions) {
    pattern[pos] = state.currentWord[pos];
  }
  
  const candidates = state.possibleWords.filter(word => {
    if (word.length !== state.currentWord.length) return false;
    
    // Exclude any word containing previously guessed wrong letters
    for (const wl of state.wrongLetters) {
      if (word.includes(wl)) return false;
    }
    
    // Must match revealed positions
    for (let i = 0; i < pattern.length; i++) {
      if (pattern[i] !== null && word[i] !== pattern[i]) {
        return false;
      }
    }
    
    return true;
  });
  
  if (candidates.length > 0) {
    // Score candidates by uncommonness
    const uncommonLetters = candidates.map(word => {
      const uniqueLetters = new Set(word.split(''));
      const commonLetters = 'ETAOINSHRDLU';
      let score = 0;
      
      for (const letter of uniqueLetters) {
        if (!state.guessedLetters.has(letter)) {
          score += commonLetters.includes(letter) ? 1 : 3;
        }
      }
      
      return { word, score };
    });
    
    uncommonLetters.sort((a, b) => b.score - a.score);
    
    // Prefer switching to a different word if possible
    const firstDifferent = uncommonLetters.find(c => c.word !== state.currentWord);
    state.currentWord = firstDifferent ? firstDifferent.word : uncommonLetters[0].word;
    state.possibleWords = candidates;
  }
}

export function calculateXP(won: boolean, mode: GameMode, wrongGuesses: number, totalGuesses: number): number {
  if (!won) {
    // Lose XP based on mode difficulty
    const baseLoss = mode === 'kitten' ? -5 : mode === 'impossible' ? -10 : -15;
    return baseLoss;
  }

  // Win XP calculation
  const baseXP = mode === 'kitten' ? 50 : mode === 'impossible' ? 30 : 20;
  const accuracyBonus = Math.round((totalGuesses - wrongGuesses) / totalGuesses * 20);
  const modeMultiplier = mode === 'kitten' ? 1.5 : mode === 'impossible' ? 1.2 : 1.0;
  
  return Math.round((baseXP + accuracyBonus) * modeMultiplier);
}

