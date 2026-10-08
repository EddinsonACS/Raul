import type { Money, OperationInput, TaxBreakdown } from '@/types/operation';
import type { TaxSettings } from '@/types/rates';

export type TaxableAmounts = Pick<OperationInput, 'type' | 'value' | 'freight' | 'insurance'>;

export function roundMoney(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

function toMoney(usd: number, exchangeRate: number): Money {
    const rounded = roundMoney(usd);
    return { usd: rounded, bs: roundMoney(rounded * exchangeRate) };
}

export function calculateTaxes(amounts: TaxableAmounts, tariffRate: number, settings: TaxSettings): TaxBreakdown {
    const { exchangeRate } = settings;
    const customsUsd = roundMoney(amounts.value + amounts.freight + amounts.insurance);

    if (amounts.type === 'export') {
        return {
            customsValue: toMoney(customsUsd, exchangeRate),
            tariff: toMoney(0, exchangeRate),
            vat: toMoney(0, exchangeRate),
            total: toMoney(settings.exportFee, exchangeRate),
            tariffExempt: false,
        };
    }

    const tariffExempt = customsUsd <= settings.exemptMinimum;
    const tariffUsd = tariffExempt ? 0 : roundMoney((customsUsd * tariffRate) / 100);
    const vatUsd = roundMoney(((customsUsd + tariffUsd) * settings.vatRate) / 100);

    return {
        customsValue: toMoney(customsUsd, exchangeRate),
        tariff: toMoney(tariffUsd, exchangeRate),
        vat: toMoney(vatUsd, exchangeRate),
        total: toMoney(tariffUsd + vatUsd, exchangeRate),
        tariffExempt,
    };
}
