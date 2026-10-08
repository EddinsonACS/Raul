import type { Category, TaxSettings } from '@/types/rates';

// Valores de referencia para Venezuela: IVA 16 %, tasa por servicios de aduana 1 % del valor en aduana
// y envios courier de hasta 100 USD libres de tributos (Resolucion 3.283, G.O. 36.127 de 1997).
export const DEFAULT_SETTINGS: TaxSettings = {
    vatRate: 16,
    exemptMinimum: 100,
    customsFeeRate: 1,
    exportFee: 10,
    exchangeRate: 900,
};

export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'cat-ropa', name: 'Ropa y calzado', tariffRate: 20 },
    { id: 'cat-electronica', name: 'Electrónica', tariffRate: 5 },
    { id: 'cat-libros', name: 'Libros', tariffRate: 0 },
    { id: 'cat-juguetes', name: 'Juguetes', tariffRate: 15 },
    { id: 'cat-cosmeticos', name: 'Cosméticos', tariffRate: 15 },
    { id: 'cat-otros', name: 'Otros', tariffRate: 10 },
];
