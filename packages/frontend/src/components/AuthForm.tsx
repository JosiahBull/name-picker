import { useState } from 'preact/hooks';
import {
	Box,
	TextField,
	Button,
	Alert,
	Paper,
	CircularProgress,
} from '@mui/material';
import { supabase } from '../lib/supabase';

interface AuthFormProps {
	onSuccess: () => void;
}

export default function AuthForm({ onSuccess }: AuthFormProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleSubmit = async (e: Event) => {
		e.preventDefault();
		setError(null);
		setLoading(true);

		try {
			const { error } = await supabase.auth.signInWithPassword({
				email,
				password,
			});
			if (error) throw error;
			onSuccess();
		} catch (err) {
			setError(err instanceof Error ? err.message : 'An error occurred');
		} finally {
			setLoading(false);
		}
	};

	return (
		<Paper sx={{ p: 4, maxWidth: 400, mx: 'auto' }}>
			<Box component="form" onSubmit={handleSubmit}>
				{error && (
					<Alert severity="error" sx={{ mb: 2 }}>
						{error}
					</Alert>
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
					) :
						'Login'
					}
				</Button>
			</Box>
		</Paper>
	);
}
