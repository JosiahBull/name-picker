import { createContext, ComponentChildren } from 'preact';
import { useContext } from 'preact/hooks';
import { ApiClient, SupabaseApiClient } from '@name-picker/shared';

interface ApiContextType {
	api: ApiClient;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

interface ApiProviderProps {
	children: ComponentChildren;
}

export function ApiProvider({ children }: ApiProviderProps) {
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
	const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

	const api = SupabaseApiClient.getInstance(supabaseUrl, supabaseKey);

	return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiContextType {
	const context = useContext(ApiContext);
	if (context === undefined) {
		throw new Error('useApi must be used within an ApiProvider');
	}
	return context;
}
