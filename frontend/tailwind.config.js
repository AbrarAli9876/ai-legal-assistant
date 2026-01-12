/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Scan all React components for classes
  ],
  theme: {
    extend: {
      colors: {
        // Your custom color palette
        'legal-blue': {
          'primary': '#1E3A8A',    // Deep Royal Blue
          'highlight': '#3B82F6', // Sky Blue (Sidebar Highlight)
        },
        'legal-gold': {
          'primary': '#FACC15',    // Legal Gold (Accent)
          'hover': '#FBBF24',      // Gold Hover (Buttons/Links)
        },
        'legal-gray': {
          'bg': '#F9FAFB',        // Soft Gray / White (Background)
        },
        'legal-text': {
          'primary': '#111827',    // Charcoal Black (Text)
        },
      }
    },
  },
  plugins: [],
}