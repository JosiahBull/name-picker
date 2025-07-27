import { ComponentChildren } from 'preact';
import { route } from 'preact-router';
import { Box, CircularProgress } from '@mui/material';
import { useUser } from '../context/UserContext';

interface ProtectedRouteProps {
	children: ComponentChildren;
	path?: string;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated, isLoading } = useUser();

	if (isLoading) {
		return (
			<Box
				sx={{
					display: 'flex',
					justifyContent: 'center',
					alignItems: 'center',
					minHeight: '100vh',
				}}
			>
				<CircularProgress />
			</Box>
		);
	}

	if (!isAuthenticated) {
		route('/login', true);
		return null;
	}

	return <>{children}</>;
}
