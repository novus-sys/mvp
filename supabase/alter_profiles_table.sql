-- Alter profiles table to add missing columns for profile data
-- This script adds columns that are being used in the application but don't exist in the table

-- Add missing columns directly (simpler approach)

-- Add title column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS title TEXT;

-- Add location column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;

-- Add bio column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add skills column if it doesn't exist (as a text array)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS skills TEXT[];

-- Add academic_timeline column if it doesn't exist (as a JSONB array)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS academic_timeline JSONB;

-- Add stats column if it doesn't exist (as a JSONB object)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stats JSONB;

-- Add updated_at column if it doesn't exist
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create function for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger if it doesn't exist
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Verify the changes
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;
