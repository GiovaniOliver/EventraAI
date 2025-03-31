-- Create a trigger to handle new user registrations

-- First, create the function that will be called when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id, 
    email, 
    username, 
    display_name, 
    password, 
    is_admin, 
    subscription_tier, 
    subscription_status, 
    created_at
  ) VALUES (
    new.id, 
    new.email, 
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)), 
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)), 
    'MANAGED_BY_SUPABASE_AUTH', 
    false, 
    'free', 
    'active', 
    now()
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call this function whenever a new user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
