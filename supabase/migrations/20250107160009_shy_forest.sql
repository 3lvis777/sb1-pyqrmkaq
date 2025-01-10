/*
  # Simplify profiles policies to prevent recursion
  
  1. Changes
    - Remove all existing policies
    - Add simplified policies that avoid recursion
    - Use direct auth.uid() checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;

-- Create new simplified policies
CREATE POLICY "Enable read access to own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update access to own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for users"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Note: Admin access will be handled through database functions instead of policies
-- This prevents recursion while maintaining security