import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { Name, SwipeAction, Match, User, Analytics, SwipeResult, ApiClient } from './types';

export class SupabaseApiClient implements ApiClient {
	private supabase: SupabaseClient<Database>;
	private serviceRoleClient: SupabaseClient<Database>;

	constructor(supabaseUrl: string, supabaseKey: string, serviceRoleKey?: string) {
		this.supabase = createClient<Database>(supabaseUrl, supabaseKey);
		this.serviceRoleClient = createClient<Database>(supabaseUrl, serviceRoleKey || supabaseKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});
	}

	async getNextName(userId: string): Promise<Name | null> {
		try {
			// Use the database function to get unseen names for this user
			const { data, error } = await this.serviceRoleClient.rpc('get_next_unseen_name', {
				user_id: userId,
			});

			if (error) {
				throw error;
			}

			if (data && data.length > 0) {
				const nameData = data[0];
				return {
					id: nameData.id,
					name: nameData.name,
					origin: nameData.origin || undefined,
					meaning: nameData.meaning || undefined,
					popularity: nameData.popularity || undefined,
					gender: (nameData.gender as 'masculine' | 'feminine' | 'neutral') || undefined,
				};
			}

			return null;
		} catch (error) {
			console.error('Error fetching next name:', error);
			throw error;
		}
	}

	async swipeName(action: SwipeAction): Promise<SwipeResult> {
		try {
			// Use service role client to bypass RLS for demo purposes
			const { error: swipeError } = await this.serviceRoleClient.from('swipes').insert({
				user_id: action.userId,
				name_id: action.nameId,
				action: action.action,
			});

			if (swipeError) {
				throw swipeError;
			}

			// Get the name details
			const { data: nameData, error: nameError } = await this.serviceRoleClient
				.from('names')
				.select('*')
				.eq('id', action.nameId)
				.single();

			if (nameError) {
				throw nameError;
			}

			const name: Name = {
				id: nameData.id,
				name: nameData.name,
				origin: nameData.origin || undefined,
				meaning: nameData.meaning || undefined,
				popularity: nameData.popularity || undefined,
				gender: (nameData.gender as 'masculine' | 'feminine' | 'neutral') || undefined,
			};

			// Check if this created a match (the trigger should handle this automatically)
			if (action.action === 'like') {
				const { data: matchData } = await this.serviceRoleClient
					.from('matches')
					.select('*')
					.eq('name_id', action.nameId)
					.or(`user1_id.eq.${action.userId},user2_id.eq.${action.userId}`)
					.order('created_at', { ascending: false })
					.limit(1);

				const isMatch = Boolean(matchData && matchData.length > 0);
				return { isMatch, name };
			}

			return { isMatch: false, name };
		} catch (error) {
			console.error('Error processing swipe:', error);
			throw error;
		}
	}

	async getMatches(userId: string): Promise<Match[]> {
		try {
			// Use the database function to get matches for this user
			const { data, error } = await this.serviceRoleClient.rpc('get_user_matches', {
				user_id: userId,
			});

			if (error) {
				throw error;
			}

			return (data || []).map((match) => ({
				id: match.id,
				nameId: match.name_id,
				name: match.name,
				users: [match.user1_id, match.user2_id],
				matchedAt: new Date(match.created_at),
			}));
		} catch (error) {
			console.error('Error fetching matches:', error);
			throw error;
		}
	}

	async getUserProfile(userId: string): Promise<User> {
		try {
			const { data, error } = await this.supabase
				.from('user_profiles')
				.select('*')
				.eq('id', userId)
				.single();

			if (error) {
				throw error;
			}

			return {
				id: data.id,
				email: `${data.username}@example.com`, // Mock email for now
				name: data.display_name,
				partnerId: data.username === 'joe' ? 'sam' : 'joe', // Mock partner logic
				createdAt: new Date(data.created_at!),
			};
		} catch (error) {
			console.error('Error fetching user profile:', error);
			throw error;
		}
	}

	async getAnalytics(userId: string): Promise<Analytics> {
		try {
			// Use the database function we created
			const { data, error } = await this.supabase.rpc('get_user_analytics', {
				target_user_id: userId,
			});

			if (error) {
				throw error;
			}

			return data as unknown as Analytics;
		} catch (error) {
			console.error('Error fetching analytics:', error);
			// Return default analytics if there's an error
			return {
				totalSwipes: 0,
				likes: 0,
				dislikes: 0,
				matches: 0,
				averageSwipeTime: 2.5,
				mostPopularNames: ['Smith', 'Johnson', 'Brown'],
				sessionDuration: 300,
			};
		}
	}

	async createUser(email: string, name: string): Promise<User> {
		try {
			// In a real implementation, this would use Supabase Auth
			// For now, we'll assume users are created through the auth flow
			const username = email.split('@')[0];

			const { data, error } = await this.supabase
				.from('user_profiles')
				.insert({
					id: '00000000-0000-0000-0000-000000000000', // This would be the actual auth user ID
					username: username as 'joe' | 'sam',
					display_name: name,
				})
				.select()
				.single();

			if (error) {
				throw error;
			}

			return {
				id: data.id,
				email,
				name: data.display_name,
				createdAt: new Date(data.created_at!),
			};
		} catch (error) {
			console.error('Error creating user:', error);
			throw error;
		}
	}

	async linkPartner(_userId: string, _partnerId: string): Promise<void> {
		// In a real implementation, this would update the user profile
		// with partner information
		console.log(`Linking user ${_userId} with partner ${_partnerId}`);
	}

	// Helper method to set the auth session
	setAuthSession(accessToken: string) {
		// This would be used to set the auth session when a user logs in
		this.supabase.auth.setSession({
			access_token: accessToken,
			refresh_token: '',
		});
	}

	// Helper method to sign in a user (for testing with our seeded users)
	async signInWithEmail(email: string, password: string) {
		const { data, error } = await this.supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			throw error;
		}

		return data;
	}

	// Helper method to get current user
	async getCurrentUser() {
		const {
			data: { user },
		} = await this.supabase.auth.getUser();
		return user;
	}

	async addName(
		userId: string,
		name: string,
		origin?: string,
		meaning?: string,
		gender: 'masculine' | 'feminine' | 'neutral' = 'neutral',
	): Promise<string> {
		try {
			const { data, error } = await this.serviceRoleClient.rpc('add_user_name', {
				name_text: name.trim(),
				user_id: userId,
				origin_text: origin?.trim() || undefined,
				meaning_text: meaning?.trim() || undefined,
				gender_text: gender,
			});

			if (error) {
				throw error;
			}

			return data as string;
		} catch (error) {
			console.error('Error adding name:', error);
			throw error;
		}
	}

	async addNamesFromFile(userId: string, names: string[]): Promise<string[]> {
		const results: string[] = [];
		const errors: string[] = [];

		for (const name of names) {
			const trimmedName = name.trim();
			if (!trimmedName) continue;

			try {
				const nameId = await this.addName(userId, trimmedName);
				results.push(nameId);
			} catch (error) {
				console.error(`Error adding name "${trimmedName}":`, error);
				errors.push(trimmedName);
			}
		}

		if (errors.length > 0) {
			console.warn(`Failed to add ${errors.length} names:`, errors);
		}

		return results;
	}
}
