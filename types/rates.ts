import type { TransportMode } from '@/types/operation';

/** Arancel por transporte. Un modo ausente significa que la categoria no se puede usar con ese transporte. */
export type TariffRates = Partial<Record<TransportMode, number>>;

export type Category = {
    id: string;
    name: string;
    rates: TariffRates;
};

export type CategoryInput = Pick<Category, 'name' | 'rates'>;

export type TaxSettings = {
    /** Porcentaje de IVA, de 0 a 100. */
    vatRate: number;
    /** Valor del producto (USD) hasta el cual un envio no paga ningun tributo. */
    exemptMinimum: number;
    /** Tasa por servicios de aduana, porcentaje del valor en aduana. */
    customsFeeRate: number;
    /** Tasa fija de tramite de exportacion, en USD. */
    exportFee: number;
    /** Bolivares por 1 USD. */
    exchangeRate: number;
};
