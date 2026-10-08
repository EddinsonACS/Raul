import { migrateOperationsState } from '@/stores/operations/operationsStore';
import type { Operation } from '@/types/operation';

const legacy = (id: string, extra: Partial<Operation> = {}) =>
    ({ id, type: 'import', description: id, categoryId: 'cat-otros', value: 10, freight: 0, insurance: 0, status: 'pending', createdAt: '2026-10-01T00:00:00.000Z', paidAt: null, receiptNumber: null, exchangeRate: 900, breakdown: {} as Operation['breakdown'], ...extra }) as Operation;

describe('migrateOperationsState', () => {
    it('regenera los datos de ejemplo con transporte variado y la fórmula nueva', () => {
        const state = migrateOperationsState({ operations: [legacy('seed-01'), legacy('seed-02'), legacy('seed-13')], receiptCounter: 10, seeded: true }, 1);
        expect(state.operations).toHaveLength(13);
        expect(new Set(state.operations.map((o) => o.transport))).toEqual(new Set(['sea', 'air', 'land']));
        expect(state.operations.every((o) => 'customsFee' in o.breakdown)).toBe(true);
        expect(state.receiptCounter).toBe(10);
    });

    it('conserva las operaciones del usuario y les asigna transporte si no lo tenían', () => {
        const mine = legacy('abc', { description: 'Mía' });
        const state = migrateOperationsState({ operations: [legacy('seed-01'), mine], receiptCounter: 1, seeded: true }, 2);
        const kept = state.operations.find((o) => o.id === 'abc');
        expect(kept?.description).toBe('Mía');
        expect(kept?.transport).toBe('sea');
        expect(state.operations.filter((o) => o.id.startsWith('seed-'))).toHaveLength(13);
    });

    it('no toca operaciones que ya tienen transporte', () => {
        const mine = legacy('abc', { transport: 'air' });
        const state = migrateOperationsState({ operations: [mine], receiptCounter: 0, seeded: false }, 2);
        expect(state.operations).toEqual([mine]);
    });
});
