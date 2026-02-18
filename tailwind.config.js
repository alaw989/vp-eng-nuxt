/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./components/**/*.{js,vue,ts}",
    "./layouts/**/*.vue",
    "./pages/**/*.vue",
    "./plugins/**/*.{js,ts}",
    "./app.vue",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#033379',    // Navy blue - trust & expertise
          light: '#0a4da8',
          dark: '#02244f'
        },
        secondary: {
          DEFAULT: '#2A6F5F',    // Muted teal - professional & subtle accent
          light: '#3D8278',
          dark: '#1F4F52'
        },
        alert: {
          DEFAULT: '#DC2626',    // Red - only for errors/warnings
          light: '#EF4444',
          dark: '#B91C1C'
        },
        neutral: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827'
        },
        pattern: {
          dots: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239CA3AF\' fill-opacity=\'0.08\'%3E%3Ccircle cx=\'2\' cy=\'2\' r=\'1\'/%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'1\'/%3E%3C/g%3E%3C/svg%3E")',
          grid: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%239CA3AF\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M0 0h40v1H0z\'/%3E%3Cpath d=\'M0 0h1v40H0z\'/%3E%3C/g%3E%3C/svg%3E")'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Roboto Condensed', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
        '5xl': ['3rem', { lineHeight: '1' }],
        '6xl': ['3.75rem', { lineHeight: '1' }],
        '7xl': ['4.5rem', { lineHeight: '1' }],
        '8xl': ['6rem', { lineHeight: '1' }],
        '9xl': ['8rem', { lineHeight: '1' }]
      }
    },
  },
  plugins: [],
}
