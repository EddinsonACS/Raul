/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                fondo: '#F9F8FD',
                tarjeta: '#FFFFFF',
                primario: '#029AFF',
                texto1: '#111827',
                texto2: '#6B7280',
                borde: '#DEDEE2',
                verde: '#0BBE90',
                amarillo: '#F99705',
                rojo: '#FF3B30',
            },
        },
    },
    plugins: [],
};
