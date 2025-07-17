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
	 * Clear all test data from the database
	 * This should be called before each test to ensure a clean state
	 */
	async clearTestData(): Promise<void> {
		try {
			// Get test user IDs (Joe and Sam)
			const { data: users, error: userError } = await this.supabase
				.from('user_profiles')
				.select('id')
				.in('username', ['joe', 'sam']);

			if (userError) {
				throw userError;
			}

			const userIds = users?.map(user => user.id) || [];

			if (userIds.length === 0) {
				console.warn('No test users found (joe, sam)');
				return;
			}

			// Clear matches involving test users
			const { error: matchError } = await this.supabase
				.from('matches')
				.delete()
				.or(`user1_id.in.(${userIds.join(',')}),user2_id.in.(${userIds.join(',')})`);

			if (matchError) {
				throw matchError;
			}

			// Clear swipes by test users - try multiple times if needed
			let swipeAttempts = 0;
			let remainingSwipes;
			
			do {
				const { error: swipeError } = await this.supabase
					.from('swipes')
					.delete()
					.in('user_id', userIds);

				if (swipeError) {
					console.error('Error clearing swipes:', swipeError);
					throw swipeError;
				}

				// Verify swipes were cleared
				const { data: checkSwipes } = await this.supabase
					.from('swipes')
					.select('*')
					.in('user_id', userIds);

				remainingSwipes = checkSwipes;
				swipeAttempts++;
				
				if (remainingSwipes && remainingSwipes.length > 0 && swipeAttempts < 3) {
					console.log(`Retrying swipe cleanup (attempt ${swipeAttempts + 1})`);
					await new Promise(resolve => setTimeout(resolve, 100));
				}
			} while (remainingSwipes && remainingSwipes.length > 0 && swipeAttempts < 3);

			if (remainingSwipes && remainingSwipes.length > 0) {
				console.error('Warning: Some swipes were not cleared after 3 attempts:', remainingSwipes);
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
		const names = [];
		
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
}