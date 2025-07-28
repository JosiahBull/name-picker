import { createContext, ComponentChildren } from 'preact';
import { useContext, useState, useEffect } from 'preact/hooks';
import { ApiClient } from '@name-picker/shared';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

interface UserInfo {
	id: string;
	username: string;
	displayName: string;
	email: string;
}

interface UserContextType {
	currentUser: UserInfo | null;
	authUser: User | null;
	login: (email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	isAuthenticated: boolean;
	isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
	children: ComponentChildren;
	api: ApiClient;
}

export function UserProvider({ children }: UserProviderProps) {
	const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
	const [authUser, setAuthUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Load user profile from Supabase
	const loadUserProfile = async (user: User) => {
		try {
			const { data, error } = await supabase
				.from('user_profiles')
				.select('*')
				.eq('id', user.id)
				.single();

			if (error) throw error;

			if (data) {
				setCurrentUser({
					id: data.id,
					username: data.username,
					displayName: data.display_name,
					email: user.email || '',
				});
			}
		} catch (error) {
			console.error('Error loading user profile:', error);
		}
	};

	// Check for existing session on mount
	useEffect(() => {
		const checkSession = async () => {
			try {
				const {
					data: { session },
				} = await supabase.auth.getSession();
				if (session?.user) {
					setAuthUser(session.user);
					await loadUserProfile(session.user);
				}
			} catch (error) {
				console.error('Error checking session:', error);
			} finally {
				setIsLoading(false);
			}
		};

		checkSession();

		// Listen for auth changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange(async (_, session) => {
			if (session?.user) {
				setAuthUser(session.user);
				await loadUserProfile(session.user);
			} else {
				setAuthUser(null);
				setCurrentUser(null);
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	const login = async (email: string, password: string) => {
		const { data, error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) throw error;

		if (data.user) {
			setAuthUser(data.user);
			await loadUserProfile(data.user);
		}
	};

	const logout = async () => {
		await supabase.auth.signOut();
		setAuthUser(null);
		setCurrentUser(null);
	};

	const value: UserContextType = {
		currentUser,
		authUser,
		login,
		logout,
		isAuthenticated: authUser !== null,
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

// Re-export for backward compatibility
export type UserId = 'joe' | 'sam';
