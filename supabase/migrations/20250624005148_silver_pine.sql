-- Ensure email confirmation is disabled for easier testing
UPDATE auth.config SET value = 'false' WHERE parameter = 'enable_confirmations';

-- Create admin user if it doesn't exist
DO $$
BEGIN
  -- Insert admin user into auth.users if not exists
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@rifa.com') THEN
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@rifa.com',
      crypt('admin123', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"nome":"Administrador","cpf":"000.000.000-00"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
  END IF;
END $$;

-- Ensure the trigger function handles errors gracefully
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Try to insert user profile
  INSERT INTO public.users (auth_id, nome, cpf, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    COALESCE(NEW.raw_user_meta_data->>'cpf', '000.000.000-00'),
    CASE 
      WHEN NEW.email = 'admin@rifa.com' THEN 'admin'::user_role
      ELSE 'user'::user_role
    END
  );
  
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If user already exists, just return
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't fail the auth process
    RAISE LOG 'Error creating user profile for %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Ensure RLS policies are working correctly
-- Update user policies to be more permissive for registration
DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
CREATE POLICY "Users can insert own data" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK (auth_id = auth.uid());

-- Allow anon users to read system config for registration page
DROP POLICY IF EXISTS "Anyone can read system config" ON public.system_config;
CREATE POLICY "Anyone can read system config" ON public.system_config
  FOR SELECT TO anon, authenticated
  USING (true);