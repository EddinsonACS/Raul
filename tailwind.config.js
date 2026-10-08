/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
        './Context/**/*.{js,jsx,ts,tsx}',
        './Shared/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                // Variables del tema: las resuelve ThemeProvider con vars().
                fondo: 'var(--fondo)',
                fondo2: 'var(--fondo2)',
                fondo3: 'var(--fondo3)',
                texto1: 'var(--texto1)',
                texto2: 'var(--texto2)',
                borde: 'var(--borde)',
                primario: 'var(--primario)',
                velo: 'rgb(var(--velo) / <alpha-value>)',
                // Constantes de marca: no cambian con el tema.
                marca: '#071633',
                marca2: '#0E2A52',
                acento: '#38BDF8',
                verde: '#0BBE90',
                amarillo: '#F59E0B',
                rojo: '#EF4444',
            },
            borderRadius: {
                '3xl': '20px',
                '4xl': '28px',
            },
        },
    },
    plugins: [],
};
