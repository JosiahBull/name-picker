import { createContext, useContext, ReactNode } from 'react'
import { ApiClient, MockApiClient } from '@name-picker/shared'

interface ApiContextType {
	api: ApiClient
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

interface ApiProviderProps {
	children: ReactNode
}

export function ApiProvider({ children }: ApiProviderProps) {
	const api = new MockApiClient()

	return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>
}

export function useApi(): ApiContextType {
	const context = useContext(ApiContext)
	if (context === undefined) {
		throw new Error('useApi must be used within an ApiProvider')
	}
	return context
}