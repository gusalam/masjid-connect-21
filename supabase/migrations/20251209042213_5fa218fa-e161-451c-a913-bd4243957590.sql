-- Add status column to profiles table for approval workflow
ALTER TABLE public.profiles 
ADD COLUMN status TEXT NOT NULL DEFAULT 'pending' 
CHECK (status IN ('pending', 'approved', 'rejected'));

-- Add address column for jamaah data
ALTER TABLE public.profiles 
ADD COLUMN address TEXT;

-- Create index for faster status filtering
CREATE INDEX idx_profiles_status ON public.profiles(status);

-- Update RLS policy to allow admins to view and manage all profiles
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Everyone can view approved profiles and own profile"
ON public.profiles
FOR SELECT
USING (
  status = 'approved' 
  OR auth.uid() = id 
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update any profile (for approval/rejection)
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));