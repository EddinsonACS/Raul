import { calculateTaxes, roundMoney, toMoney } from '@/services/taxes/calculateTaxes';
import type { TaxSettings } from '@/types/rates';

const SETTINGS: TaxSettings = { vatRate: 16, exemptMinimum: 200, exportFee: 10, exchangeRate: 900 };

describe('calculateTaxes: importación', () => {
    it('cobra arancel e IVA sobre el mínimo exento', () => {
        const result = calculateTaxes({ type: 'import', value: 300, freight: 30, insurance: 10 }, 5, SETTINGS);
        expect(result).toEqual({
            customsValue: { usd: 340, bs: 306000 },
            tariff: { usd: 17, bs: 15300 },
            vat: { usd: 57.12, bs: 51408 },
            total: { usd: 74.12, bs: 66708 },
            tariffExempt: false,
        });
    });

    it('no cobra arancel bajo el mínimo exento, pero sí IVA', () => {
        const result = calculateTaxes({ type: 'import', value: 100, freight: 20, insurance: 5 }, 20, SETTINGS);
        expect(result).toEqual({
            customsValue: { usd: 125, bs: 112500 },
            tariff: { usd: 0, bs: 0 },
            vat: { usd: 20, bs: 18000 },
            total: { usd: 20, bs: 18000 },
            tariffExempt: true,
        });
    });

    it('exime el arancel cuando el valor en aduana es igual al mínimo', () => {
        const result = calculateTaxes({ type: 'import', value: 150, freight: 30, insurance: 20 }, 20, SETTINGS);
        expect(result.customsValue.usd).toBe(200);
        expect(result.tariffExempt).toBe(true);
        expect(result.total).toEqual({ usd: 32, bs: 28800 });
    });

    it('cobra arancel un centavo por encima del mínimo', () => {
        const result = calculateTaxes({ type: 'import', value: 150.01, freight: 30, insurance: 20 }, 20, SETTINGS);
        expect(result.tariffExempt).toBe(false);
        expect(result.tariff.usd).toBe(40);
        expect(result.total).toEqual({ usd: 78.4, bs: 70560 });
    });

    it('con categoría de 0 % cobra solo IVA y no la marca como exenta', () => {
        const result = calculateTaxes({ type: 'import', value: 500, freight: 0, insurance: 0 }, 0, SETTINGS);
        expect(result.tariff.usd).toBe(0);
        expect(result.tariffExempt).toBe(false);
        expect(result.total).toEqual({ usd: 80, bs: 72000 });
    });

    it('redondea cada monto a dos decimales', () => {
        const settings = { ...SETTINGS, exemptMinimum: 0, exchangeRate: 40.25 };
        const result = calculateTaxes({ type: 'import', value: 33.33, freight: 0, insurance: 0 }, 15, settings);
        expect(result).toEqual({
            customsValue: { usd: 33.33, bs: 1341.53 },
            tariff: { usd: 5, bs: 201.25 },
            vat: { usd: 6.13, bs: 246.73 },
            total: { usd: 11.13, bs: 447.98 },
            tariffExempt: false,
        });
    });

    it('no arrastra errores de coma flotante al sumar', () => {
        const settings = { ...SETTINGS, exemptMinimum: 0 };
        const result = calculateTaxes({ type: 'import', value: 0.1, freight: 0.2, insurance: 0 }, 10, settings);
        expect(result.customsValue.usd).toBe(0.3);
    });

    it('convierte a Bs con la tasa recibida', () => {
        const settings = { ...SETTINGS, exchangeRate: 950 };
        const result = calculateTaxes({ type: 'import', value: 300, freight: 30, insurance: 10 }, 5, settings);
        expect(result.total).toEqual({ usd: 74.12, bs: 70414 });
    });
});

describe('calculateTaxes: exportación', () => {
    it('cobra solo la tasa de trámite', () => {
        const result = calculateTaxes({ type: 'export', value: 1000, freight: 50, insurance: 0 }, 20, SETTINGS);
        expect(result).toEqual({
            customsValue: { usd: 1050, bs: 945000 },
            tariff: { usd: 0, bs: 0 },
            vat: { usd: 0, bs: 0 },
            total: { usd: 10, bs: 9000 },
            tariffExempt: false,
        });
    });
});

describe('roundMoney', () => {
    it('redondea a dos decimales', () => {
        expect(roundMoney(4.9995)).toBe(5);
        expect(roundMoney(6.1328)).toBe(6.13);
    });
});

describe('toMoney', () => {
    it('convierte un monto en USD a ambas monedas', () => {
        expect(toMoney(300, 900)).toEqual({ usd: 300, bs: 270000 });
        expect(toMoney(33.33, 40.25)).toEqual({ usd: 33.33, bs: 1341.53 });
    });
});
