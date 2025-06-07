-- Script to set up admin roles in Supabase auth
-- Run this after creating your first admin user

-- Function to update user role in raw_user_meta_data
CREATE OR REPLACE FUNCTION set_user_role(user_email TEXT, user_role TEXT)
RETURNS VOID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Get user ID from email
    SELECT id INTO user_id 
    FROM auth.users 
    WHERE email = user_email;
    
    IF user_id IS NULL THEN
        RAISE EXCEPTION 'User with email % not found', user_email;
    END IF;
    
    -- Update user metadata with role
    UPDATE auth.users 
    SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || jsonb_build_object('role', user_role)
    WHERE id = user_id;
    
    RAISE NOTICE 'Role % assigned to user %', user_role, user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage (replace with actual admin email):
-- SELECT set_user_role('admin@yourbusiness.com', 'owner');
-- SELECT set_user_role('manager@yourbusiness.com', 'manager');
-- SELECT set_user_role('cashier@yourbusiness.com', 'employee');
-- SELECT set_user_role('accountant@yourbusiness.com', 'accountant');

-- Function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT raw_user_meta_data ->> 'role' INTO user_role
    FROM auth.users 
    WHERE id = user_id;
    
    RETURN COALESCE(user_role, 'employee');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user has permission
CREATE OR REPLACE FUNCTION user_has_permission(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    role_hierarchy INTEGER;
    required_hierarchy INTEGER;
BEGIN
    user_role := get_user_role(user_id);
    
    -- Define role hierarchy (higher number = more permissions)
    role_hierarchy := CASE user_role
        WHEN 'owner' THEN 4
        WHEN 'manager' THEN 3
        WHEN 'accountant' THEN 2
        WHEN 'employee' THEN 1
        ELSE 0
    END;
    
    required_hierarchy := CASE required_role
        WHEN 'owner' THEN 4
        WHEN 'manager' THEN 3
        WHEN 'accountant' THEN 2
        WHEN 'employee' THEN 1
        ELSE 0
    END;
    
    RETURN role_hierarchy >= required_hierarchy;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
