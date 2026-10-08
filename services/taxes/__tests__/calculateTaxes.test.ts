import { calculateTaxes, roundMoney, toMoney } from '@/services/taxes/calculateTaxes';
import type { TaxSettings } from '@/types/rates';

const SETTINGS: TaxSettings = { vatRate: 16, exemptMinimum: 100, customsFeeRate: 1, exportFee: 10, exchangeRate: 900 };

describe('calculateTaxes: importación', () => {
    it('cobra arancel, tasa aduanera e IVA sobre el mínimo exento', () => {
        const result = calculateTaxes({ type: 'import', value: 300, freight: 30, insurance: 10 }, 5, SETTINGS);
        expect(result).toEqual({
            customsValue: { usd: 340, bs: 306000 },
            tariff: { usd: 17, bs: 15300 },
            customsFee: { usd: 3.4, bs: 3060 },
            vat: { usd: 57.66, bs: 51894 },
            total: { usd: 78.06, bs: 70254 },
            exempt: false,
        });
    });

    it('no paga nada cuando el producto no supera el mínimo exento', () => {
        const result = calculateTaxes({ type: 'import', value: 100, freight: 20, insurance: 5 }, 20, SETTINGS);
        expect(result).toEqual({
            customsValue: { usd: 125, bs: 112500 },
            tariff: { usd: 0, bs: 0 },
            customsFee: { usd: 0, bs: 0 },
            vat: { usd: 0, bs: 0 },
            total: { usd: 0, bs: 0 },
            exempt: true,
        });
    });

    it('el mínimo se compara con el valor del producto, no con el valor en aduana', () => {
        const result = calculateTaxes({ type: 'import', value: 50, freight: 5, insurance: 0 }, 0, SETTINGS);
        expect(result.customsValue.usd).toBe(55);
        expect(result.exempt).toBe(true);
    });

    it('cobra todo un centavo por encima del mínimo', () => {
        const result = calculateTaxes({ type: 'import', value: 100.01, freight: 20, insurance: 5 }, 20, SETTINGS);
        expect(result.exempt).toBe(false);
        expect(result.tariff.usd).toBe(25);
        expect(result.customsFee.usd).toBe(1.25);
        expect(result.vat.usd).toBe(24.2);
        expect(result.total).toEqual({ usd: 50.45, bs: 45405 });
    });

    it('con categoría de 0 % cobra la tasa aduanera y el IVA, sin marcarla exenta', () => {
        const result = calculateTaxes({ type: 'import', value: 500, freight: 0, insurance: 0 }, 0, SETTINGS);
        expect(result.tariff.usd).toBe(0);
        expect(result.customsFee.usd).toBe(5);
        expect(result.exempt).toBe(false);
        expect(result.total).toEqual({ usd: 85.8, bs: 77220 });
    });

    it('redondea cada monto a dos decimales', () => {
        const settings = { ...SETTINGS, exemptMinimum: 0, exchangeRate: 40.25 };
        const result = calculateTaxes({ type: 'import', value: 33.33, freight: 0, insurance: 0 }, 15, settings);
        expect(result).toEqual({
            customsValue: { usd: 33.33, bs: 1341.53 },
            tariff: { usd: 5, bs: 201.25 },
            customsFee: { usd: 0.33, bs: 13.28 },
            vat: { usd: 6.19, bs: 249.15 },
            total: { usd: 11.52, bs: 463.68 },
            exempt: false,
        });
    });

    it('no arrastra errores de coma flotante al sumar', () => {
        const result = calculateTaxes({ type: 'import', value: 0.1, freight: 0.2, insurance: 0 }, 10, { ...SETTINGS, exemptMinimum: 0 });
        expect(result.customsValue.usd).toBe(0.3);
    });

    it('convierte a Bs con la tasa recibida', () => {
        const result = calculateTaxes({ type: 'import', value: 300, freight: 30, insurance: 10 }, 5, { ...SETTINGS, exchangeRate: 950 });
        expect(result.total).toEqual({ usd: 78.06, bs: 74157 });
    });
});

describe('calculateTaxes: exportación', () => {
    it('cobra solo la tasa de trámite', () => {
        const result = calculateTaxes({ type: 'export', value: 1000, freight: 50, insurance: 0 }, 20, SETTINGS);
        expect(result).toEqual({
            customsValue: { usd: 1050, bs: 945000 },
            tariff: { usd: 0, bs: 0 },
            customsFee: { usd: 0, bs: 0 },
            vat: { usd: 0, bs: 0 },
            total: { usd: 10, bs: 9000 },
            exempt: false,
        });
    });
});

describe('roundMoney y toMoney', () => {
    it('redondean a dos decimales', () => {
        expect(roundMoney(4.9995)).toBe(5);
        expect(roundMoney(6.1328)).toBe(6.13);
        expect(toMoney(300, 900)).toEqual({ usd: 300, bs: 270000 });
        expect(toMoney(33.33, 40.25)).toEqual({ usd: 33.33, bs: 1341.53 });
    });
});
