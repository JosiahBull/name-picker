import { lazy, Suspense } from 'preact/compat';
import Router from 'preact-router';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { ApiProvider, useApi } from './context/ApiContext';
import { UserProvider } from './context/UserContext';
import { theme } from './theme';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const SwipePage = lazy(() => import('./pages/SwipePage'));
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));

// Loading component for lazy-loaded pages
const PageLoader = () => (
	<Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
		<CircularProgress />
	</Box>
);

// Inner App component that has access to API context
function AppContent() {
	const { api } = useApi();

	return (
		<UserProvider api={api}>
			<Suspense fallback={<PageLoader />}>
				<Router>
					{/* @ts-expect-error - preact-router path prop */}
					<LoginPage path="/login" />
					<ProtectedRoute path="/">
						<HomePage />
					</ProtectedRoute>
					<ProtectedRoute path="/swipe">
						<SwipePage />
					</ProtectedRoute>
					<ProtectedRoute path="/matches">
						<MatchesPage />
					</ProtectedRoute>
					<ProtectedRoute path="/analytics">
						<AnalyticsPage />
					</ProtectedRoute>
					<ProtectedRoute path="/upload">
						<UploadPage />
					</ProtectedRoute>
				</Router>
			</Suspense>
		</UserProvider>
	);
}

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<ApiProvider>
				<AppContent />
			</ApiProvider>
		</ThemeProvider>
	);
}

export default App;
