import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../packages/shared/src/database.types';

export class DatabaseHelper {
	private supabase: SupabaseClient<Database>;

	constructor() {
		const supabaseUrl = process.env.VITE_SUPABASE_URL;
		const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

		if (!supabaseUrl || !serviceRoleKey) {
			throw new Error('Missing Supabase environment variables for database helper');
		}

		// Use service role key for admin operations
		this.supabase = createClient<Database>(supabaseUrl, serviceRoleKey, {
			auth: {
				autoRefreshToken: false,
				persistSession: false,
			},
		});
	}

	/**
	 * Get test user IDs for Joe and Sam
	 */
	async getTestUserIds(): Promise<{ joeId: string; samId: string }> {
		const { data: users, error } = await this.supabase
			.from('user_profiles')
			.select('id, username')
			.in('username', ['joe', 'sam']);

		if (error) {
			throw error;
		}

		if (!users || users.length !== 2) {
			throw new Error('Expected to find exactly 2 test users (joe, sam)');
		}

		const joeUser = users.find((u) => u.username === 'joe');
		const samUser = users.find((u) => u.username === 'sam');

		if (!joeUser || !samUser) {
			throw new Error('Could not find both test users (joe, sam)');
		}

		return {
			joeId: joeUser.id,
			samId: samUser.id,
		};
	}

	/**
	 * Clear all test data from the database
	 * This should be called before each test to ensure a clean state
	 */
	async clearTestData(): Promise<void> {
		try {
			// Get test user IDs (Joe and Sam)
			const { joeId, samId } = await this.getTestUserIds();

			// Clear matches involving test users - use two separate queries to be safe
			const { error: match1Error } = await this.supabase
				.from('matches')
				.delete()
				.in('user1_id', [joeId, samId]);
			
			if (match1Error) {
				throw match1Error;
			}
			
			const { error: match2Error } = await this.supabase
				.from('matches')
				.delete()
				.in('user2_id', [joeId, samId]);

			if (match2Error) {
				throw match2Error;
			}

			// Clear swipes by test users - try multiple times if needed
			const { error: swipeError } = await this.supabase
				.from('swipes')
				.delete()
				.in('user_id', [joeId, samId]);

			if (swipeError) {
				console.error('Error clearing swipes:', swipeError);
				throw swipeError;
			}

			// Clear user-uploaded names
			const { error: nameError } = await this.supabase
				.from('names')
				.delete()
				.eq('is_user_uploaded', true);

			if (nameError) {
				throw nameError;
			}

			// Clear any names starting with `Test`
			const { error: testNameError } = await this.supabase
				.from('names')
				.delete()
				.ilike('name', 'Test%');

			if (testNameError) {
				throw testNameError;
			}

			// Debug: Check if any matches remain
			const { data: remainingMatches } = await this.supabase
				.from('matches')
				.select('*')
				.or(`user1_id.in.(${joeId},${samId}),user2_id.in.(${joeId},${samId})`);
			
			if (remainingMatches && remainingMatches.length > 0) {
				console.warn('⚠️ Warning: Found remaining matches after cleanup:', remainingMatches);
			}
			
			console.log('✅ Test data cleared successfully');
		} catch (error) {
			console.error('❌ Error clearing test data:', error);
			throw error;
		}
	}

	/**
	 * Seed a specific name for testing
	 */
	async seedTestName(
		userId: string,
		name: string,
		origin?: string,
		meaning?: string,
		gender?: string,
	): Promise<string> {
		// The name must begin with "Test" to avoid conflicts with real names
		if (!name.startsWith('Test')) {
			throw new Error('Test names must start with "Test" to avoid conflicts');
		}
		const { data, error } = await this.supabase.rpc('add_user_name', {
			name_text: name.trim(),
			user_id: userId,
			origin_text: origin?.trim() || undefined,
			meaning_text: meaning?.trim() || undefined,
			gender_text: gender,
		});

		if (error || !data) {
			if (!data) {
				throw new Error(`Failed to seed name "${name}": No data returned`);
			}
			throw error;
		}

		return data as string;
	}

	/**
	 * Check if a name exists in the database
	 */
	async checkNameExists(name: string): Promise<boolean> {
		const { data, error } = await this.supabase
			.from('names')
			.select('id')
			.eq('name', name)
			.single();

		if (error) {
			console.log(`Name "${name}" not found in database:`, error.message);
			return false;
		}

		return !!data;
	}

	/**
	 * Get all names from the database for debugging
	 */
	async getAllNames(): Promise<any[]> {
		const { data, error } = await this.supabase
			.from('names')
			.select('*')
			.order('created_at', { ascending: false })
			.limit(20);

		if (error) {
			throw error;
		}

		return data || [];
	}

	/**
	 * Get all swipes for a user
	 * @param userId
	 * @returns
	 */
	async getAllSwipes(userId?: string): Promise<any[]> {
		const query = this.supabase
			.from('swipes')
			.select('*')
			.order('created_at', { ascending: false });

		if (userId) {
			query.eq('user_id', userId);
		}

		const { data, error } = await query;

		if (error) {
			throw error;
		}

		return data || [];
	}

	/**
	 * Get user's swipe action for a specific name
	 */
	async getUserSwipeForName(userId: string, nameId: string): Promise<{ action: string } | null> {
		const { data, error } = await this.supabase
			.from('swipes')
			.select('action')
			.eq('user_id', userId)
			.eq('name_id', nameId)
			.single();

		if (error) {
			// Not found is okay
			return null;
		}

		return data;
	}

	/**
	 * Verify that a swipe was recorded in the database
	 */
	async verifySwipeRecorded(
		userId: string,
		nameId: string,
		action: 'like' | 'dislike',
	): Promise<boolean> {
		const swipe = await this.getUserSwipeForName(userId, nameId);
		return swipe !== null && swipe.action === action;
	}
}
