-- Add email column to user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS email TEXT;

-- Update existing rows to include email from auth.users
UPDATE public.user_profiles up
SET email = u.email
FROM auth.users u
WHERE up.id = u.id;