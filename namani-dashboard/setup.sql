
-- =========================================
-- NAMANI ADMIN DASHBOARD
-- Supabase Database Setup
-- =========================================

create extension if not exists pgcrypto;

-- =========================================
-- 1. BLOGS
-- =========================================

create table if not exists public.blogs (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    image_url text,
    description text not null default '',
    content text not null,
    published boolean not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================================
-- 2. PROJECTS
-- =========================================

create table if not exists public.projects (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    description text not null default '',
    image_url text,
    project_url text,
    created_at timestamptz not null default now()
);

-- =========================================
-- 3. SKILLS
-- =========================================

create table if not exists public.skills (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    level text,
    created_at timestamptz not null default now()
);

-- =========================================
-- 4. CONTACT MESSAGES
-- =========================================

create table if not exists public.messages (
    id uuid primary key default gen_random_uuid(),
    name text not null,
    email text not null,
    content text not null,
    created_at timestamptz not null default now()
);

-- =========================================
-- 5. UPDATED_AT AUTOMATION
-- =========================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists blogs_updated_at on public.blogs;

create trigger blogs_updated_at
before update on public.blogs
for each row
execute function public.set_updated_at();

-- =========================================
-- 6. ENABLE ROW LEVEL SECURITY
-- =========================================

alter table public.blogs enable row level security;
alter table public.projects enable row level security;
alter table public.skills enable row level security;
alter table public.messages enable row level security;

-- =========================================
-- 7. REMOVE OLD POLICIES
-- Run this setup as the project owner.
-- =========================================

drop policy if exists "Published blogs are publicly readable"
on public.blogs;

drop policy if exists "Admin can manage blogs"
on public.blogs;

drop policy if exists "Admin can manage projects"
on public.projects;

drop policy if exists "Admin can manage skills"
on public.skills;

drop policy if exists "Admin can read messages"
on public.messages;

drop policy if exists "Public can submit contact messages"
on public.messages;

-- =========================================
-- 8. PUBLIC CAN ONLY READ PUBLISHED BLOGS
-- =========================================

create policy "Published blogs are publicly readable"
on public.blogs
for select
to anon, authenticated
using (published = true);

-- =========================================
-- 9. ADMIN-ONLY BLOG MANAGEMENT
-- =========================================
-- Replace the UUID below with your real admin
-- account UUID before running this section.

create policy "Admin can manage blogs"
on public.blogs
for all
to authenticated
using (
    (select auth.uid()) =
    'a0dca848-6e1e-4aae-8a02-20285c697ba8'::uuid
)
with check (
    (select auth.uid()) =
    'a0dca848-6e1e-4aae-8a02-20285c697ba8'::uuid
);

-- =========================================
-- 10. ADMIN-ONLY PROJECT MANAGEMENT
-- =========================================

create policy "Admin can manage projects"
on public.projects
for all
to authenticated
using (
    (select auth.uid()) =
    'a0dca848-6e1e-4aae-8a02-20285c697ba8'::uuid
)
with check (
    (select auth.uid()) =
    'a0dca848-6e1e-4aae-8a02-20285c697ba8'::uuid
);

-- =========================================
-- 11. ADMIN-ONLY SKILLS MANAGEMENT
-- =========================================

create policy "Admin can manage skills"
on public.skills
for all
to authenticated
using (
    (select auth.uid()) =
    'a0dca848-6e1e-4aae-8a02-20285c697ba8'::uuid
)
with check (
    (select auth.uid()) =
    'a0dca848-6e1e-4aae-8a02-20285c697ba8'::uuid
);

-- =========================================
-- 12. ADMIN CAN READ MESSAGES
-- =========================================

create policy "Admin can read messages"
on public.messages
for select
to authenticated
using (
    (select auth.uid()) =
    'a0dca848-6e1e-4aae-8a02-20285c697ba8'::uuid
);

-- =========================================
-- 13. PUBLIC CONTACT FORM SUBMISSIONS
-- =========================================
-- Allows visitors to send messages from your
-- portfolio without giving them read access.

create policy "Public can submit contact messages"
on public.messages
for insert
to anon, authenticated
with check (
    length(trim(name)) between 1 and 100
    and length(trim(email)) between 3 and 254
    and length(trim(content)) between 1 and 5000
);

-- =========================================
-- END
-- =========================================