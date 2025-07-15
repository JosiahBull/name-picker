import { createContext, useContext, ReactNode, useState, useEffect } from 'react'

export type UserId = 'joe' | 'sam'

interface UserInfo {
	id: UserId
	name: string
	displayName: string
}

const USERS: Record<UserId, UserInfo> = {
	joe: {
		id: 'joe',
		name: 'joe',
		displayName: 'Joe',
	},
	sam: {
		id: 'sam',
		name: 'sam',
		displayName: 'Sam',
	},
}

interface UserContextType {
	currentUser: UserInfo | null
	users: Record<UserId, UserInfo>
	login: (userId: UserId) => void
	logout: () => void
	isAuthenticated: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

const USER_STORAGE_KEY = 'name-picker-user'

interface UserProviderProps {
	children: ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
	const [currentUser, setCurrentUser] = useState<UserInfo | null>(null)

	// Load user from localStorage on mount
	useEffect(() => {
		const savedUserId = localStorage.getItem(USER_STORAGE_KEY) as UserId | null
		if (savedUserId && USERS[savedUserId]) {
			setCurrentUser(USERS[savedUserId])
		}
	}, [])

	const login = (userId: UserId) => {
		const user = USERS[userId]
		if (user) {
			setCurrentUser(user)
			localStorage.setItem(USER_STORAGE_KEY, userId)
		}
	}

	const logout = () => {
		setCurrentUser(null)
		localStorage.removeItem(USER_STORAGE_KEY)
	}

	const value: UserContextType = {
		currentUser,
		users: USERS,
		login,
		logout,
		isAuthenticated: currentUser !== null,
	}

	return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export function useUser(): UserContextType {
	const context = useContext(UserContext)
	if (context === undefined) {
		throw new Error('useUser must be used within a UserProvider')
	}
	return context
}