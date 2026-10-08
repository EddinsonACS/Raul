import { roundMoney } from '@/services/taxes/calculateTaxes';
import type { Operation } from '@/types/operation';

export type DayAmount = {
    /** Dia de la semana abreviado, dos letras. */
    label: string;
    usd: number;
    isToday: boolean;
};

export type PendingBar = {
    id: string;
    description: string;
    usd: number;
    bs: number;
};

const DAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sá'];

const dayKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;

/** Lo cobrado por dia en los ultimos `days` dias, terminando en `now`. */
export function collectedByDay(operations: Operation[], days: number, now: Date): DayAmount[] {
    const totals = new Map<string, number>();
    for (const operation of operations) {
        if (operation.status === 'pending' || !operation.paidAt) continue;
        const key = dayKey(new Date(operation.paidAt));
        totals.set(key, (totals.get(key) ?? 0) + operation.breakdown.total.usd);
    }
    return Array.from({ length: days }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1 - index));
        return {
            label: DAY_LABELS[date.getDay()],
            usd: roundMoney(totals.get(dayKey(date)) ?? 0),
            isToday: index === days - 1,
        };
    });
}

/** Operaciones pendientes de mayor a menor monto, hasta `max`. */
export function pendingBars(operations: Operation[], max: number): PendingBar[] {
    return operations
        .filter((operation) => operation.status === 'pending')
        .sort((a, b) => b.breakdown.total.usd - a.breakdown.total.usd)
        .slice(0, max)
        .map((operation) => ({
            id: operation.id,
            description: operation.description,
            usd: operation.breakdown.total.usd,
            bs: operation.breakdown.total.bs,
        }));
}
