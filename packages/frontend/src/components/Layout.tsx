import { ComponentChildren } from 'preact';
import { AppBar, Toolbar, Typography, IconButton, Box, Button, Avatar } from '@mui/material';
import { ArrowBack, Logout, Person } from '@mui/icons-material';
import { route } from 'preact-router';
import { useUser } from '../context/UserContext';

interface LayoutProps {
	children: ComponentChildren;
	title: string;
	showBackButton?: boolean;
}

export default function Layout({ children, title, showBackButton = false }: LayoutProps) {
	const { currentUser, logout } = useUser();

	const handleLogout = () => {
		logout();
		route('/login');
	};

	return (
		<Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
			<AppBar position="static" color="primary">
				<Toolbar>
					{showBackButton && (
						<IconButton
							edge="start"
							color="inherit"
							onClick={() => window.history.back()}
							sx={{ mr: 2 }}
						>
							<ArrowBack />
						</IconButton>
					)}
					<Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
						{title}
					</Typography>

					{currentUser && (
						<Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
							<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
								<Avatar
									sx={{
										width: 32,
										height: 32,
										bgcolor: 'secondary.main',
										fontSize: '0.9rem',
									}}
								>
									<Person sx={{ fontSize: 18 }} />
								</Avatar>
								<Typography
									variant="body2"
									sx={{ display: { xs: 'none', sm: 'block' } }}
								>
									{currentUser.displayName}
								</Typography>
							</Box>
							<Button
								color="inherit"
								startIcon={<Logout />}
								onClick={handleLogout}
								sx={{
									ml: 1,
									'& .MuiButton-startIcon': { mr: { xs: 0, sm: 1 } },
								}}
							>
								<Box sx={{ display: { xs: 'none', sm: 'block' } }}>Logout</Box>
							</Button>
						</Box>
					)}
				</Toolbar>
			</AppBar>
			<Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>{children}</Box>
		</Box>
	);
}
