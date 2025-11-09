# Better Hangman - Next.js Edition

A modern, multiplayer hangman game built with Next.js, React, TypeScript, and Supabase. Features AI adaptation in Kitten mode, XP/leveling system, and comprehensive leaderboards.

## Features

### Game Modes
- **Hard Mode**: Classic hangman with 6 wrong guesses allowed
- **Impossible Mode**: Extreme difficulty with only 4 wrong guesses
- **Kitten Mode**: The AI adapts and changes the word on wrong guesses (6 wrong guesses allowed)

### User Features
- **Authentication**: Sign up, login, or play as guest
- **XP & Leveling**: Gain/lose XP based on wins and losses
- **Leaderboards**: 
  - Global leaderboard (all-time)
  - Local leaderboard (last 7 days)
  - Friends leaderboard (your friends only)
- **Profile**: View your stats, wins, losses, and XP across all modes

## Setup Instructions

### 1. Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)

### 2. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run the schema from `supabase/schema.sql`
3. Go to Settings > API and copy:
   - Project URL
   - Anon/public key

### 3. Environment Variables

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Database Setup

The `words.txt` file should be in the `public/` folder. If it's not there, copy it from the original project.

## Project Structure

```
better-hangman-nextjs/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/             # Authentication routes
│   ├── game/             # Game page
│   ├── leaderboard/      # Leaderboard page
│   ├── login/            # Login page
│   ├── profile/          # User profile page
│   └── signup/           # Signup page
├── components/           # React components
│   ├── auth/            # Authentication components
│   ├── game/            # Game components
│   └── leaderboard/     # Leaderboard components
├── lib/                 # Utility libraries
│   ├── db/              # Database queries
│   ├── game/            # Game logic
│   └── supabase/        # Supabase clients
├── public/              # Static files
│   └── words.txt        # Word database
└── supabase/            # Database schema
    └── schema.sql       # SQL schema
```

## Game Mechanics

### XP Calculation
- **Wins**: Base XP + accuracy bonus + mode multiplier
  - Hard: 20 base XP
  - Impossible: 30 base XP
  - Kitten: 50 base XP
- **Losses**: Lose XP based on mode difficulty
  - Hard: -15 XP
  - Impossible: -10 XP
  - Kitten: -5 XP

### Level Calculation
Level = floor(sqrt(XP / 100)) + 1

### Kitten Mode AI
When you guess a wrong letter in Kitten mode:
1. The AI finds all words that match your revealed letters
2. Excludes words containing previously guessed wrong letters
3. Selects a word with uncommon letters to make it harder
4. Switches to a different word if possible

## Technologies Used

- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Supabase** - Authentication and database
- **@supabase/ssr** - Server-side rendering support

## License

MIT
