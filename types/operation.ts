export type OperationType = 'import' | 'export';

export type OperationStatus = 'pending' | 'paid' | 'released';

export type Money = {
    usd: number;
    bs: number;
};

export type TaxBreakdown = {
    customsValue: Money;
    tariff: Money;
    vat: Money;
    total: Money;
    /** true cuando una importación no paga arancel por estar bajo el mínimo exento. */
    tariffExempt: boolean;
};

export type OperationInput = {
    type: OperationType;
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
