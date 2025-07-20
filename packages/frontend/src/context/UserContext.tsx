import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useApi } from './ApiContext';
import { SupabaseApiClient } from '@name-picker/shared';

export type UserId = 'joe' | 'sam';

interface UserInfo {
	id: string; // UUID from database
	name: string;
	displayName: string;
	email: string;
}

interface UserContextType {
	currentUser: UserInfo | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
	children: ReactNode;
}

export function UserProvider({ children }: UserProviderProps) {
	const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const { api } = useApi();

	// Check for existing session on mount
	useEffect(() => {
		const checkSession = async () => {
			try {
				const supabaseApi = api as SupabaseApiClient;
				const user = await supabaseApi.getCurrentUser();
				
				if (user && user.email) {
					// Fetch user profile
					const profile = await api.getUserProfile(user.id);
					
					setCurrentUser({
						id: user.id,
						name: profile.name.toLowerCase() as UserId,
						displayName: profile.name,
						email: user.email,
					});
				}
			} catch (error) {
				console.error('Error checking session:', error);
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();
	}, [api]);

	const login = async (email: string, password: string) => {
		try {
			const supabaseApi = api as SupabaseApiClient;
			const { user } = await supabaseApi.signInWithEmail(email, password);
			
			if (!user || !user.email) {
				throw new Error('Invalid credentials');
			}

			// Fetch user profile
			const profile = await api.getUserProfile(user.id);
			
			setCurrentUser({
				id: user.id,
				name: profile.name.toLowerCase() as UserId,
				displayName: profile.name,
				email: user.email,
			});
		} catch (error) {
			console.error('Login error:', error);
			throw error;
		}
	};

	const logout = async () => {
		try {
			const supabaseApi = api as SupabaseApiClient;
			// Implement logout in the API client
			await supabaseApi.signOut();
			setCurrentUser(null);
		} catch (error) {
			console.error('Logout error:', error);
			throw error;
		}
	};

	const value: UserContextType = {
		currentUser,
		login,
		logout,
		isAuthenticated: currentUser !== null,
		isLoading,
	};

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextType {
	const context = useContext(UserContext);
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider');
	}
	return context;
}