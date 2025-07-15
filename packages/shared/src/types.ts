export interface Name {
	id: string
	name: string
	origin?: string
	meaning?: string
	popularity?: number
	gender?: 'masculine' | 'feminine' | 'neutral'
}

export interface SwipeAction {
	nameId: string
	userId: string
	action: 'like' | 'dislike'
	timestamp: Date
}

export interface Match {
	id: string
	nameId: string
	name: string
	users: string[]
	matchedAt: Date
}

export interface User {
	id: string
	email: string
	name: string
	partnerId?: string
	createdAt: Date
}

export interface Analytics {
	totalSwipes: number
	likes: number
	dislikes: number
	matches: number
	averageSwipeTime: number
	mostPopularNames: string[]
	sessionDuration: number
}

export interface SwipeResult {
	isMatch: boolean
	name: Name
}

export type SwipeDirection = 'left' | 'right'