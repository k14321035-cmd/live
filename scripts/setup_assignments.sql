-- ==========================================================
-- Code Tutorium - Assignment Submissions Table Setup
-- Run this script in your Supabase SQL Editor
-- ==========================================================

-- 1. Create assignment submissions table
create table if not exists public.assignment_submissions (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    course_id text not null,                  -- e.g., 'sklearn', 'matplotlib', 'python', 'cpp', 'html'
    lecture_number integer default 0,         -- e.g., 0, 1, 27
    exercise_title text not null,              -- e.g., 'Exercise 1 · First sklearn Import'
    submission_type text not null default 'code', -- 'code', 'link', or 'file'
    content text,                             -- submitted source code or project repository URL
    file_name text,                           -- optional uploaded file name
    file_url text,                            -- optional uploaded file storage URL
    notes text,                               -- optional student comments/notes
    status text not null default 'submitted', -- 'submitted', 'reviewed', 'approved', 'needs_revision'
    grade text,                               -- optional grade e.g., 'A+', '100/100', 'Passed'
    feedback text,                            -- instructor or auto-review feedback
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create index for fast user lookup and filtering
create index if not exists idx_assignment_submissions_user 
    on public.assignment_submissions (user_id, created_at desc);

create index if not exists idx_assignment_submissions_course 
    on public.assignment_submissions (course_id, lecture_number);

-- 3. Enable Row Level Security (RLS)
alter table public.assignment_submissions enable row level security;

-- 4. RLS Policies

-- Policy A: Students can view only their own submissions
drop policy if exists "Users can view own assignment submissions" on public.assignment_submissions;
create policy "Users can view own assignment submissions"
    on public.assignment_submissions
    for select
    using (auth.uid() = user_id);

-- Policy B: Students can insert their own submissions
drop policy if exists "Users can insert own assignment submissions" on public.assignment_submissions;
create policy "Users can insert own assignment submissions"
    on public.assignment_submissions
    for insert
    with check (auth.uid() = user_id);

-- Policy C: Students can update their own submissions (e.g., resubmit or edit code)
drop policy if exists "Users can update own assignment submissions" on public.assignment_submissions;
create policy "Users can update own assignment submissions"
    on public.assignment_submissions
    for update
    using (auth.uid() = user_id);

-- Policy D: Students can delete their own submissions
drop policy if exists "Users can delete own assignment submissions" on public.assignment_submissions;
create policy "Users can delete own assignment submissions"
    on public.assignment_submissions
    for delete
    using (auth.uid() = user_id);
