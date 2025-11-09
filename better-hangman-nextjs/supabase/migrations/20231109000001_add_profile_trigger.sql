-- Create a function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Extract username from user_metadata or use the email prefix as fallback
  declare
    user_username text;
  begin
    -- Try to get username from user_metadata (from signup form)
    user_username := new.raw_user_meta_data->>'username';
    
    -- If username is not in user_metadata, try other common fields
    if user_username is null then
      user_username := new.raw_user_meta_data->>'full_name';
    end if;
    
    if user_username is null then
      user_username := new.raw_user_meta_data->>'name';
    end if;
    
    -- If still no username, use the email prefix (before @)
    if user_username is null then
      user_username := split_part(new.email, '@', 1);
    end if;
    
    -- Make sure username is not empty
    if trim(user_username) = '' then
      user_username := 'user_' || substr(new.id::text, 1, 8);
    end if;
    
    -- Insert the new profile
    insert into public.profiles (
      id,
      username,
      email,
      xp,
      level,
      wins_hard,
      wins_impossible,
      wins_kitten,
      losses_hard,
      losses_impossible,
      losses_kitten,
      created_at,
      updated_at
    ) values (
      new.id,
      user_username,
      new.email,
      0,  -- xp
      1,  -- level
      0,  -- wins_hard
      0,  -- wins_impossible
      0,  -- wins_kitten
      0,  -- losses_hard
      0,  -- losses_impossible
      0,  -- losses_kitten
      now(),
      now()
    )
    on conflict (id) do update set
      email = excluded.email,
      updated_at = now();
    
    return new;
  end;
end;
$$ language plpgsql security definer;

-- Drop the trigger if it exists
drop trigger if exists on_auth_user_created on auth.users;

-- Create the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Update RLS policies to ensure proper access
create or replace policy "Users can view their own profile"
on public.profiles for select
using (auth.uid() = id);

create or replace policy "Users can update their own profile"
on public.profiles for update
using (auth.uid() = id);

-- Ensure the trigger function has the necessary permissions
grant execute on function public.handle_new_user() to supabase_auth_admin;
