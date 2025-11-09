-- Create the profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  username text unique,
  email text unique,
  xp integer default 0 not null,
  level integer default 1 not null,
  wins_hard integer default 0 not null,
  wins_impossible integer default 0 not null,
  wins_kitten integer default 0 not null,
  losses_hard integer default 0 not null,
  losses_impossible integer default 0 not null,
  losses_kitten integer default 0 not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS if not already enabled
do $$
begin
  execute 'alter table if exists public.profiles enable row level security';
end $$;

-- Drop existing policies if they exist
do $$
begin
  if exists (select 1 from pg_policies where policyname = 'Public profiles are viewable by everyone') then
    drop policy "Public profiles are viewable by everyone" on public.profiles;
  end if;
  
  if exists (select 1 from pg_policies where policyname = 'Allow insert for authenticated users') then
    drop policy "Allow insert for authenticated users" on public.profiles;
  end if;
  
  if exists (select 1 from pg_policies where policyname = 'Users can update own profile') then
    drop policy "Users can update own profile" on public.profiles;
  end if;
  
  if exists (select 1 from pg_policies where policyname = 'Enable all for service role') then
    drop policy "Enable all for service role" on public.profiles;
  end if;
end $$;

-- Create policies
create policy "Public profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Allow insert for authenticated users" on public.profiles
  for insert to authenticated with check (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Enable all for service role" on public.profiles
  using (auth.role() = 'service_role');

-- Create or replace updated_at function
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists
do $$
begin
  if exists (select 1 from pg_trigger where tgname = 'on_profiles_updated') then
    drop trigger if exists on_profiles_updated on public.profiles;
  end if;
end $$;

-- Create trigger
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
