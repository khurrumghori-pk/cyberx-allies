
-- Add is_former_employee flag to profiles for "Ask a Former Employee" feature
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_former_employee boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS job_title text;
