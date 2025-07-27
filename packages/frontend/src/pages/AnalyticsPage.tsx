import { useState, useEffect } from 'preact/hooks';
import { Box, Typography, CircularProgress, Container } from '@mui/material';
import { Analytics } from '@name-picker/shared';
import { useApi } from '../context/ApiContext';
import { useUser } from '../context/UserContext';
import Layout from '../components/Layout';

export default function AnalyticsPage() {
	const { api } = useApi();
	const { currentUser } = useUser();
	const [analytics, setAnalytics] = useState<Analytics | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadAnalytics = async () => {
			if (!currentUser) return;

			try {
				const data = await api.getAnalytics(currentUser.id);
				setAnalytics(data);
			} catch (error) {
				console.error('Failed to load analytics:', error);
			} finally {
				setLoading(false);
			}
		};

		loadAnalytics();
	}, [api, currentUser]);

	if (loading) {
		return (
			<Layout title="Analytics" showBackButton>
				<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
					<CircularProgress size={60} />
				</Box>
			</Layout>
		);
	}

	if (!analytics) {
		return (
			<Layout title="Analytics" showBackButton>
				<Container maxWidth="md" sx={{ py: 3 }}>
					<Typography variant="h6" textAlign="center">
						No analytics data available
					</Typography>
				</Container>
			</Layout>
		);
	}

	return (
		<Layout title="Analytics" showBackButton>
			<Container maxWidth="md" sx={{ py: 3 }}>
				<Box sx={{ mb: 4, textAlign: 'center' }}>
					<Typography variant="h4" gutterBottom>
						📊 Your Swiping Stats
					</Typography>
					<Typography variant="body1" color="text.secondary">
						Here's how your name selection journey is going
					</Typography>
				</Box>

				<Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
					<Box
						sx={{
							textAlign: 'center',
							p: 3,
							bgcolor: 'background.paper',
							borderRadius: 2,
						}}
					>
						<Typography variant="h3" color="primary">
							{analytics.totalSwipes}
						</Typography>
						<Typography variant="body1">Total Swipes</Typography>
					</Box>

					<Box
						sx={{
							textAlign: 'center',
							p: 3,
							bgcolor: 'background.paper',
							borderRadius: 2,
						}}
					>
						<Typography variant="h3" color="success.main">
							{analytics.likes}
						</Typography>
						<Typography variant="body1">Names Liked</Typography>
					</Box>

					<Box
						sx={{
							textAlign: 'center',
							p: 3,
							bgcolor: 'background.paper',
							borderRadius: 2,
						}}
					>
						<Typography variant="h3" color="warning.main">
							{analytics.matches}
						</Typography>
						<Typography variant="body1">Matches Found</Typography>
					</Box>
				</Box>
			</Container>
		</Layout>
	);
}
