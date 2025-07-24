import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';
import { Name, SwipeAction, Match, User, Analytics, SwipeResult, ApiClient } from './types';

export class SupabaseApiClient implements ApiClient {
	private client: SupabaseClient<Database>;

	constructor(supabaseUrl: string, supabaseKey: string) {
		this.client = createClient<Database>(supabaseUrl, supabaseKey);
	}

	async getNextName(userId: string): Promise<Name | null> {
		// Use the database function to get unseen names for this user
		const { data, error } = await this.client.rpc('get_next_unseen_name', {
			user_id: userId,
		});

		if (error) {
			throw error;
		}

		if (!data || data.length === 0) {
			return null;
		}

		if (data.length > 1) {
			console.error('Expected only one name, but got multiple:', data);
		}

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

	async swipeName(action: SwipeAction): Promise<SwipeResult> {
		const { error: swipeError } = await this.client.from('swipes').insert({
			user_id: action.userId,
			name_id: action.nameId,
			action: action.action,
		});

		if (swipeError) {
			throw swipeError;
		}

		// Get the name details
		const { data: nameData, error: nameError } = await this.client
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
			const { data: matchData } = await this.client
				.from('matches')
				.select('*')
				.eq('name_id', action.nameId)
				.or(`user1_id.eq.${action.userId},user2_id.eq.${action.userId}`)
				.order('created_at', { ascending: false })
				.single();

			return { isMatch: !!matchData, name };
		}

		return { isMatch: false, name };

	}

	async getMatches(userId: string): Promise<Match[]> {
		// Use the database function to get matches for this user
		const { data, error } = await this.client.rpc('get_user_matches', {
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
	}

	async getUserProfile(userId: string): Promise<User> {
		const { data, error } = await this.client
			.from('user_profiles')
			.select('*')
			.eq('id', userId)
			.single();

		if (error) {
			throw error;
		}

		return {
			id: data.id,
			email: data.email,
			name: data.display_name,
			// Hardcoded partner logic is fine - only two of us using the app. :)
			partnerId: data.username === 'joe' ? 'sam' : 'joe',
			createdAt: new Date(data.created_at!),
		};
	}

	async getAnalytics(userId: string): Promise<Analytics> {
		// Use the database function we created
		const { data, error } = await this.client.rpc('get_user_analytics', {
			target_user_id: userId,
		});

		if (error) {
			throw error;
		}

		return data as unknown as Analytics;

	}

	// Helper method to set the auth session
	setAuthSession(_accessToken: string) {
		// TODO
	}

	// Helper method to sign in a user (for testing with our seeded users)
	async signInWithEmail(email: string, password: string) {
		const { data, error } = await this.client.auth.signInWithPassword({
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
		} = await this.client.auth.getUser();
		return user;
	}

	async addName(
		userId: string,
		name: string,
		origin?: string,
		meaning?: string,
		gender: 'masculine' | 'feminine' | 'neutral' = 'neutral',
	): Promise<string> {
		const { data, error } = await this.client.rpc('add_user_name', {
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
	}

	async addNames(userId: string, names: string[]): Promise<string[]> {
		const results: string[] = [];

		for (const name of names) {
			const trimmedName = name.trim();
			if (!trimmedName) continue;

			const nameId = await this.addName(userId, trimmedName);
			results.push(nameId);
		}

		return results;
	}
}
