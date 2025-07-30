import { Box, Typography, Container, Avatar } from '@mui/material';
import { Favorite } from '@mui/icons-material';
import AuthForm from '../components/AuthForm';
import { route } from 'preact-router';

export default function LoginPage() {
	const handleAuthSuccess = () => {
		route('/');
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
				<Box sx={{ mb: 4, textAlign: 'center' }}>
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
					<Typography
						variant="h3"
						gutterBottom
						sx={{ fontWeight: 'bold', color: 'white' }}
					>
						Name Picker
					</Typography>
					<Typography
						variant="h6"
						sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
						gutterBottom
					>
						Choose Your Perfect Last Name Together
					</Typography>
				</Box>

				<AuthForm onSuccess={handleAuthSuccess} />
			</Container>
		</Box>
	);
}
