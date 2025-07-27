import { createContext, ComponentChildren } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import { ApiClient } from '@name-picker/shared';

export type UserId = 'joe' | 'sam';

interface UserInfo {
	id: string; // UUID from database
	name: string;
	displayName: string;
}

const USERS: Record<UserId, UserInfo> = {
	joe: {
		id: '550e8400-e29b-41d4-a716-446655440001', // UUID from seed data
		name: 'joe',
		displayName: 'Joe',
	},
	sam: {
		id: '550e8400-e29b-41d4-a716-446655440002', // UUID from seed data
		name: 'sam',
		displayName: 'Sam',
	},
};

interface UserContextType {
	currentUser: UserInfo | null;
	users: Record<UserId, UserInfo>;
	login: (userId: UserId) => Promise<void>;
	logout: () => Promise<void>;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = 'name-picker-user';

interface UserProviderProps {
	children: ComponentChildren;
	api: ApiClient;
}

export function UserProvider({ children, api }: UserProviderProps) {
	const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Load user from localStorage and restore session on mount
	useEffect(() => {
		const initializeAuth = async () => {
			const savedUserId = localStorage.getItem(USER_STORAGE_KEY) as UserId | null;
			if (savedUserId && USERS[savedUserId]) {
				try {
					// Try to restore the session by signing in again
					const email = savedUserId === 'joe' ? 'joe@example.com' : 'sam@example.com';
					await api.signIn(email, 'password123');
					setCurrentUser(USERS[savedUserId]);
				} catch (error) {
					// If session restoration fails, clear the stored user
					console.error('Failed to restore session:', error);
					localStorage.removeItem(USER_STORAGE_KEY);
				}
			}
			setIsLoading(false);
		};

		initializeAuth();
	}, [api]);

	const login = async (userId: UserId) => {
		const user = USERS[userId];
		if (user) {
			try {
				// Sign in with Supabase using the test credentials
				const email = userId === 'joe' ? 'joe@example.com' : 'sam@example.com';
				await api.signIn(email, 'password123');
				setCurrentUser(user);
				localStorage.setItem(USER_STORAGE_KEY, userId);
			} catch (error) {
				console.error('Failed to sign in:', error);
				throw error;
			}
		}
	};

	const logout = async () => {
		try {
			await api.signOut();
			setCurrentUser(null);
			localStorage.removeItem(USER_STORAGE_KEY);
		} catch (error) {
			console.error('Failed to sign out:', error);
			throw error;
		}
	};

	const value: UserContextType = {
		currentUser,
		users: USERS,
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
