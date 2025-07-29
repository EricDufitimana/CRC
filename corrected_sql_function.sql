-- Updated SQL function that matches your new profiles table structure
-- More robust version that handles potential errors
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert into profiles table with the correct column mapping
  INSERT INTO public.profiles (
    user_id,          -- References auth.users.id (UUID)
    Names,            -- Your column is called "Names" not "name"
    email,            -- Email from auth.users
    role,             -- Default role
    is_new_user,      -- Mark as new user
    welcome_email_sent, -- Email not sent yet
    created_at        -- Will use default value
  )
  VALUES (
    NEW.id,                      -- The UUID from auth.users
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'first_name',
      'User'
    ),
    COALESCE(NEW.email, ''),     -- Handle null email case
    'student',                   -- Default role
    TRUE,                        -- Mark as new user
    FALSE,                       -- Email not sent yet
    NOW()                        -- Current timestamp
  )
  ON CONFLICT (user_id) DO UPDATE  -- Conflict on the user_id
  SET 
    Names = COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      NEW.raw_user_meta_data->>'first_name',
      'User'
    ),
    email = COALESCE(NEW.email, ''),  -- Update email if changed
    is_new_user = FALSE;              -- Existing users are not new
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error (you can check Supabase logs)
    RAISE LOG 'Error in handle_new_user trigger: %', SQLERRM;
    -- Return NEW to prevent the auth.users insert from failing
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 