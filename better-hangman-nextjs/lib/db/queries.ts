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
  if (!userId) return; // Guest games not saved
  
  const supabase = await createClient();
  await supabase
    .from('games')
    .insert({
      user_id: userId,
      mode,
      word,
      won,
      wrong_guesses: wrongGuesses,
      total_guesses: totalGuesses,
      xp_gained: xpGained,
    });
}

export async function getGlobalLeaderboard(mode: GameMode, limit: number = 50): Promise<LeaderboardEntry[]> {
  const supabase = await createClient();
  
  const winsColumn = `wins_${mode}`;
  const lossesColumn = `losses_${mode}`;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('xp', { ascending: false })
    .limit(limit);
  
  if (error || !data) return [];
  
  return data.map(profile => {
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
    // Sort by wins first, then win rate
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
    const profile = game.profiles as Profile;
    
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

export async function getFriends(userId: string): Promise<Profile[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('friends')
    .select('friend_id, profiles:friend_id(*)')
    .eq('user_id', userId);
  
  if (error || !data) return [];
  
  return data.map(f => f.profiles).filter(Boolean) as Profile[];
}

