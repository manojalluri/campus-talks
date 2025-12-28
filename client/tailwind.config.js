/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'primary-purple': '#7c3aed',
                'primary-blue': '#3b82f6',
                'bg-dark': '#0f172a',
                'bg-darker': '#020617',
                'bg-card': '#1e293b',
                'bg-card-hover': '#334155',
                'accent-green': '#10b981',
                'accent-red': '#ef4444',
                'accent-yellow': '#f59e0b',
                'accent-pink': '#ec4899',
                'text-primary': '#f8fafc',
                'text-secondary': '#cbd5e1',
                'text-muted': '#64748b',
            },
            backgroundImage: {
                'primary-gradient': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                'glass-gradient': 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0))',
            },
            fontFamily: {
                'sans': ['Inter', 'SF Pro Display', '-apple-system', 'sans-serif'],
                'display': ['Poppins', 'sans-serif'],
            },
            boxShadow: {
                'glow': '0 0 20px rgba(124, 58, 237, 0.5)',
            },
            backdropBlur: {
                'glass': '10px',
            }
        },
    },
    plugins: [],
}
