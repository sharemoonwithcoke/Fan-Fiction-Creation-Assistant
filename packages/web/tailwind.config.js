/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['Cormorant Garamond', 'Noto Serif SC', 'Songti SC', 'Georgia', 'serif'],
        body:    ['Lora', 'Noto Serif SC', 'Songti SC', 'Georgia', 'serif'],
        hand:    ['Caveat', 'Patrick Hand', 'Lora', 'Noto Serif SC', 'cursive'],
        mono:    ['JetBrains Mono', 'SF Mono', 'Menlo', 'Consolas', 'monospace'],
      },
      colors: {
        'paper-cream':      '#FBF6EC',
        'paper-oat':        '#F4EADA',
        'paper-linen':      '#EADFC8',
        'paper-tea':        '#E0D2B7',
        'ink-walnut':       '#3D2A1F',
        'ink-cocoa':        '#5C3D2A',
        'ink-tea':          '#8C6F4C',
        'ink-mist':         '#B49E7E',
        'claret': {
          DEFAULT: '#8A2C2C',
          deep:    '#6E1F1F',
          soft:    '#B45757',
        },
        'accent-soft':      '#F2D9D4',
        'rose-blush':       '#E4B8A8',
        'sage': {
          DEFAULT: '#7C8B5C',
          deep:    '#4D5B3C',
          soft:    '#BFC9A6',
        },
        'honey':            '#C89B3C',
        'border-warm':      '#D9C7A6',
        'border-strong':    '#B49E7E',
      },
      boxShadow: {
        'wax':   '0 2px 0 #6E1F1F, 0 4px 10px rgba(110,31,31,0.25)',
        'warm-sm': '0 1px 2px rgba(61,42,31,0.06), 0 1px 1px rgba(61,42,31,0.04)',
        'warm-md': '0 4px 8px rgba(61,42,31,0.08), 0 2px 4px rgba(61,42,31,0.05)',
        'warm-lg': '0 12px 24px rgba(61,42,31,0.10), 0 4px 8px rgba(61,42,31,0.06)',
      },
      borderRadius: {
        'cottage': '14px',
      },
    },
  },
  plugins: [],
}
