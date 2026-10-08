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
                // Interfaz (mismos valores que Shared/Global/colors.ts).
                fondo: '#F6F7FB',
                fondo2: '#FFFFFF',
                fondo3: '#EEF1F7',
                texto1: '#0F172A',
                texto2: '#64748B',
                borde: '#E2E6EF',
                primario: '#2563EB',
                velo: '#071633',
                // Marca.
                marca: '#071633',
                marca2: '#0E2A52',
                acento: '#38BDF8',
                violeta: '#8B5CF6',
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
