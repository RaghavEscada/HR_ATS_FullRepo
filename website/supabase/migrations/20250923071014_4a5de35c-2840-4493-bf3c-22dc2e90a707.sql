-- Create applicants table for storing resume applications and CV data
CREATE TABLE IF NOT EXISTS public.applicants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  email_content_summary TEXT,
  candidate_summary TEXT, -- NEW: Store the full candidate summary from Google Sheets
  cv_scoring INTEGER CHECK (cv_scoring >= 1 AND cv_scoring <= 10) NOT NULL DEFAULT 5,
  quick_read TEXT,
  cv_gdrive_link TEXT,
  status TEXT DEFAULT 'Applied' CHECK (status IN ('Applied', 'Reviewing', 'Interviewed', 'Rejected', 'Hired')),
  is_interviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add candidate_summary column if table already exists
ALTER TABLE public.applicants 
ADD COLUMN IF NOT EXISTS candidate_summary TEXT;

-- Make user_id nullable to allow Apps Script inserts
ALTER TABLE public.applicants 
ALTER COLUMN user_id DROP NOT NULL;

-- Set default user_id for new records
ALTER TABLE public.applicants 
ALTER COLUMN user_id SET DEFAULT '5f4de73c-3c0c-4b2f-ac2f-8d6590303a61';

-- Update existing records with null user_id
UPDATE public.applicants 
SET user_id = '5f4de73c-3c0c-4b2f-ac2f-8d6590303a61' 
WHERE user_id IS NULL;

-- Enable Row Level Security
ALTER TABLE public.applicants ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own applicants" ON public.applicants;
DROP POLICY IF EXISTS "Users can create their own applicants" ON public.applicants;
DROP POLICY IF EXISTS "Users can update their own applicants" ON public.applicants;
DROP POLICY IF EXISTS "Users can delete their own applicants" ON public.applicants;
DROP POLICY IF EXISTS "Admin users can view all applicants" ON public.applicants;
DROP POLICY IF EXISTS "Allow anonymous inserts for Apps Script" ON public.applicants;

-- Create policies for user access
CREATE POLICY "Users can view their own applicants" 
ON public.applicants 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own applicants" 
ON public.applicants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Users can update their own applicants" 
ON public.applicants 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own applicants" 
ON public.applicants 
FOR DELETE 
USING (auth.uid() = user_id);

-- Admin policy: Allow admin users to see all applicants
CREATE POLICY "Admin users can view all applicants"
ON public.applicants
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM auth.users
    WHERE auth.users.id = auth.uid()
    AND auth.users.raw_app_meta_data->>'role' = 'admin'
  )
);

-- Allow anonymous inserts for Google Apps Script
CREATE POLICY "Allow anonymous inserts for Apps Script"
ON public.applicants
FOR INSERT
WITH CHECK (true);

-- Create or replace function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS update_applicants_updated_at ON public.applicants;
CREATE TRIGGER update_applicants_updated_at
  BEFORE UPDATE ON public.applicants
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applicants_user_id ON public.applicants(user_id);
CREATE INDEX IF NOT EXISTS idx_applicants_email ON public.applicants(email);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON public.applicants(status);
CREATE INDEX IF NOT EXISTS idx_applicants_cv_scoring ON public.applicants(cv_scoring);
CREATE INDEX IF NOT EXISTS idx_applicants_is_interviewed ON public.applicants(is_interviewed);
CREATE INDEX IF NOT EXISTS idx_applicants_created_at ON public.applicants(created_at DESC);

-- Full-text search index for candidate summary
CREATE INDEX IF NOT EXISTS idx_applicants_candidate_summary_fts 
ON public.applicants 
USING gin(to_tsvector('english', candidate_summary));

-- Enable real-time subscriptions for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.applicants;

-- Optional: View your current table structure
-- SELECT column_name, data_type, is_nullable, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'applicants' 
-- ORDER BY ordinal_position;