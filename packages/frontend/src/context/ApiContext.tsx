import { createContext, ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { ApiClient, SupabaseApiClient } from '@name-picker/shared';
import { supabase } from '../lib/supabase';

interface ApiContextType {
	api: ApiClient;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
	children: ComponentChildren;
}

export function ApiProvider({ children }: ApiProviderProps) {
	const api = SupabaseApiClient.getInstance(supabase);

	return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiContextType {
	const context = useContext(ApiContext);
	if (context === undefined) {
		throw new Error('useApi must be used within an ApiProvider');
	}
	return context;
}
