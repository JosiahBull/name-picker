import { Name, SwipeAction, Match, User, Analytics, SwipeResult } from './types'

export interface ApiClient {
	getNextName(): Promise<Name | null>
	swipeName(action: SwipeAction): Promise<SwipeResult>
	getMatches(userId: string): Promise<Match[]>
	getUserProfile(userId: string): Promise<User>
	getAnalytics(userId: string): Promise<Analytics>
	createUser(email: string, name: string): Promise<User>
	linkPartner(userId: string, partnerId: string): Promise<void>
}

export class MockApiClient implements ApiClient {
	private mockNames: Name[] = [
		{
			id: '1',
			name: 'Smith',
			origin: 'English',
			meaning: 'Metalworker',
			popularity: 95,
			gender: 'neutral',
		},
		{
			id: '2',
			name: 'Johnson',
			origin: 'English',
			meaning: "Son of John",
			popularity: 90,
			gender: 'neutral',
		},
		{
			id: '3',
			name: 'Williams',
			origin: 'English',
			meaning: "Son of William",
			popularity: 85,
			gender: 'neutral',
		},
		{
			id: '4',
			name: 'Brown',
			origin: 'English',
			meaning: 'Color name',
			popularity: 80,
			gender: 'neutral',
		},
		{
			id: '5',
			name: 'Jones',
			origin: 'Welsh',
			meaning: "Son of John",
			popularity: 88,
			gender: 'neutral',
		},
		{
			id: '6',
			name: 'Garcia',
			origin: 'Spanish',
			meaning: 'Bear',
			popularity: 75,
			gender: 'neutral',
		},
		{
			id: '7',
			name: 'Miller',
			origin: 'English',
			meaning: 'Grain grinder',
			popularity: 78,
			gender: 'neutral',
		},
		{
			id: '8',
			name: 'Davis',
			origin: 'Welsh',
			meaning: "Son of David",
			popularity: 82,
			gender: 'neutral',
		},
	]

	private currentIndex = 0
	private swipes: SwipeAction[] = []
	private matches: Match[] = []

	async getNextName(): Promise<Name | null> {
		if (this.currentIndex >= this.mockNames.length) {
			return null
		}
		return this.mockNames[this.currentIndex++]
	}

	async swipeName(action: SwipeAction): Promise<SwipeResult> {
		this.swipes.push(action)
		
		const name = this.mockNames.find(n => n.id === action.nameId)
		if (!name) {
			throw new Error('Name not found')
		}

		const isMatch = action.action === 'like' && Math.random() > 0.7

		if (isMatch) {
			const match: Match = {
				id: `match-${Date.now()}`,
				nameId: action.nameId,
				name: name.name,
				users: [action.userId, 'partner-id'],
				matchedAt: new Date(),
			}
			this.matches.push(match)
		}

		return { isMatch, name }
	}

	async getMatches(userId: string): Promise<Match[]> {
		return this.matches.filter(match => match.users.includes(userId))
	}

	async getUserProfile(userId: string): Promise<User> {
		return {
			id: userId,
			email: 'user@example.com',
			name: 'Demo User',
			partnerId: 'partner-id',
			createdAt: new Date(),
		}
	}

	async getAnalytics(_userId: string): Promise<Analytics> {
		const likes = this.swipes.filter(s => s.action === 'like').length
		const dislikes = this.swipes.filter(s => s.action === 'dislike').length
		
		return {
			totalSwipes: this.swipes.length,
			likes,
			dislikes,
			matches: this.matches.length,
			averageSwipeTime: 2.5,
			mostPopularNames: ['Smith', 'Johnson', 'Brown'],
			sessionDuration: 300,
		}
	}

	async createUser(email: string, name: string): Promise<User> {
		return {
			id: `user-${Date.now()}`,
			email,
			name,
			createdAt: new Date(),
		}
	}

	async linkPartner(_userId: string, _partnerId: string): Promise<void> {
		// Mock implementation
		console.log(`Linking user ${_userId} with partner ${_partnerId}`)
	}
}