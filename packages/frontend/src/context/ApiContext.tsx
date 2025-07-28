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
	const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321';
	const supabaseKey =
		import.meta.env.VITE_SUPABASE_ANON_KEY ||
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

	const api = new SupabaseApiClient(supabaseUrl, supabaseKey);

	return <ApiContext.Provider value={{ api }}>{children}</ApiContext.Provider>;
}

export function useApi(): ApiContextType {
	const context = useContext(ApiContext);
	if (context === undefined) {
		throw new Error('useApi must be used within an ApiProvider');
	}
	return context;
}
