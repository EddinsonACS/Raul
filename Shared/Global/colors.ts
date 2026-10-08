export type ThemeColors = {
    fondo: string;
    fondo2: string;
    fondo3: string;
    texto1: string;
    texto2: string;
    borde: string;
    primario: string;
    /** Componentes RGB separados por coma, para usar con opacidad (`bg-velo/60`). */
    velo: string;
};

export const BRAND = {
    marca: '#071633',
    marca2: '#0E2A52',
    acento: '#38BDF8',
    verde: '#0BBE90',
    amarillo: '#F59E0B',
    rojo: '#EF4444',
    blanco: '#FFFFFF',
} as const;

export const COLORS: Record<'light' | 'dark', ThemeColors> = {
    light: {
        fondo: '#F6F7FB',
        fondo2: '#FFFFFF',
        fondo3: '#EEF1F7',
        texto1: '#0F172A',
        texto2: '#64748B',
        borde: '#E2E6EF',
        primario: '#2563EB',
        velo: '7, 22, 51',
    },
    dark: {
        fondo: '#0B1220',
        fondo2: '#111A2E',
        fondo3: '#1A2540',
        texto1: '#F1F5F9',
        texto2: '#94A3B8',
        borde: '#243049',
        primario: '#60A5FA',
        velo: '0, 0, 0',
    },
};
