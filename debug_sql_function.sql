-- Debug version of the SQL function to identify the issue
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log the incoming data for debugging
  RAISE LOG 'handle_new_user triggered for user: %', NEW.id;
  RAISE LOG 'User email: %', NEW.email;
  RAISE LOG 'User metadata: %', NEW.raw_user_meta_data;
  
  -- Check if profile already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE user_id = NEW.id) THEN
    RAISE LOG 'Profile already exists for user: %', NEW.id;
    RETURN NEW;
  END IF;

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
  );
  
  RAISE LOG 'Profile created successfully for user: %', NEW.id;
  RETURN NEW;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Log the detailed error
    RAISE LOG 'Error in handle_new_user trigger for user %: %', NEW.id, SQLERRM;
    RAISE LOG 'Error detail: %', SQLSTATE;
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