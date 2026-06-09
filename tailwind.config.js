/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0d1117',
        surface: {
          DEFAULT: '#161b22',
          2: '#1c2230',
          3: '#21262d',
        },
        border: {
          DEFAULT: '#30363d',
          light: '#21262d',
        },
        text: {
          primary: '#e6edf3',
          secondary: '#8b949e',
          muted: '#484f58',
        },
        primary: {
          DEFAULT: '#3fb950',
          hover: '#58d068',
          light: 'rgba(63, 185, 80, 0.12)',
          mid: 'rgba(63, 185, 80, 0.24)',
        },
        kalori: {
          DEFAULT: '#ff922b',
          bg: 'rgba(255, 146, 43, 0.1)',
        },
        protein: {
          DEFAULT: '#74c0fc',
          bg: 'rgba(116, 192, 252, 0.1)',
        },
        karbo: {
          DEFAULT: '#c084fc',
          bg: 'rgba(192, 132, 252, 0.1)',
        },
        lemak: {
          DEFAULT: '#fb8484',
          bg: 'rgba(251, 132, 132, 0.1)',
        },
        serat: {
          DEFAULT: '#6ee7b7',
          bg: 'rgba(110, 231, 183, 0.1)',
        },
        burned: {
          DEFAULT: '#22d3ee',
          bg: 'rgba(34, 211, 238, 0.1)',
        },
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
    },
  },
  plugins: [],
}
