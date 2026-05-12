export default {
	content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
			},
			colors: {
				brand: {
					400: '#33b3b3',
					500: '#009999',
				},
				siemens: {
					petrol: '#009999',
					glow: '#33b3b3',
					dark: '#006666',
				},
			},
			boxShadow: {
				panel: '0 4px 24px rgba(15,23,42,0.06)',
			},
			animation: {
				'fade-in': 'fadeIn 0.2s ease-out forwards',
			},
			keyframes: {
				fadeIn: {
					'0%': { opacity: '0', transform: 'translateY(6px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' },
				},
			},
		},
	},
	plugins: [],
};
