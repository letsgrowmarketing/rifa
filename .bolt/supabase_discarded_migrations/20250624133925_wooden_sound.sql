/*
  # Adicionar novo administrador ao sistema

  1. Novo Administrador
    - Email: suportefaturebet@gmail.com
    - Senha: 0l08xf1Nbui!OV
    - Role: admin

  2. Segurança
    - Criar usuário na tabela auth.users
    - Criar perfil correspondente na tabela public.users
    - Definir metadados corretos para RLS
*/

-- Adicionar novo administrador
DO $$
DECLARE
  new_admin_id uuid;
  admin_profile_exists boolean := false;
BEGIN
  -- Gerar UUID para o novo admin
  new_admin_id := gen_random_uuid();
  
  -- Verificar se o admin já existe
  SELECT EXISTS(SELECT 1 FROM auth.users WHERE email = 'suportefaturebet@gmail.com') INTO admin_profile_exists;
  
  -- Se o admin não existe, criar
  IF NOT admin_profile_exists THEN
    -- Inserir admin na tabela auth.users
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
      new_admin_id,
      'authenticated',
      'authenticated',
      'suportefaturebet@gmail.com',
      crypt('0l08xf1Nbui!OV', gen_salt('bf')),
      NOW(),
      NOW(),
      NOW(),
      '{"provider":"email","providers":["email"]}',
      '{"nome":"Suporte FatureBet","cpf":"000.000.001-00","user_role":"admin"}',
      NOW(),
      NOW(),
      '',
      '',
      '',
      ''
    );
    
    -- Criar perfil correspondente na tabela public.users
    INSERT INTO public.users (auth_id, nome, cpf, role, telefone)
    VALUES (
      new_admin_id,
      'Suporte FatureBet',
      '000.000.001-00',
      'admin'::user_role,
      NULL
    );
    
    RAISE LOG 'Novo administrador criado: suportefaturebet@gmail.com com ID: %', new_admin_id;
  ELSE
    RAISE LOG 'Administrador suportefaturebet@gmail.com já existe no sistema';
  END IF;
END $$;

-- Verificar se o usuário foi criado corretamente
DO $$
DECLARE
  auth_count integer;
  profile_count integer;
BEGIN
  SELECT COUNT(*) INTO auth_count FROM auth.users WHERE email = 'suportefaturebet@gmail.com';
  SELECT COUNT(*) INTO profile_count FROM public.users WHERE nome = 'Suporte FatureBet';
  
  RAISE LOG 'Verificação: Auth users com email suportefaturebet@gmail.com: %, Profiles com nome Suporte FatureBet: %', auth_count, profile_count;
END $$;