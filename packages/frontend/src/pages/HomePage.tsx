import { Box, Typography, Button, Container, Paper } from '@mui/material';
import { Favorite, Analytics, People, CloudUpload } from '@mui/icons-material';
import { route } from 'preact-router';
import { useUser } from '../context/UserContext';
import Layout from '../components/Layout';

export default function HomePage() {
	const { currentUser } = useUser();

	return (
		<Layout title="Name Picker">
			<Container maxWidth="sm" sx={{ py: 4 }}>
				<Box sx={{ textAlign: 'center', mb: 4 }}>
					<Typography variant="h3" gutterBottom>
						Welcome, {currentUser?.displayName}!
					</Typography>
					<Typography variant="h5" color="primary" gutterBottom>
						Find Your Perfect Last Name
					</Typography>
					<Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
						Swipe through last names together and discover your matches. It's like
						Tinder, but for choosing your family name!
					</Typography>
				</Box>

				<Paper sx={{ p: 4, mb: 4 }}>
					<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
						<Button
							variant="contained"
							size="large"
							startIcon={<Favorite />}
							onClick={() => route('/swipe')}
							sx={{ py: 2 }}
						>
							Start Swiping
						</Button>

						<Button
							variant="outlined"
							size="large"
							startIcon={<CloudUpload />}
							onClick={() => route('/upload')}
							sx={{ py: 2 }}
						>
							Upload Names
						</Button>

						<Button
							variant="outlined"
							size="large"
							startIcon={<People />}
							onClick={() => route('/matches')}
							sx={{ py: 2 }}
						>
							View Matches
						</Button>

						<Button
							variant="outlined"
							size="large"
							startIcon={<Analytics />}
							onClick={() => route('/analytics')}
							sx={{ py: 2 }}
						>
							Analytics
						</Button>
					</Box>
				</Paper>

				<Box sx={{ textAlign: 'center' }}>
					<Typography variant="body2" color="text.secondary">
						💡 Tip: Swipe right to like a name, left to pass. Names you both like will
						appear in your matches!
					</Typography>
				</Box>
			</Container>
		</Layout>
	);
}
