/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Luminous Peach Academy Palette
        background: '#fffbf9', // Cream White - primary canvas
        'background-surface': '#fff5f0', // Soft Peach - input fields, sidebars
        peach: {
          50: '#fffbf9',   // Cream White
          100: '#fff5f0',  // Soft Peach
          200: '#ffeae0',  // Pastel Peach (borders)
          300: '#ffd4b8',  // Light peach
          400: '#ff9e7d',  // Medium peach
          500: '#ff8a65',  // Vibrant Peach (primary)
          600: '#ff7043',  // Deep Sunset (hover)
          700: '#ff5a2b',  // Darker peach
          800: '#e85a20',  // Dark peach
          900: '#cc4a1a',  // Very dark peach
        },
        primary: '#ff8a65', // Vibrant Peach
        'primary-dark': '#ff7043', // Deep Sunset
        'primary-light': '#ffeae0', // Pastel Peach
        'primary-lighter': '#fff5f0', // Soft Peach
        'primary-outline': '#ffd4b8',
        text: {
          primary: '#3a2e2a', // Deep Cocoa
          secondary: '#8d7c77', // Muted Brown
        },
        secondary: '#0EA5E9',
        accent: '#14B8A6',
        success: '#4ade80', // Mint Green
        'success-bg': '#f0fdf4', // Green-50
        warning: '#f97316', // Orange
        'warning-bg': '#fff7ed', // Orange-50
        info: '#3b82f6', // Bright Blue
        'info-bg': '#eff6ff', // Blue-50
        danger: '#EF4444',
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E5E5E5',
          300: '#D4D4D4',
          400: '#A3A3A3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
        },
        sidebar: {
          background: '#3a2e2a', // Deep Cocoa - matches login left side
          active: '#4a3e3a', // Slightly lighter for active state
          hover: '#4a3e3a', // Slightly lighter for hover state
          text: '#ffffff', // White text
          textActive: '#ff8a65', // Vibrant Peach for active items
          textHover: '#ff8a65', // Vibrant Peach for hover
          border: '#4a3e3a', // Subtle border
        },
        region: {
          1: '#3B82F6',
          2: '#F59E0B',
          3: '#10B981',
          4: '#8B5CF6',
          5: '#EC4899',
          6: '#06B6D4',
        },
      },
      borderRadius: {
        'input': '8px',    // Rounded for inputs
        'button': '8px',   // Rounded for buttons
        'card': '8px',     // Rounded for cards
        'card-lg': '12px',  // Rounded for large cards
        'sm': '4px',
        'md': '6px',
        'lg': '8px',
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      boxShadow: {
        'card': '0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.12)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.16)',
        'peach': '0 4px 20px rgba(0, 0, 0, 0.12)',
        'peach-lg': '0 8px 32px rgba(0, 0, 0, 0.15)',
        'sm': '0 1px 2px rgba(0, 0, 0, 0.08)',
        'md': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'lg': '0 4px 16px rgba(0, 0, 0, 0.12)',
        'xl': '0 8px 24px rgba(0, 0, 0, 0.14)',
        '2xl': '0 12px 32px rgba(0, 0, 0, 0.16)',
      },
    },
  },
  plugins: [],
}