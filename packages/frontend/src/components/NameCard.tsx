import { useState } from 'preact/hooks';
import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import { Name, SwipeDirection } from '@name-picker/shared';

interface NameCardProps {
	name: Name;
	onSwipe: (direction: SwipeDirection) => void;
	disabled?: boolean;
}

export default function NameCard({ name, onSwipe, disabled = false }: NameCardProps) {
	const [exitX, setExitX] = useState(0);
	const x = useMotionValue(0);
	const rotate = useTransform(x, [-200, 200], [-30, 30]);
	const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

	const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
		const threshold = 100;
		const { offset, velocity } = info;

		if (offset.x > threshold || velocity.x > 500) {
			setExitX(1000);
			onSwipe('right');
		} else if (offset.x < -threshold || velocity.x < -500) {
			setExitX(-1000);
			onSwipe('left');
		}
	};

	const handleSwipeButton = (direction: SwipeDirection) => {
		if (disabled) return;
		setExitX(direction === 'right' ? 1000 : -1000);
		onSwipe(direction);
	};

	return (
		<motion.div
			data-testid="name-card"
			style={{
				x,
				rotate,
				opacity,
				cursor: disabled ? 'default' : 'grab',
			}}
			drag={disabled ? false : 'x'}
			dragConstraints={{ left: 0, right: 0 }}
			onDragEnd={handleDragEnd}
			animate={exitX !== 0 ? { x: exitX } : {}}
			transition={{ duration: 0.3 }}
			whileDrag={{ cursor: 'grabbing' }}
		>
			<Card
				sx={{
					width: 300,
					height: 400,
					display: 'flex',
					flexDirection: 'column',
					position: 'relative',
					userSelect: 'none',
					background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
					color: 'white',
				}}
			>
				<CardContent
					sx={{
						flex: 1,
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'center',
						alignItems: 'center',
						textAlign: 'center',
						p: 3,
					}}
				>
					<Typography
						variant="h2"
						component="h1"
						gutterBottom
						sx={{ fontWeight: 'bold' }}
					>
						{name.name}
					</Typography>

					{name.origin && (
						<Chip
							label={name.origin}
							variant="outlined"
							sx={{
								mb: 2,
								borderColor: 'rgba(255, 255, 255, 0.5)',
								color: 'white',
							}}
						/>
					)}

					{name.meaning && (
						<Typography variant="body1" sx={{ mb: 2, fontStyle: 'italic' }}>
							"{name.meaning}"
						</Typography>
					)}

					{name.popularity && (
						<Box sx={{ mt: 'auto' }}>
							<Typography variant="body2" sx={{ opacity: 0.8 }}>
								Popularity: {name.popularity}%
							</Typography>
						</Box>
					)}
				</CardContent>

				{/* Swipe indicators */}
				<motion.div
					style={{
						position: 'absolute',
						top: '50%',
						left: '20px',
						transform: 'translateY(-50%)',
						opacity: useTransform(x, [-100, -50], [1, 0]),
					}}
				>
					<Typography
						variant="h4"
						sx={{
							color: '#f44336',
							fontWeight: 'bold',
							border: '3px solid #f44336',
							borderRadius: '8px',
							padding: '8px 16px',
							rotate: '-30deg',
						}}
					>
						NOPE
					</Typography>
				</motion.div>

				<motion.div
					style={{
						position: 'absolute',
						top: '50%',
						right: '20px',
						transform: 'translateY(-50%)',
						opacity: useTransform(x, [50, 100], [0, 1]),
					}}
				>
					<Typography
						variant="h4"
						sx={{
							color: '#4caf50',
							fontWeight: 'bold',
							border: '3px solid #4caf50',
							borderRadius: '8px',
							padding: '8px 16px',
							rotate: '30deg',
						}}
					>
						LIKE
					</Typography>
				</motion.div>
			</Card>

			{/* Swipe buttons for mobile/accessibility */}
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'space-between',
					mt: 2,
					gap: 2,
				}}
			>
				<motion.button
					onClick={() => handleSwipeButton('left')}
					disabled={disabled}
					style={{
						flex: 1,
						padding: '12px',
						border: '2px solid #f44336',
						borderRadius: '24px',
						background: 'transparent',
						color: '#f44336',
						fontWeight: 'bold',
						fontSize: '16px',
						cursor: disabled ? 'not-allowed' : 'pointer',
						opacity: disabled ? 0.5 : 1,
					}}
					whileHover={{ scale: disabled ? 1 : 1.05 }}
					whileTap={{ scale: disabled ? 1 : 0.95 }}
				>
					👎 Pass
				</motion.button>

				<motion.button
					onClick={() => handleSwipeButton('right')}
					disabled={disabled}
					style={{
						flex: 1,
						padding: '12px',
						border: '2px solid #4caf50',
						borderRadius: '24px',
						background: 'transparent',
						color: '#4caf50',
						fontWeight: 'bold',
						fontSize: '16px',
						cursor: disabled ? 'not-allowed' : 'pointer',
						opacity: disabled ? 0.5 : 1,
					}}
					whileHover={{ scale: disabled ? 1 : 1.05 }}
					whileTap={{ scale: disabled ? 1 : 0.95 }}
				>
					👍 Like
				</motion.button>
			</Box>
		</motion.div>
	);
}
