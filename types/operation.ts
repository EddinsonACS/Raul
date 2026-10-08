export type OperationType = 'import' | 'export';

export type TransportMode = 'sea' | 'air' | 'land';

export type OperationStatus = 'pending' | 'paid' | 'released';

export type Money = {
    usd: number;
    bs: number;
};

export type TaxBreakdown = {
    customsValue: Money;
    tariff: Money;
    customsFee: Money;
    vat: Money;
    total: Money;
    /** true cuando la importacion no paga ningun tributo por no superar el minimo exento. */
    exempt: boolean;
};

export type OperationInput = {
    type: OperationType;
    transport: TransportMode;
    description: string;
    categoryId: string;
    value: number;
    freight: number;
    insurance: number;
};

export type Operation = OperationInput & {
    id: string;
    breakdown: TaxBreakdown;
    exchangeRate: number;
    status: OperationStatus;
    createdAt: string;
    paidAt: string | null;
    receiptNumber: string | null;
};
