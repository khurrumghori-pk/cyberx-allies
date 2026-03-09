-- Update the handle_new_user function to auto-assign admin to specific email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  assigned_role app_role;
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, display_name, username)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
    CASE 
      WHEN NEW.email = 'khurrum.ghori@gmail.com' THEN 'Khurrum Ghori'
      ELSE NULL
    END
  );
  
  -- Assign role based on email
  IF NEW.email = 'khurrum.ghori@gmail.com' THEN
    assigned_role := 'admin';
  ELSE
    assigned_role := 'soc_analyst';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, assigned_role);
  
  RETURN NEW;
END;
$$;