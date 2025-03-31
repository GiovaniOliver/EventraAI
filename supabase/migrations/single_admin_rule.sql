-- Create a constraint function to ensure only one admin account exists
CREATE OR REPLACE FUNCTION check_admin_limit() 
RETURNS TRIGGER AS $$
BEGIN
  -- Only do this check if the new/updated record is trying to be an admin
  IF NEW.is_admin = TRUE THEN
    -- If another admin already exists with a different ID, prevent this change
    IF EXISTS (
      SELECT 1 FROM users 
      WHERE is_admin = TRUE 
      AND id != NEW.id
    ) THEN
      RAISE EXCEPTION 'Only one admin account is allowed in the system.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger that enforces the single admin constraint
DROP TRIGGER IF EXISTS enforce_single_admin ON users;
CREATE TRIGGER enforce_single_admin
BEFORE INSERT OR UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION check_admin_limit();

-- Function to help identify which account is the webmaster (admin)
CREATE OR REPLACE FUNCTION is_webmaster(user_id TEXT) 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = user_id 
    AND is_admin = TRUE
  );
END;
$$ LANGUAGE plpgsql;
