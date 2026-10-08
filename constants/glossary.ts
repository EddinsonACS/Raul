export type GlossaryKey =
    | 'customsValue'
    | 'tariff'
    | 'vat'
    | 'exemptMinimum'
    | 'freight'
    | 'insurance'
    | 'customsFee'
    | 'exportFee'
    | 'exchangeRate'
    | 'transport';

export const GLOSSARY: Record<GlossaryKey, { title: string; text: string }> = {
    customsValue: {
        title: 'Valor en aduana',
        text: 'Es la base sobre la que se calculan los impuestos: el precio del producto más el flete y el seguro.',
    },
    tariff: {
        title: 'Arancel',
        text: 'Impuesto a la importación: un porcentaje del valor en aduana según la categoría del producto (en la ley, según su código arancelario, entre 0 % y 35 %).',
    },
    vat: {
        title: 'IVA',
        text: 'Impuesto al valor agregado, 16 % en Venezuela. Se calcula sobre el valor en aduana más el arancel y la tasa aduanera.',
    },
    exemptMinimum: {
        title: 'Mínimo exento',
        text: 'Si el valor del producto no supera este monto, el envío no paga ningún tributo. En Venezuela los envíos courier de hasta 100 USD están libres de impuestos (Resolución 3.283 de 1997).',
    },
    freight: {
        title: 'Flete',
        text: 'Lo que costó transportar la mercancía hasta el país. Forma parte del valor en aduana.',
    },
    insurance: {
        title: 'Seguro',
        text: 'Lo que se pagó por asegurar la mercancía durante el viaje. Si no hubo seguro, déjalo en cero.',
    },
    customsFee: {
        title: 'Tasa aduanera',
        text: 'Tasa por servicios de aduana: 1 % del valor en aduana en toda importación que paga tributos. Entra en la base del IVA.',
    },
    exportFee: {
        title: 'Tasa de trámite',
        text: 'Monto fijo que se cobra por gestionar una exportación. Las exportaciones no pagan arancel ni IVA.',
    },
    exchangeRate: {
        title: 'Tasa del día',
        text: 'Cuántos bolívares vale un dólar hoy. Cada operación guarda la tasa con la que se calculó.',
    },
    transport: {
        title: 'Transporte',
        text: 'Cómo llega la mercancía: por mar, por aire o por tierra. Cada categoría define su arancel por transporte; si no lo tiene para uno, no se puede cotizar con ese transporte. En la ley el arancel depende del producto, no del transporte.',
    },
};
