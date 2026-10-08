import { roundMoney } from '@/services/taxes/calculateTaxes';
import type { Money, Operation, TransportMode } from '@/types/operation';

export type OperationsSummary = {
    totalCount: number;
    importCount: number;
    exportCount: number;
    pendingCount: number;
    transportCounts: Record<TransportMode, number>;
    /** Suma de las operaciones pendientes de pago. */
    receivable: Money;
    /** Suma de las operaciones pagadas y liberadas. */
    collected: Money;
};

export function summarizeOperations(operations: Operation[]): OperationsSummary {
    let importCount = 0;
    let pendingCount = 0;
    const receivable = { usd: 0, bs: 0 };
    const collected = { usd: 0, bs: 0 };
    const transportCounts: Record<TransportMode, number> = { sea: 0, air: 0, land: 0 };

    for (const operation of operations) {
        if (operation.type === 'import') importCount += 1;
        transportCounts[operation.transport] += 1;
        const bucket = operation.status === 'pending' ? receivable : collected;
        if (operation.status === 'pending') pendingCount += 1;
        bucket.usd += operation.breakdown.total.usd;
        bucket.bs += operation.breakdown.total.bs;
    }

    return {
        totalCount: operations.length,
        importCount,
        exportCount: operations.length - importCount,
        pendingCount,
        transportCounts,
        receivable: { usd: roundMoney(receivable.usd), bs: roundMoney(receivable.bs) },
        collected: { usd: roundMoney(collected.usd), bs: roundMoney(collected.bs) },
    };
}
