import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { saveGame } from '@/lib/db/queries';
import { GameMode } from '@/lib/game/types';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { mode, word, won, wrongGuesses, totalGuesses, xpGained } = body;

    if (!mode || !word || typeof won !== 'boolean' || typeof wrongGuesses !== 'number') {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }

    await saveGame(
      user.id,
      mode as GameMode,
      word,
      won,
      wrongGuesses,
      totalGuesses,
      xpGained
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving game:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

