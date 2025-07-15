import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../packages/shared/src/database.types';

export class DatabaseHelper {
	private supabase: SupabaseClient<Database>;

	constructor() {
		const supabaseUrl = process.env.VITE_SUPABASE_URL;
		const serviceRoleKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

		if (!supabaseUrl || !serviceRoleKey) {
			console.error('Environment variables available:', Object.keys(process.env).filter(key => key.includes('SUPABASE')));
			console.error('VITE_SUPABASE_URL:', supabaseUrl);
			console.error('VITE_SUPABASE_SERVICE_ROLE_KEY:', serviceRoleKey ? '[REDACTED]' : 'undefined');
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

		const joeUser = users.find(u => u.username === 'joe');
		const samUser = users.find(u => u.username === 'sam');

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

			// Clear matches involving test users
			const { error: matchError } = await this.supabase
				.from('matches')
				.delete()
				.in('user1_id', [joeId, samId])
				.or(`user2_id.eq.${joeId},user2_id.eq.${samId}`);

			if (matchError) {
				throw matchError;
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

			// Clear any test-seeded names that might conflict
			const { error: testNameError } = await this.supabase
				.from('names')
				.delete()
				.in('name', ['TestName1', 'TestName2', 'TestName3', 'UniqueTestName1', 'UniqueTestName2']);

			if (testNameError) {
				throw testNameError;
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
	async seedTestName(name: string, origin?: string, meaning?: string, gender?: string): Promise<string> {
		const { data, error } = await this.supabase
			.from('names')
			.insert({
				name,
				origin,
				meaning,
				gender,
				is_user_uploaded: false,
				popularity: 50, // Default popularity
			})
			.select('id')
			.single();

		if (error) {
			throw error;
		}

		return data.id;
	}

	/**
	 * Seed unique test names with timestamp to avoid conflicts
	 */
	async seedUniqueTestNames(count: number = 2): Promise<string[]> {
		const timestamp = Date.now();
		const names: string[] = [];
		
		for (let i = 1; i <= count; i++) {
			const name = `TestName${i}_${timestamp}`;
			const id = await this.seedTestName(name, 'Test Origin', 'Test Meaning', 'neutral');
			names.push(id);
		}
		
		return names;
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
	 * Get user analytics from the database
	 */
	async getUserAnalytics(userId: string): Promise<{
		totalSwipes: number;
		likes: number;
		dislikes: number;
		matches: number;
	}> {
		// Get total swipes for user
		const { data: swipes, error: swipeError } = await this.supabase
			.from('swipes')
			.select('*')
			.eq('user_id', userId);

		if (swipeError) {
			throw swipeError;
		}

		// Get matches for user
		const { data: matches, error: matchError } = await this.supabase
			.from('matches')
			.select('*')
			.or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

		if (matchError) {
			throw matchError;
		}

		const totalSwipes = swipes?.length || 0;
		const likes = swipes?.filter(s => s.action === 'like').length || 0;
		const dislikes = swipes?.filter(s => s.action === 'dislike').length || 0;
		const matchCount = matches?.length || 0;

		return {
			totalSwipes,
			likes,
			dislikes,
			matches: matchCount,
		};
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
	async verifySwipeRecorded(userId: string, nameId: string, action: 'like' | 'dislike'): Promise<boolean> {
		const swipe = await this.getUserSwipeForName(userId, nameId);
		return swipe !== null && swipe.action === action;
	}
}
