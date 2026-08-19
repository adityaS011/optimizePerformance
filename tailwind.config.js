/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        border: 'hsl(215 28% 22%)',
        background: '#0f172a',
        surface: '#1e293b',
        surface2: '#273449',
        primary: '#3b82f6',
        danger: '#ef4444',
        success: '#22c55e',
        muted: '#94a3b8',
        foreground: '#f1f5f9',
      },
      fontFamily: {
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      keyframes: {
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(4px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'pop': {
          '0%': { transform: 'scale(0.9)' },
          '60%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '45%': { opacity: '0.72' },
          '50%': { opacity: '0.6' },
          '55%': { opacity: '0.72' },
        },
        'slide-in': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.3s ease-out',
        'pop': 'pop 0.35s ease-out',
        'flicker': 'flicker 1.3s ease-in-out infinite',
        'slide-in': 'slide-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
}
