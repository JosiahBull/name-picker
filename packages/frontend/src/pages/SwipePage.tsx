import { useState, useEffect, useCallback } from 'preact/hooks';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { Name, SwipeDirection } from '@name-picker/shared';
import { useApi } from '../context/ApiContext';
import { useUser } from '../context/UserContext';
import Layout from '../components/Layout';
import NameCard from '../components/NameCard';

export default function SwipePage() {
	const { api } = useApi();
	const { currentUser } = useUser();
	const [currentName, setCurrentName] = useState<Name | null>(null);
	const [loading, setLoading] = useState(true);
	const [isMatch, setIsMatch] = useState(false);
	const [swipeCount, setSwipeCount] = useState(0);

	const loadNextName = useCallback(async () => {
		if (!currentUser) return;

		setLoading(true);
		try {
			const name = await api.getNextName(currentUser.id);
			setCurrentName(name);
		} catch (error) {
			console.error('Failed to load next name:', error);
		} finally {
			setLoading(false);
		}
	}, [api, currentUser]);

	useEffect(() => {
		if (currentUser) {
			loadNextName();
		}
	}, [currentUser, loadNextName]);

	const handleSwipe = async (direction: SwipeDirection) => {
		if (!currentName || !currentUser) return;

		setSwipeCount((prev) => prev + 1);

		try {
			const result = await api.swipeName({
				nameId: currentName.id,
				userId: currentUser.id,
				action: direction === 'right' ? 'like' : 'dislike',
				timestamp: new Date(),
			});

			if (result.isMatch) {
				setIsMatch(true);
				setTimeout(() => {
					setIsMatch(false);
					loadNextName();
				}, 2000);
			} else {
				setTimeout(() => {
					loadNextName();
				}, 300);
			}
		} catch (error) {
			console.error('Failed to process swipe:', error);
			loadNextName();
		}
	};

	return (
		<Layout title="Swipe Names" showBackButton>
			<Box
				sx={{
					flex: 1,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					p: 3,
					position: 'relative',
				}}
			>
				{/* Match celebration overlay */}
				<AnimatePresence>
					{isMatch && (
						<motion.div
							initial={{ opacity: 0, scale: 0.5 }}
							animate={{ opacity: 1, scale: 1 }}
							exit={{ opacity: 0, scale: 0.5 }}
							style={{
								position: 'absolute',
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								backgroundColor: 'rgba(76, 175, 80, 0.9)',
								display: 'flex',
								flexDirection: 'column',
								alignItems: 'center',
								justifyContent: 'center',
								zIndex: 1000,
							}}
						>
							<Typography
								variant="h2"
								sx={{ color: 'white', mb: 2, fontWeight: 'bold' }}
							>
								🎉 IT'S A MATCH! 🎉
							</Typography>
							<Typography variant="h4" sx={{ color: 'white' }}>
								{currentName?.name}
							</Typography>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Swipe counter */}
				<Box sx={{ mb: 3, textAlign: 'center' }}>
					<Typography variant="h6" color="primary">
						Names Reviewed: {swipeCount}
					</Typography>
				</Box>

				{/* Main content */}
				{loading ? (
					<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
						<CircularProgress size={60} sx={{ mb: 2 }} />
						<Typography variant="body1">Loading next name...</Typography>
					</Box>
				) : currentName ? (
					<NameCard name={currentName} onSwipe={handleSwipe} disabled={isMatch} />
				) : (
					<Box sx={{ textAlign: 'center' }}>
						<Typography variant="h5" gutterBottom>
							🎊 All done for now!
						</Typography>
						<Typography variant="body1" sx={{ mb: 3 }}>
							You've reviewed all available names. Check back later for more options!
						</Typography>
						<Button variant="contained" onClick={() => window.history.back()}>
							Go Back
						</Button>
					</Box>
				)}

				{/* Instructions */}
				{currentName && !loading && (
					<Box sx={{ mt: 4, textAlign: 'center', maxWidth: 400 }}>
						<Typography variant="body2" color="text.secondary">
							💡 Drag the card left or right, or use the buttons below to make your
							choice
						</Typography>
					</Box>
				)}
			</Box>
		</Layout>
	);
}
