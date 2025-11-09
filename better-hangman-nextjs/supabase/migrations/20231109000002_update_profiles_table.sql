-- Drop existing trigger and function if they exist
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- Update the function with the new implementation
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_username text;
  username_suffix integer := 1;
  temp_username text;
  username_exists boolean;
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
  
  -- Clean up the username to only allow alphanumeric, underscores, and hyphens
  user_username := regexp_replace(user_username, '[^a-zA-Z0-9_-]', '', 'g');
  
  -- Make sure the username is not empty after cleaning
  if user_username = '' then
    user_username := 'user_' || substr(new.id::text, 1, 8);
  end if;
  
  -- Check if username already exists and make it unique if needed
  temp_username := user_username;
  
  loop
    select exists (
      select 1 from public.profiles 
      where username = temp_username and id != new.id
    ) into username_exists;
    
    exit when not username_exists;
    temp_username := user_username || username_suffix;
    username_suffix := username_suffix + 1;
  end loop;
  
  user_username := temp_username;
  
  -- Insert the new profile with all required fields
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
$$ language plpgsql security definer;

-- Recreate the trigger
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Drop existing policies if they exist
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Allow insert for authenticated users" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
drop policy if exists "Enable all for service role" on public.profiles;

-- Recreate policies with correct syntax
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Allow insert for authenticated users" on public.profiles
  for insert to authenticated with check (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Enable all for service role" on public.profiles
  using (auth.role() = 'service_role');
