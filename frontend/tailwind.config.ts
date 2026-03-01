import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    // Disable Tailwind dark mode so system preference doesn't override our theme
    darkMode: 'class',   // only apply dark mode via explicit .dark class (which we never add)
    theme: {
        extend: {},
    },
    plugins: [],
}

export default config
