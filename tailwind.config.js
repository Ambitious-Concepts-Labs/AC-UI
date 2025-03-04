// tailwind.config.js
module.exports = {
    content: [
      "./pages/**/*.{js,ts,jsx,tsx}",
      "./components/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
          'gray': {
            900: '#0a192f', // Dark navy background
            400: '#8892b0', // Slate gray for secondary text
            300: '#ccd6f6', // Light slate for hover states
            200: '#e6f1ff', // Lightest slate for primary text
            100: '#ffffff', // White for headings
          },
          'teal': {
            400: '#64ffda', // Accent color
          },
        },
        fontFamily: {
          sans: ['Calibre', 'Inter', 'San Francisco', 'SF Pro Text', 'system-ui', 'sans-serif'],
          mono: ['SF Mono', 'Fira Code', 'Fira Mono', 'Roboto Mono', 'monospace'],
        },
      },
    },
    plugins: [],
  }