/*
  # Fix Authentication Trigger Error

  1. Issues Fixed
    - Create proper `handle_new_user` trigger function
    - Set up trigger on `auth.users` table to create profile automatically
    - Ensure proper permissions and RLS policies
    - Fix any constraint issues

  2. Security
    - Maintain RLS on profiles table
    - Ensure proper user isolation
*/

-- Create the trigger function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Create default categories for the new user
  INSERT INTO public.categories (user_id, name, type, color, icon) VALUES
    (NEW.id, 'Food & Dining', 'expense', '#EF4444', 'utensils'),
    (NEW.id, 'Transportation', 'expense', '#3B82F6', 'car'),
    (NEW.id, 'Shopping', 'expense', '#8B5CF6', 'shopping-bag'),
    (NEW.id, 'Entertainment', 'expense', '#F59E0B', 'film'),
    (NEW.id, 'Bills & Utilities', 'expense', '#EF4444', 'receipt'),
    (NEW.id, 'Healthcare', 'expense', '#10B981', 'heart'),
    (NEW.id, 'Education', 'expense', '#6366F1', 'book'),
    (NEW.id, 'Travel', 'expense', '#EC4899', 'plane'),
    (NEW.id, 'Salary', 'income', '#10B981', 'dollar-sign'),
    (NEW.id, 'Freelance', 'income', '#059669', 'briefcase'),
    (NEW.id, 'Investment', 'income', '#0891B2', 'trending-up'),
    (NEW.id, 'Other Income', 'income', '#6B7280', 'plus');
    
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ensure the profiles table has proper RLS policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Create RLS policies that work with the trigger
CREATE POLICY "Enable insert for authenticated users only" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Ensure RLS is enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;
GRANT ALL ON public.categories TO anon, authenticated;
GRANT ALL ON public.transactions TO anon, authenticated;
GRANT ALL ON public.budgets TO anon, authenticated;