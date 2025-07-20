import { useState } from 'react';
import {
	Box,
	Typography,
	Button,
	Container,
	Paper,
	Avatar,
	TextField,
	Alert,
	CircularProgress,
} from '@mui/material';
import { Favorite } from '@mui/icons-material';
import { useUser } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
	const { login } = useUser();
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');
		setIsLoading(true);

		try {
			await login(email, password);
			navigate('/');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to login');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Box
			sx={{
				minHeight: '100vh',
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				justifyContent: 'center',
				background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
				p: 3,
			}}
		>
			<Container maxWidth="sm">
				<Paper
					sx={{
						p: 4,
						textAlign: 'center',
						borderRadius: 3,
						boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
					}}
				>
					<Box sx={{ mb: 4 }}>
						<Avatar
							sx={{
								mx: 'auto',
								mb: 2,
								bgcolor: 'primary.main',
								width: 80,
								height: 80,
							}}
						>
							<Favorite sx={{ fontSize: 40 }} />
						</Avatar>
						<Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
							Name Picker
						</Typography>
						<Typography variant="h6" color="text.secondary" gutterBottom>
							Choose Your Perfect Last Name Together
						</Typography>
					</Box>

					<Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
						<TextField
							margin="normal"
							required
							fullWidth
							id="email"
							label="Email Address"
							name="email"
							autoComplete="email"
							autoFocus
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							disabled={isLoading}
						/>
						<TextField
							margin="normal"
							required
							fullWidth
							name="password"
							label="Password"
							type="password"
							id="password"
							autoComplete="current-password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							disabled={isLoading}
						/>

						{error && (
							<Alert severity="error" sx={{ mt: 2 }}>
								{error}
							</Alert>
						)}

						<Button
							type="submit"
							fullWidth
							variant="contained"
							sx={{
								mt: 3,
								mb: 2,
								py: 1.5,
								fontSize: '1.1rem',
								textTransform: 'none',
								background: 'linear-gradient(45deg, #2196f3 30%, #21cbf3 90%)',
								'&:hover': {
									background: 'linear-gradient(45deg, #1976d2 30%, #0097a7 90%)',
								},
							}}
							disabled={isLoading}
						>
							{isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
						</Button>

						<Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
							<Typography variant="body2" color="text.secondary">
								💡 For Sam: use sam@example.com
								<br />
								💡 For Joe: use joe@example.com
								<br />
								Password: password123
							</Typography>
						</Box>
					</Box>
				</Paper>
			</Container>
		</Box>
	);
}