-- Insert test users into auth.users and auth.identities
-- Note: These are manually created test users with fixed UUIDs for consistency

-- Insert Joe
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
    '550e8400-e29b-41d4-a716-446655440001',
    'authenticated',
    'authenticated',
    'joe@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "joe"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Insert Sam
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
    '550e8400-e29b-41d4-a716-446655440002',
    'authenticated',
    'authenticated',
    'sam@example.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NULL,
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"username": "sam"}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
) ON CONFLICT (id) DO NOTHING;

-- Insert corresponding identities
INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
) VALUES 
(
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440001',
    '{"sub": "550e8400-e29b-41d4-a716-446655440001", "email": "joe@example.com"}',
    'email',
    'joe@example.com',
    NOW(),
    NOW(),
    NOW()
),
(
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440002',
    '{"sub": "550e8400-e29b-41d4-a716-446655440002", "email": "sam@example.com"}',
    'email',
    'sam@example.com',
    NOW(),
    NOW(),
    NOW()
) ON CONFLICT (id) DO NOTHING;

-- Insert user profiles
INSERT INTO public.user_profiles (id, username, display_name, email) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'joe', 'Joe', 'joe@example.com'),
('550e8400-e29b-41d4-a716-446655440002', 'sam', 'Sam', 'sam@example.com')
ON CONFLICT (id) DO NOTHING;

-- Insert sample names
INSERT INTO public.names (name, origin, meaning, popularity, gender) VALUES
('Smith', 'English', 'Metalworker', 95, 'neutral'),
('Johnson', 'English', 'Son of John', 90, 'neutral'),
('Williams', 'English', 'Son of William', 85, 'neutral'),
('Brown', 'English', 'Color name', 80, 'neutral'),
('Jones', 'Welsh', 'Son of John', 88, 'neutral')
ON CONFLICT (name) DO NOTHING;
