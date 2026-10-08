import type { Category, TaxSettings } from '@/types/rates';

export const DEFAULT_SETTINGS: TaxSettings = {
    vatRate: 16,
    exemptMinimum: 200,
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
