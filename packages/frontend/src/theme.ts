import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: '#e91e63',
			light: '#f8bbd9',
			dark: '#ad1457',
		},
		secondary: {
			main: '#9c27b0',
			light: '#d1c4e9',
			dark: '#7b1fa2',
		},
		background: {
			default: '#f5f5f5',
			paper: '#ffffff',
		},
		success: {
			main: '#4caf50',
		},
		error: {
			main: '#f44336',
		},
	},
	typography: {
		fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
		h1: {
			fontSize: '2.5rem',
			fontWeight: 600,
		},
		h2: {
			fontSize: '2rem',
			fontWeight: 600,
		},
		h3: {
			fontSize: '1.5rem',
			fontWeight: 500,
		},
		h4: {
			fontSize: '1.25rem',
			fontWeight: 500,
		},
		body1: {
			fontSize: '1rem',
			lineHeight: 1.6,
		},
	},
	shape: {
		borderRadius: 16,
	},
	components: {
		MuiCard: {
			styleOverrides: {
				root: {
					boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
					borderRadius: '16px',
				},
			},
		},
		MuiButton: {
			styleOverrides: {
				root: {
					borderRadius: '24px',
					textTransform: 'none',
					fontWeight: 600,
					padding: '12px 24px',
				},
			},
		},
		MuiAppBar: {
			styleOverrides: {
				root: {
					boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
				},
			},
		},
	},
});
