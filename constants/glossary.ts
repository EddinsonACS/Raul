export type GlossaryKey =
    | 'customsValue'
    | 'tariff'
    | 'vat'
    | 'exemptMinimum'
    | 'freight'
    | 'insurance'
    | 'exportFee'
    | 'exchangeRate';

export const GLOSSARY: Record<GlossaryKey, { title: string; text: string }> = {
    customsValue: {
        title: 'Valor en aduana',
        text: 'Es la base sobre la que se calculan los impuestos: el precio del producto más el flete y el seguro.',
    },
    tariff: {
        title: 'Arancel',
        text: 'Impuesto a la importación. Es un porcentaje del valor en aduana que depende de la categoría del producto.',
    },
    vat: {
        title: 'IVA',
        text: 'Impuesto al valor agregado. Se calcula sobre el valor en aduana más el arancel.',
    },
    exemptMinimum: {
        title: 'Mínimo exento',
        text: 'Si el valor en aduana no supera este monto, la importación no paga arancel. El IVA sí se cobra.',
    },
    freight: {
        title: 'Flete',
        text: 'Lo que costó transportar la mercancía hasta el país. Forma parte del valor en aduana.',
    },
    insurance: {
        title: 'Seguro',
        text: 'Lo que se pagó por asegurar la mercancía durante el viaje. Si no hubo seguro, déjalo en cero.',
    },
    exportFee: {
        title: 'Tasa de trámite',
        text: 'Monto fijo que se cobra por gestionar una exportación. Las exportaciones no pagan arancel ni IVA.',
    },
    exchangeRate: {
        title: 'Tasa del día',
        text: 'Cuántos bolívares vale un dólar hoy. Cada operación guarda la tasa con la que se calculó.',
    },
};
