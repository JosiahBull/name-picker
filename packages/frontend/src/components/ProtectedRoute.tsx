import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useUser } from '../context/UserContext'

interface ProtectedRouteProps {
	children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { isAuthenticated } = useUser()

	if (!isAuthenticated) {
		return <Navigate to="/login" replace />
	}

	return <>{children}</>
}