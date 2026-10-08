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

// Arancel por transporte; el modo que falta no esta disponible para esa categoria.
export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'cat-ropa', name: 'Ropa y calzado', rates: { sea: 20, air: 25, land: 20 } },
    { id: 'cat-electronica', name: 'Electrónica', rates: { sea: 5, air: 8, land: 5 } },
    { id: 'cat-libros', name: 'Libros', rates: { sea: 0, air: 0, land: 0 } },
    { id: 'cat-juguetes', name: 'Juguetes', rates: { sea: 15, air: 15 } },
    { id: 'cat-cosmeticos', name: 'Cosméticos', rates: { sea: 15, air: 18 } },
    { id: 'cat-otros', name: 'Otros', rates: { sea: 10, air: 12, land: 10 } },
];
