import { matchesQuery, normalizeText } from '@/utils/text';

describe('normalizeText', () => {
    it('quita acentos, mayúsculas y espacios sobrantes', () => {
        expect(normalizeText('  Electrónica ')).toBe('electronica');
        expect(normalizeText('Ropa y Calzado')).toBe('ropa y calzado');
    });
});

describe('matchesQuery', () => {
    it('encuentra sin importar acentos ni mayúsculas', () => {
        expect(matchesQuery('Electrónica', 'electronica')).toBe(true);
        expect(matchesQuery('Cosméticos', 'COSM')).toBe(true);
        expect(matchesQuery('Libros', 'rop')).toBe(false);
    });

    it('una consulta vacía coincide con todo', () => {
        expect(matchesQuery('Juguetes', '')).toBe(true);
        expect(matchesQuery('Juguetes', '   ')).toBe(true);
    });
});
