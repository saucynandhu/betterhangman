import { createClient } from '@/lib/supabase/server';
import { Profile } from './queries';

export async function createUserProfile(userId: string, email: string, username?: string): Promise<Profile> {
  const supabase = await createClient();
  
  // Generate a default username if not provided
  const defaultUsername = username || `user_${Math.random().toString(36).substring(2, 10)}`;
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      username: defaultUsername,
      xp: 0,
      level: 1,
      wins_hard: 0,
      wins_impossible: 0,
      wins_kitten: 0,
      losses_hard: 0,
      losses_impossible: 0,
      losses_kitten: 0,
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating profile:', error);
    throw error;
  }
  
  return profile;
}
