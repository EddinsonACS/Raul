import type { Money, OperationInput, TaxBreakdown } from '@/types/operation';
import type { TaxSettings } from '@/types/rates';

export type TaxableAmounts = Pick<OperationInput, 'type' | 'value' | 'freight' | 'insurance'>;

export function roundMoney(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function toMoney(usd: number, exchangeRate: number): Money {
    const rounded = roundMoney(usd);
    return { usd: rounded, bs: roundMoney(rounded * exchangeRate) };
}

/**
 * Importacion: valor en aduana (CIF) = producto + flete + seguro. Si el producto no supera el minimo
 * exento no paga nada. Si lo supera: arancel = CIF x tasa de la categoria; tasa aduanera = CIF x 1 %;
 * IVA = (CIF + arancel + tasa) x 16 %. Exportacion: solo la tasa fija de tramite.
 */
export function calculateTaxes(amounts: TaxableAmounts, tariffRate: number, settings: TaxSettings): TaxBreakdown {
    const { exchangeRate } = settings;
    const customsUsd = roundMoney(amounts.value + amounts.freight + amounts.insurance);
    const zero = toMoney(0, exchangeRate);
    const customsValue = toMoney(customsUsd, exchangeRate);

    if (amounts.type === 'export') {
        return { customsValue, tariff: zero, customsFee: zero, vat: zero, total: toMoney(settings.exportFee, exchangeRate), exempt: false };
    }

    if (amounts.value <= settings.exemptMinimum) {
        return { customsValue, tariff: zero, customsFee: zero, vat: zero, total: zero, exempt: true };
    }

    const tariffUsd = roundMoney((customsUsd * tariffRate) / 100);
    const feeUsd = roundMoney((customsUsd * settings.customsFeeRate) / 100);
    const vatUsd = roundMoney(((customsUsd + tariffUsd + feeUsd) * settings.vatRate) / 100);

    return {
        customsValue,
        tariff: toMoney(tariffUsd, exchangeRate),
        customsFee: toMoney(feeUsd, exchangeRate),
        vat: toMoney(vatUsd, exchangeRate),
        total: toMoney(tariffUsd + feeUsd + vatUsd, exchangeRate),
        exempt: false,
    };
}
