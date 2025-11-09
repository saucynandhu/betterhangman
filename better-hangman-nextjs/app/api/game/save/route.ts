import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { saveGame } from '@/lib/db/queries';
import { GameMode } from '@/lib/game/types';

export async function POST(request: NextRequest) {
  console.log('[SAVE GAME] Starting save game process');
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    console.log('[SAVE GAME] Auth check - User:', user?.id || 'No user');
    if (authError) console.error('[SAVE GAME] Auth error:', authError);

    if (!user) {
      console.error('[SAVE GAME] Unauthorized - No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    console.log('[SAVE GAME] Request body:', JSON.stringify(body, null, 2));
    
    const { mode, word, won, wrongGuesses, totalGuesses, xpGained } = body;

    if (!mode || !word || typeof won !== 'boolean' || typeof wrongGuesses !== 'number') {
      const errorMsg = `[SAVE GAME] Invalid request data: ${JSON.stringify({ mode, word, won, wrongGuesses, hasXp: xpGained !== undefined })}`;
      console.error(errorMsg);
      return NextResponse.json({ error: 'Invalid request data', details: { mode, word, won, wrongGuesses, hasXp: xpGained !== undefined } }, { status: 400 });
    }

    console.log(`[SAVE GAME] Calling saveGame for user ${user.id}, mode: ${mode}, won: ${won}, xp: ${xpGained}`);
    
    const result = await saveGame(
      user.id,
      mode as GameMode,
      word,
      won,
      wrongGuesses,
      totalGuesses,
      xpGained
    );

    console.log(`[SAVE GAME] Game saved successfully for user ${user.id}`);
    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('[SAVE GAME] Error in save game route:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

