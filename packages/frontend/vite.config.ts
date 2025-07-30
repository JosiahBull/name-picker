import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
// import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
	plugins: [
		preact(),
		// visualizer({
		//   filename: 'dist/stats.html',
		//   open: true,
		//   gzipSize: true,
		//   brotliSize: true,
		// }),
	],
	server: {
		port: 5173,
	},
	build: {
		rollupOptions: {
			output: {
				manualChunks: {
					'preact-vendor': ['preact', '@preact/compat', 'preact-router'],
					'mui-vendor': [
						'@mui/material',
						'@mui/icons-material',
						'@emotion/react',
						'@emotion/styled',
					],
					'animation-vendor': ['framer-motion'],
					'supabase-vendor': ['@supabase/supabase-js', '@supabase/auth-js'],
				},
			},
		},
		chunkSizeWarningLimit: 500,
	},
});
