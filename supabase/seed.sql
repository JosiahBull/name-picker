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
('Jones', 'Welsh', 'Son of John', 88, 'neutral'),
('Garcia', 'Spanish', 'Bear', 75, 'neutral'),
('Miller', 'English', 'Grain grinder', 78, 'neutral'),
('Davis', 'Welsh', 'Son of David', 82, 'neutral'),
('Rodriguez', 'Spanish', 'Son of Rodrigo', 73, 'neutral'),
('Wilson', 'English', 'Son of Will', 77, 'neutral'),
('Martinez', 'Spanish', 'Son of Martin', 70, 'neutral'),
('Anderson', 'Scandinavian', 'Son of Anders', 74, 'neutral'),
('Taylor', 'English', 'Tailor', 76, 'neutral'),
('Thomas', 'Aramaic', 'Twin', 79, 'neutral'),
('Hernandez', 'Spanish', 'Son of Hernando', 68, 'neutral'),
('Moore', 'English', 'Moorland dweller', 72, 'neutral'),
('Martin', 'Latin', 'Warlike', 75, 'neutral'),
('Jackson', 'English', 'Son of Jack', 81, 'neutral'),
('Thompson', 'Scottish', 'Son of Thomas', 69, 'neutral'),
('White', 'English', 'Fair-haired', 71, 'neutral'),
('Lopez', 'Spanish', 'Son of Lope', 67, 'neutral'),
('Lee', 'English', 'Meadow', 73, 'neutral'),
('Gonzalez', 'Spanish', 'Son of Gonzalo', 65, 'neutral'),
('Harris', 'English', 'Son of Harry', 70, 'neutral'),
('Clark', 'English', 'Cleric', 68, 'neutral'),
('Lewis', 'English', 'Famous warrior', 66, 'neutral'),
('Robinson', 'English', 'Son of Robin', 64, 'neutral'),
('Walker', 'English', 'Walker', 67, 'neutral'),
('Perez', 'Spanish', 'Son of Pedro', 63, 'neutral'),
('Hall', 'English', 'Manor house', 65, 'neutral'),
('Young', 'English', 'Young', 62, 'neutral'),
('Allen', 'Celtic', 'Noble', 61, 'neutral'),
('Sanchez', 'Spanish', 'Son of Sancho', 60, 'neutral'),
('Wright', 'English', 'Craftsman', 59, 'neutral'),
('King', 'English', 'King', 58, 'neutral'),
('Scott', 'Scottish', 'From Scotland', 57, 'neutral'),
('Green', 'English', 'Green', 56, 'neutral'),
('Baker', 'English', 'Baker', 55, 'neutral'),
('Adams', 'English', 'Son of Adam', 54, 'neutral'),
('Nelson', 'English', 'Son of Neil', 53, 'neutral'),
('Hill', 'English', 'Hill', 52, 'neutral'),
('Ramirez', 'Spanish', 'Son of Ramiro', 51, 'neutral'),
('Campbell', 'Scottish', 'Crooked mouth', 50, 'neutral'),
('Mitchell', 'English', 'Like God', 49, 'neutral'),
('Roberts', 'English', 'Son of Robert', 48, 'neutral'),
('Carter', 'English', 'Cart driver', 47, 'neutral'),
('Phillips', 'Welsh', 'Son of Philip', 46, 'neutral'),
('Evans', 'Welsh', 'Son of Evan', 45, 'neutral'),
('Turner', 'English', 'Turner', 44, 'neutral'),
('Torres', 'Spanish', 'Towers', 43, 'neutral'),
('Parker', 'English', 'Park keeper', 42, 'neutral')
ON CONFLICT (name) DO NOTHING;
