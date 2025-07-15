import { Box, Typography, Button, Container, Paper, Avatar } from '@mui/material'
import { Person, Favorite } from '@mui/icons-material'
import { useUser, UserId } from '../context/UserContext'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
	const { login, users } = useUser()
	const navigate = useNavigate()

	const handleLogin = (userId: UserId) => {
		login(userId)
		navigate('/')
	}

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
						<Typography variant="body1" color="text.secondary">
							Select your profile to start swiping through name options
						</Typography>
					</Box>

					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						<Typography variant="h5" sx={{ mb: 2, fontWeight: 500 }}>
							Who are you?
						</Typography>

						{Object.entries(users).map(([userId, user]) => (
							<Button
								key={user.id}
								variant="contained"
								size="large"
								startIcon={<Person />}
								onClick={() => handleLogin(userId as UserId)}
								sx={{
									py: 2,
									fontSize: '1.1rem',
									textTransform: 'none',
									background: `linear-gradient(45deg, ${
										userId === 'joe' ? '#2196f3 30%, #21cbf3 90%' : '#f44336 30%, #ff9800 90%'
									})`,
									'&:hover': {
										background: `linear-gradient(45deg, ${
											userId === 'joe' ? '#1976d2 30%, #0097a7 90%' : '#d32f2f 30%, #f57c00 90%'
										})`,
									},
								}}
							>
								{user.displayName}
							</Button>
						))}
					</Box>

					<Box sx={{ mt: 4, p: 2, bgcolor: 'background.default', borderRadius: 2 }}>
						<Typography variant="body2" color="text.secondary">
							💡 Your selection will be saved and remembered for future visits
						</Typography>
					</Box>
				</Paper>
			</Container>
		</Box>
	)
}