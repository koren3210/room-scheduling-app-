export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
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
        panel: '0 24px 48px rgba(15, 23, 42, 0.08)',
      },
      backgroundImage: {
        'radial-glow': 'radial-gradient(circle at top left, rgba(0, 153, 153, 0.12), transparent 30%), radial-gradient(circle at bottom right, rgba(0, 153, 153, 0.1), transparent 25%)',
      },
    },
  },
  plugins: [],
};
