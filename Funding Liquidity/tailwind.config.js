/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                gray: {
                    850: '#1f2937',
                    900: '#111827',
                    950: '#0B0F19', // Deep dark for finance background
                },
                primary: {
                    500: '#3B82F6',
                    600: '#2563EB',
                },
                accent: {
                    green: '#10B981',
                    red: '#EF4444',
                    yellow: '#F59E0B',
                }
            },
            fontFamily: {
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', "Liberation Mono", "Courier New", 'monospace'],
            }
        },
    },
    plugins: [],
}
