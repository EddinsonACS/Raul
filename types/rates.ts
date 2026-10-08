import type { TransportMode } from '@/types/operation';

export type Category = {
    id: string;
    name: string;
    /** Porcentaje de arancel, de 0 a 100. Se usa cuando no hay valor para el transporte. */
    tariffRate: number;
    /** Arancel por transporte; si falta un modo se usa `tariffRate`. Ausente = mismo arancel para todos. */
    tariffByMode?: Partial<Record<TransportMode, number>>;
};

export type CategoryInput = Pick<Category, 'name' | 'tariffRate' | 'tariffByMode'>;

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
