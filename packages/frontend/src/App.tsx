import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { ApiProvider } from './context/ApiContext'
import { UserProvider } from './context/UserContext'
import { theme } from './theme'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import HomePage from './pages/HomePage'
import SwipePage from './pages/SwipePage'
import MatchesPage from './pages/MatchesPage'
import AnalyticsPage from './pages/AnalyticsPage'
import UploadPage from './pages/UploadPage'

function App() {
	return (
		<ThemeProvider theme={theme}>
			<CssBaseline />
			<UserProvider>
				<ApiProvider>
					<Router>
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
					</Router>
				</ApiProvider>
			</UserProvider>
		</ThemeProvider>
	)
}

export default App