-- Create a table for public profiles
create table public.profiles (
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

-- Set up Row Level Security (RLS)
alter table public.profiles enable row level security;

-- Create policies for profiles
create policy "Public profiles are viewable by everyone." on public.profiles
  for select using (true);

create policy "Users can insert their own profile." on public.profiles
  for insert with check (auth.uid() = id);

create policy "Users can update own profile." on public.profiles
  for update using (auth.uid() = id);

-- Create a function to handle new user signups
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to automatically create a profile when a new user signs up
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create a function to update the updated_at column
drop trigger if exists on_profiles_updated on public.profiles;
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql security definer;

-- Create a trigger to update the updated_at column
create trigger on_profiles_updated
  before update on public.profiles
  for each row execute procedure public.handle_updated_at();
