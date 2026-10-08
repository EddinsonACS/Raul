export type Category = {
    id: string;
    name: string;
    /** Porcentaje de arancel, de 0 a 100. */
    tariffRate: number;
};

export type TaxSettings = {
    /** Porcentaje de IVA, de 0 a 100. */
    vatRate: number;
    /** Valor en aduana (USD) hasta el cual no se paga arancel. */
    exemptMinimum: number;
    /** Tasa fija de trámite de exportación, en USD. */
    exportFee: number;
    /** Bolívares por 1 USD. */
    exchangeRate: number;
};
