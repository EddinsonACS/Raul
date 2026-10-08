import { availableModes, isAvailableFor, tariffRateFor } from '@/services/taxes/tariff';

const category = { rates: { sea: 20, air: 25 } };

describe('tariffRateFor', () => {
    it('devuelve el arancel del transporte o undefined si no existe', () => {
        expect(tariffRateFor(category, 'sea')).toBe(20);
        expect(tariffRateFor(category, 'air')).toBe(25);
        expect(tariffRateFor(category, 'land')).toBeUndefined();
        expect(tariffRateFor({ rates: { land: 0 } }, 'land')).toBe(0);
    });
});

describe('isAvailableFor y availableModes', () => {
    it('indican con qué transportes se puede usar la categoría', () => {
        expect(isAvailableFor(category, 'land')).toBe(false);
        expect(isAvailableFor({ rates: { land: 0 } }, 'land')).toBe(true);
        expect(availableModes(category)).toEqual(['sea', 'air']);
        expect(availableModes({ rates: {} })).toEqual([]);
    });
});
