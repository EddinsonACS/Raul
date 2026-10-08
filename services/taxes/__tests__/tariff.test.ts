import { hasModeRates, tariffRateFor } from '@/services/taxes/tariff';

describe('tariffRateFor', () => {
    it('usa el arancel general cuando la categoría no distingue transporte', () => {
        expect(tariffRateFor({ tariffRate: 20 }, 'sea')).toBe(20);
        expect(tariffRateFor({ tariffRate: 20, tariffByMode: {} }, 'air')).toBe(20);
    });

    it('usa el arancel del transporte cuando existe y el general si falta', () => {
        const category = { tariffRate: 20, tariffByMode: { air: 25, land: 18 } };
        expect(tariffRateFor(category, 'air')).toBe(25);
        expect(tariffRateFor(category, 'land')).toBe(18);
        expect(tariffRateFor(category, 'sea')).toBe(20);
    });
});

describe('hasModeRates', () => {
    it('detecta si hay aranceles por transporte', () => {
        expect(hasModeRates({})).toBe(false);
        expect(hasModeRates({ tariffByMode: {} })).toBe(false);
        expect(hasModeRates({ tariffByMode: { sea: 10 } })).toBe(true);
    });
});
