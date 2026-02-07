/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        stellar: {
          blue: '#2e3666'
        }
      },
      boxShadow: {
        glow: '0 0 40px rgba(46,54,102,0.5)'
      },
      keyframes: {
        pulseShield: {
          '0%, 100%': { transform: 'scale(1)', filter: 'drop-shadow(0 0 0 rgba(46,54,102,0.8))' },
          '50%': { transform: 'scale(1.05)', filter: 'drop-shadow(0 0 12px rgba(46,54,102,1))' }
        }
      },
      animation: {
        pulseShield: 'pulseShield 1.4s ease-in-out infinite'
      }
    }
  },
  plugins: []
}
