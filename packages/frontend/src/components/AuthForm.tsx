import { useState } from 'preact/hooks';
import {
	Box,
	TextField,
	Button,
	Typography,
	Alert,
	Paper,
	Tabs,
	Tab,
	CircularProgress,
} from '@mui/material';
import { supabase } from '../lib/supabase';

interface AuthFormProps {
	onSuccess: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
	const [mode, setMode] = useState<'login' | 'signup'>('login');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [username, setUsername] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			if (mode === 'login') {
				const { error } = await supabase.auth.signInWithPassword({
					email,
					password,
				});
				if (error) throw error;
			} else {
				// Validate username
				if (!['joe', 'sam'].includes(username.toLowerCase())) {
					throw new Error('Username must be either "joe" or "sam"');
				}

				const { error: signUpError } = await supabase.auth.signUp({
					email,
					password,
					options: {
						data: {
							username: username.toLowerCase(),
						},
					},
				});
				if (signUpError) throw signUpError;

				// Create user profile
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (user) {
					const { error: profileError } = await supabase.from('user_profiles').insert({
						id: user.id,
						username: username.toLowerCase(),
						display_name: username,
						email: email,
					});
					if (profileError) throw profileError;
				}
			}
			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
			<Tabs
				value={mode}
				onChange={(_, value) => setMode(value as 'login' | 'signup')}
				sx={{ mb: 3 }}
				centered
			>
				<Tab label="Login" value="login" />
				<Tab label="Sign Up" value="signup" />
			</Tabs>

			<Box component="form" onSubmit={handleSubmit}>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
				)}

				{mode === 'signup' && (
					<TextField
						fullWidth
						label="Username"
						value={username}
						onChange={(e: Event) => setUsername((e.target as HTMLInputElement).value)}
						margin="normal"
						required
						helperText="Must be either 'joe' or 'sam'"
						disabled={loading}
					/>
				)}

				<TextField
					fullWidth
					label="Email"
					type="email"
					value={email}
					onChange={(e: Event) => setEmail((e.target as HTMLInputElement).value)}
					margin="normal"
					required
					disabled={loading}
				/>

				<TextField
					fullWidth
					label="Password"
					type="password"
					value={password}
					onChange={(e: Event) => setPassword((e.target as HTMLInputElement).value)}
					margin="normal"
					required
					helperText={mode === 'signup' ? 'Minimum 6 characters' : ''}
					disabled={loading}
				/>

				<Button
					type="submit"
					fullWidth
					variant="contained"
					sx={{ mt: 3, mb: 2 }}
					disabled={loading}
				>
					{loading ? (
						<CircularProgress size={24} />
					) : mode === 'login' ? (
						'Login'
					) : (
						'Sign Up'
					)}
				</Button>

				{mode === 'login' && (
					<Typography variant="body2" align="center" color="text.secondary">
						Default users: joe@example.com / sam@example.com (password: password123)
					</Typography>
				)}
			</Box>
		</Paper>
	);
}
