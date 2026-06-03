const opacityScale = Object.fromEntries(Array.from({ length: 101 }, (_, value) => [value, `${value / 100}`]));

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      opacity: opacityScale,
      colors: {
        night: '#050711',
        obsidian: '#080A13',
        ink: '#0E1424',
        steel: '#94A3B8',
        champagne: '#F7D88A',
        bullion: '#C99A32',
        ember: '#FF6B4A',
        mint: '#5EF1B6',
        azure: '#6EC6FF',
        orchid: '#B38CFF',
      },
      boxShadow: {
        gold: '0 0 38px rgba(247, 216, 138, 0.18)',
        glass: '0 22px 80px rgba(0, 0, 0, 0.38)',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'sans-serif'],
      },
      backgroundImage: {
        'gold-line': 'linear-gradient(135deg, #F7D88A 0%, #C99A32 48%, #FFFFFF 100%)',
        'panel-radial':
          'radial-gradient(circle at 20% 10%, rgba(247, 216, 138, 0.16), transparent 34%), radial-gradient(circle at 84% 12%, rgba(110, 198, 255, 0.12), transparent 28%), linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.03))',
      },
    },
  },
  plugins: [],
};
