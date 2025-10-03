import defaultTheme from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'app-surface': 'rgba(12, 16, 32, 0.85)',
        'app-panel': 'rgba(14, 17, 28, 0.85)',
        'app-card': 'rgba(7, 10, 22, 0.92)',
        'app-border': 'rgba(255, 255, 255, 0.06)',
        'app-text-muted': 'rgba(214, 220, 255, 0.65)',
      },
      fontFamily: {
        sans: ['Inter', 'Segoe UI', ...defaultTheme.fontFamily.sans],
      },
      boxShadow: {
        hero: '0 40px 80px -40px rgba(10, 20, 50, 0.8)',
        button: '0 18px 32px -18px rgba(66, 153, 255, 0.75)',
        buttonHover: '0 22px 36px -18px rgba(66, 153, 255, 1)',
      },
      backgroundImage: {
        'app-grad-top': 'radial-gradient(circle at top, rgba(33, 45, 83, 0.65), transparent 55%)',
        'app-grad-bottom': 'radial-gradient(circle at bottom, rgba(19, 114, 147, 0.4), transparent 50%)',
        'banner-fallback': 'linear-gradient(135deg, rgba(37, 57, 103, 0.8), rgba(20, 128, 139, 0.7))',
        'banner-placeholder': 'linear-gradient(135deg, rgba(65, 120, 255, 0.4), rgba(76, 201, 240, 0.25))',
        'button-primary': 'linear-gradient(135deg, rgba(65, 120, 255, 0.95), rgba(76, 201, 240, 0.85))',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.4s ease-in-out infinite',
      },
      letterSpacing: {
        tightest: '-0.04em',
        wideish: '0.08em',
      },
    },
  },
  plugins: [],
}
