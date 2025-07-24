import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import { ApiProvider } from './context/ApiContext';
import { UserProvider } from './context/UserContext';
import { theme } from './theme';
import ProtectedRoute from './components/ProtectedRoute';

// Lazy load all pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
import HomePage from './pages/HomePage';
const SwipePage = lazy(() => import('./pages/SwipePage'));
const MatchesPage = lazy(() => import('./pages/MatchesPage'));
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'));
const UploadPage = lazy(() => import('./pages/UploadPage'));

// Loading component for lazy-loaded pages
const PageLoader = () => (
	<Box
		display="flex"
		justifyContent="center"
		alignItems="center"
		minHeight="100vh"
	>
		<CircularProgress />
	</Box>
);

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<UserProvider>
				<ApiProvider>
					<Router>
						<Suspense fallback={<PageLoader />}>
							<Routes>
							<Route path="/login" element={<LoginPage />} />
							<Route
								path="/"
								element={
									<ProtectedRoute>
										<HomePage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/swipe"
								element={
									<ProtectedRoute>
										<SwipePage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/matches"
								element={
									<ProtectedRoute>
										<MatchesPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/analytics"
								element={
									<ProtectedRoute>
										<AnalyticsPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/upload"
								element={
									<ProtectedRoute>
										<UploadPage />
									</ProtectedRoute>
								}
							/>
								<Route path="*" element={<Navigate to="/" replace />} />
							</Routes>
						</Suspense>
					</Router>
				</ApiProvider>
			</UserProvider>
		</ThemeProvider>
	);
}

export default App;
