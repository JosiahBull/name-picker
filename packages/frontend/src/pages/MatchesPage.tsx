import { useState, useEffect } from 'react';
import {
	Box,
	Typography,
	Card,
	CardContent,
	CircularProgress,
	Container,
	Chip,
	Avatar,
} from '@mui/material';
import { Favorite, People } from '@mui/icons-material';
import { Match } from '@name-picker/shared';
import { useApi } from '../context/ApiContext';
import { useUser } from '../context/UserContext';
import Layout from '../components/Layout';

export default function MatchesPage() {
	const { api } = useApi();
	const { currentUser } = useUser();
	const [matches, setMatches] = useState<Match[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const loadMatches = async () => {
			if (!currentUser) return;

			try {
				const userMatches = await api.getMatches(currentUser.id);
				setMatches(userMatches);
			} catch (error) {
				console.error('Failed to load matches:', error);
			} finally {
				setLoading(false);
			}
		};

		loadMatches();
	}, [api, currentUser]);

	const formatDate = (date: Date) => {
		return new Intl.DateTimeFormat('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		}).format(new Date(date));
	};

	return (
		<Layout title="Your Matches" showBackButton>
			<Container maxWidth="md" sx={{ py: 3 }}>
				{loading ? (
					<Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
						<CircularProgress size={60} />
					</Box>
				) : matches.length === 0 ? (
					<Box sx={{ textAlign: 'center', py: 8 }}>
						<Avatar sx={{ mx: 'auto', mb: 3, bgcolor: 'primary.light', width: 80, height: 80 }}>
							<Favorite sx={{ fontSize: 40 }} />
						</Avatar>
						<Typography variant="h5" gutterBottom>
							No matches yet
						</Typography>
						<Typography variant="body1" color="text.secondary">
							Keep swiping to find names you both love! When you and your partner both like the same
							name, it will appear here.
						</Typography>
					</Box>
				) : (
					<>
						<Box sx={{ mb: 4, textAlign: 'center' }}>
							<Typography variant="h4" gutterBottom>
								🎉 Your Name Matches
							</Typography>
							<Typography variant="body1" color="text.secondary">
								These are the names you both liked. Take your time to discuss and choose your
								favorite!
							</Typography>
						</Box>

						<Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
							{matches.map((match) => (
								<Card
									key={match.id}
									sx={{
										transition: 'transform 0.2s, box-shadow 0.2s',
										'&:hover': {
											transform: 'translateY(-2px)',
											boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
										},
									}}
								>
									<CardContent sx={{ p: 3 }}>
										<Box
											sx={{
												display: 'flex',
												alignItems: 'center',
												justifyContent: 'space-between',
												mb: 2,
											}}
										>
											<Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
												{match.name}
											</Typography>
											<Chip icon={<Favorite />} label="Match" color="primary" variant="outlined" />
										</Box>

										<Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
											<People sx={{ color: 'text.secondary', fontSize: 20 }} />
											<Typography variant="body2" color="text.secondary">
												Liked by both partners
											</Typography>
										</Box>

										<Typography variant="body2" color="text.secondary">
											Matched on {formatDate(match.matchedAt)}
										</Typography>
									</CardContent>
								</Card>
							))}
						</Box>

						<Box sx={{ mt: 4, p: 3, bgcolor: 'primary.light', borderRadius: 2 }}>
							<Typography variant="body1" sx={{ textAlign: 'center' }}>
								💡 <strong>Next steps:</strong> Discuss these matched names with your partner and
								choose the one that feels right for your family!
							</Typography>
						</Box>
					</>
				)}
			</Container>
		</Layout>
	);
}
