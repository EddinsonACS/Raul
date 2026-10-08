import { roundMoney } from '@/services/taxes/calculateTaxes';
import type { Money, Operation } from '@/types/operation';

export type OperationsSummary = {
    pendingCount: number;
    collected: Money;
};

export function summarizeOperations(operations: Operation[]): OperationsSummary {
    let pendingCount = 0;
    let usd = 0;
    let bs = 0;
    for (const operation of operations) {
        if (operation.status === 'pending') {
            pendingCount += 1;
        } else {
            usd += operation.breakdown.total.usd;
            bs += operation.breakdown.total.bs;
        }
    }
    return { pendingCount, collected: { usd: roundMoney(usd), bs: roundMoney(bs) } };
}
