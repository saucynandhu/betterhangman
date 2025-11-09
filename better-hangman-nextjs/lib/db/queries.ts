import { createClient } from '@/lib/supabase/server';
import { GameMode } from '@/lib/game/types';

export interface Profile {
  id: string;
  username: string;
  email: string;
  xp: number;
  level: number;
  wins_hard: number;
  wins_impossible: number;
  wins_kitten: number;
  losses_hard: number;
  losses_impossible: number;
  losses_kitten: number;
  created_at: string;
  updated_at: string;
}

export interface GameRecord {
  id: string;
  user_id: string;
  mode: GameMode;
  word: string;
  won: boolean;
  wrong_guesses: number;
  total_guesses: number;
  xp_gained: number;
  played_at: string;
}

export interface LeaderboardEntry {
  profile: Profile;
  wins: number;
  losses: number;
  win_rate: number;
  total_games: number;
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  
  if (error || !data) return null;
  return data;
}

export async function createProfile(userId: string, username: string, email: string): Promise<Profile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('profiles')
    .insert({ id: userId, username, email })
    .select()
    .single();
  
  if (error || !data) return null;
  return data;
}

export async function saveGame(
  userId: string | null,
  mode: GameMode,
  word: string,
  won: boolean,
  wrongGuesses: number,
  totalGuesses: number,
  xpGained: number
): Promise<void> {
  console.log(`[SAVE GAME] Starting saveGame for user ${userId}, mode: ${mode}, won: ${won}`);
  
  if (!userId) {
    console.log('[SAVE GAME] No user ID provided - guest game not saved');
    return; // Guest games not saved
  }
  
  const supabase = await createClient();
  
  try {
    console.log(`[SAVE GAME] Saving game record for user ${userId}`);
    const gameData = {
      user_id: userId,
      mode,
      word,
      won,
      wrong_guesses: wrongGuesses,
      total_guesses: totalGuesses,
      xp_gained: xpGained,
    };
    
    console.log('[SAVE GAME] Game data:', JSON.stringify(gameData, null, 2));
    
    const { data: gameResult, error: gameError } = await supabase
      .from('games')
      .insert(gameData)
      .select()
      .single();

    if (gameError) {
      console.error('[SAVE GAME] Error saving game to database:', gameError);
      return;
    }
    
    console.log(`[SAVE GAME] Game record saved with ID: ${gameResult?.id}`);

    // Get the user's current profile
    console.log(`[SAVE GAME] Fetching profile for user ${userId}`);
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError || !profile) {
      console.error('[SAVE GAME] Error fetching profile:', profileError);
      return;
    }
    
    console.log(`[SAVE GAME] Current profile data:`, JSON.stringify({
      xp: profile.xp,
      level: profile.level,
      wins: profile[`wins_${mode}`],
      losses: profile[`losses_${mode}`]
    }, null, 2));

    // Update the appropriate win/loss counter
    const winField = `wins_${mode}`;
    const lossField = `losses_${mode}`;
    
    const updates: any = {
      xp: (profile.xp || 0) + xpGained,
      updated_at: new Date().toISOString()
    };
    
    if (won) {
      updates[winField] = (profile[winField as keyof Profile] || 0) + 1;
      console.log(`[SAVE GAME] Incrementing ${winField} to ${updates[winField]}`);
    } else {
      updates[lossField] = (profile[lossField as keyof Profile] || 0) + 1;
      console.log(`[SAVE GAME] Incrementing ${lossField} to ${updates[lossField]}`);
    }
    
    // Calculate new level (1000 XP per level)
    updates.level = Math.floor(updates.xp / 1000) + 1;
    console.log(`[SAVE GAME] Updating XP to ${updates.xp}, level to ${updates.level}`);
    
    // Update the profile
    console.log(`[SAVE GAME] Updating profile with:`, JSON.stringify(updates, null, 2));
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('[SAVE GAME] Error updating profile:', updateError);
    } else {
      console.log('[SAVE GAME] Successfully updated profile:', JSON.stringify({
        xp: updatedProfile?.xp,
        level: updatedProfile?.level,
        wins: updatedProfile?.[winField],
        losses: updatedProfile?.[lossField]
      }, null, 2));
    }
    
  } catch (error) {
    console.error('[SAVE GAME] Unexpected error in saveGame:', error);
  } finally {
    console.log('[SAVE GAME] Completed saveGame function');
  }
}

