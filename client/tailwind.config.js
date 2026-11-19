/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Deep Navy
        navy: {
          50:  '#f0f4ff',
          100: '#dce6ff',
          200: '#b9ccff',
          300: '#8ca8ff',
          400: '#5c7fff',
          500: '#3358e8',
          600: '#1e3fcc',
          700: '#1830a8',
          800: '#101828',  // ← Primary brand navy
          900: '#0a1020',
          950: '#060b18',
        },
        // Secondary Indigo (keep brand alias for backward compat)
        brand: {
          50:  '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',  // ← Secondary indigo #4338CA
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        // Accent Electric Orange
        accent: {
          50:  '#fff4ee',
          100: '#ffe4cf',
          200: '#ffc49c',
          300: '#ff9e62',
          400: '#ff7c35',
          500: '#FF6B35',  // ← Accent orange #FF6B35
          600: '#e54e18',
          700: '#c03b10',
          800: '#9a2f0e',
          900: '#7c280e',
          950: '#431108',
        },
        // Success
        success: {
          50:  '#f0fdf4',
          500: '#16a34a',
          600: '#15803d',
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow':        '0 0 25px -5px rgba(67, 56, 202, 0.35)',
        'glow-orange': '0 0 25px -5px rgba(255, 107, 53, 0.4)',
        'soft':        '0 10px 30px -5px rgba(0, 0, 0, 0.06)',
        'card':        '0 2px 8px 0 rgba(16, 24, 40, 0.08)',
        'card-hover':  '0 8px 24px 0 rgba(16, 24, 40, 0.14)',
        'sidebar':     '4px 0 24px 0 rgba(16, 24, 40, 0.18)',
      },
      backgroundImage: {
        'hero-gradient':    'linear-gradient(135deg, #101828 0%, #1e1b4b 50%, #101828 100%)',
        'card-gradient':    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
        'accent-gradient':  'linear-gradient(135deg, #FF6B35 0%, #e54e18 100%)',
        'brand-gradient':   'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
        'navy-gradient':    'linear-gradient(135deg, #101828 0%, #1e3fcc 100%)',
      },
      animation: {
        'float':      'float 6s ease-in-out infinite',
        'fade-in':    'fadeIn 0.5s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}