export async function getGlobalLeaderboard(mode: GameMode, limit: number = 50): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  
  // First, get all profiles with their usernames
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('xp', { ascending: false })
    .limit(limit);
  
  if (profilesError || !profiles) return [];
  
  // Then get all games to calculate stats
  const { data: games, error: gamesError } = await supabase
    .from('games')
    .select('user_id, won, mode');
    
  // Calculate wins and losses for each profile
  const leaderboard = profiles.map(profile => {
    // Filter games for this user and the specified mode
    const userGames = games?.filter(g => 
      g.user_id === profile.id && (!mode || g.mode === mode)
    ) || [];
    
    const wins = userGames.filter(g => g.won).length;
    const losses = userGames.length - wins;
    const total = userGames.length;
    
    return {
      profile,
      wins,
      losses,
      win_rate: total > 0 ? (wins / total) * 100 : 0,
      total_games: total,
    };
  });
  
  // Sort by XP first (primary sort), then by wins, then by win rate
  return leaderboard.sort((a, b) => {
    if (b.profile.xp !== a.profile.xp) return b.profile.xp - a.profile.xp;
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.win_rate - a.win_rate;
  });
}

export async function getLocalLeaderboard(mode: GameMode, limit: number = 50): Promise<LeaderboardEntry[]> {
  // Local leaderboard = recent games (last 7 days)
  const supabase = await createClient();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data, error } = await supabase
    .from('games')
    .select('user_id, won, profiles(*)')
    .eq('mode', mode)
    .gte('played_at', sevenDaysAgo.toISOString());
  
  if (error || !data) return [];
  
  // Aggregate by user
  const userStats = new Map<string, { wins: number; losses: number; profile: Profile }>();
  
  for (const game of data) {
    const userId = game.user_id;
    const profile = game.profiles as unknown as Profile;
    
    if (!userStats.has(userId)) {
      userStats.set(userId, { wins: 0, losses: 0, profile });
    }
    
    const stats = userStats.get(userId)!;
    if (game.won) {
      stats.wins++;
    } else {
      stats.losses++;
    }
  }
  
  return Array.from(userStats.values())
    .map(({ wins, losses, profile }) => {
      const total = wins + losses;
      return {
        profile,
        wins,
        losses,
        win_rate: total > 0 ? (wins / total) * 100 : 0,
        total_games: total,
      };
    })
    .sort((a, b) => {
      if (b.wins !== a.wins) return b.wins - a.wins;
      return b.win_rate - a.win_rate;
    })
    .slice(0, limit);
}

export async function getFriendsLeaderboard(
  userId: string,
  mode: GameMode,
  limit: number = 50
): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  
  // Get user's friends
  const { data: friendships, error: friendsError } = await supabase
    .from('friends')
    .select('friend_id')
    .eq('user_id', userId);
  
  if (friendsError || !friendships) return [];
  
  const friendIds = friendships.map(f => f.friend_id);
  friendIds.push(userId); // Include self
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('*')
    .in('id', friendIds);
  
  if (error || !profiles) return [];
  
  const winsColumn = `wins_${mode}`;
  const lossesColumn = `losses_${mode}`;
  
  return profiles.map(profile => {
    const wins = profile[winsColumn as keyof Profile] as number || 0;
    const losses = profile[lossesColumn as keyof Profile] as number || 0;
    const total = wins + losses;
    
    return {
      profile,
      wins,
      losses,
      win_rate: total > 0 ? (wins / total) * 100 : 0,
      total_games: total,
    };
  }).sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    return b.win_rate - a.win_rate;
  });
}

export async function addFriend(userId: string, friendId: string): Promise<boolean> {
  const supabase = await createClient();
  const { error } = await supabase
    .from('friends')
    .insert({ user_id: userId, friend_id: friendId });
  
  return !error;
}

interface FriendRecord {
  friend_id: string;
  profiles: Profile;
}

export async function getFriends(userId: string): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('friends')
    .select('friend_id, profiles:friend_id(*)')
    .eq('user_id', userId) as { data: FriendRecord[] | null; error: any };
  
  if (error || !data) return [];
  
  return data
    .map(f => f.profiles)
    .filter((profile): profile is Profile => profile !== null);
}

