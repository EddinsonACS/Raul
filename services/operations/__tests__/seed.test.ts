import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/constants/defaults';
import { buildSeedOperations } from '@/services/operations/seed';
import { calculateTaxes } from '@/services/taxes/calculateTaxes';
import { useOperationsStore } from '@/stores/operations/operationsStore';

const NOW = new Date(2026, 9, 8, 15, 30);

describe('buildSeedOperations', () => {
    const { operations, receiptCounter } = buildSeedOperations(NOW);

    it('genera varias operaciones con los tres estados, las más nuevas primero', () => {
        expect(operations.length).toBeGreaterThanOrEqual(10);
        const statuses = new Set(operations.map((o) => o.status));
        expect(statuses).toEqual(new Set(['pending', 'paid', 'released']));
        for (let i = 1; i < operations.length; i++) {
            expect(operations[i - 1].createdAt >= operations[i].createdAt).toBe(true);
        }
    });

    it('usa categorías existentes y desgloses correctos con la configuración inicial', () => {
        const ids = new Set(DEFAULT_CATEGORIES.map((c) => c.id));
        for (const operation of operations) {
            expect(ids.has(operation.categoryId)).toBe(true);
            const category = DEFAULT_CATEGORIES.find((c) => c.id === operation.categoryId)!;
            expect(operation.breakdown).toEqual(calculateTaxes(operation, category.tariffRate, DEFAULT_SETTINGS));
            expect(operation.exchangeRate).toBe(DEFAULT_SETTINGS.exchangeRate);
        }
    });

    it('numera los comprobantes en orden de pago sin saltos', () => {
        const paid = operations.filter((o) => o.status !== 'pending').sort((a, b) => a.paidAt!.localeCompare(b.paidAt!));
        expect(paid.map((o) => o.receiptNumber)).toEqual(paid.map((_, i) => `ADU-${String(i + 1).padStart(6, '0')}`));
        expect(receiptCounter).toBe(paid.length);
        expect(operations.filter((o) => o.status === 'pending').every((o) => o.receiptNumber === null && o.paidAt === null)).toBe(true);
    });

    it('reparte las fechas en las últimas dos semanas y nunca en el futuro', () => {
        const twoWeeksAgo = new Date(NOW.getTime() - 14 * 24 * 3600 * 1000).toISOString();
        for (const operation of operations) {
            expect(operation.createdAt >= twoWeeksAgo).toBe(true);
            expect(operation.createdAt <= NOW.toISOString()).toBe(true);
            if (operation.paidAt) expect(operation.paidAt >= operation.createdAt).toBe(true);
        }
    });
});

describe('operationsStore.seedIfEmpty', () => {
    beforeEach(() => {
        useOperationsStore.setState(useOperationsStore.getInitialState(), true);
    });

    it('carga los datos de ejemplo solo la primera vez', () => {
        useOperationsStore.getState().seedIfEmpty(NOW);
        const count = useOperationsStore.getState().operations.length;
        expect(count).toBeGreaterThan(0);
        expect(useOperationsStore.getState().seeded).toBe(true);
        useOperationsStore.getState().seedIfEmpty(NOW);
        expect(useOperationsStore.getState().operations).toHaveLength(count);
    });

    it('no vuelve a sembrar si el usuario borró todo', () => {
        useOperationsStore.setState({ seeded: true, operations: [] });
        useOperationsStore.getState().seedIfEmpty(NOW);
        expect(useOperationsStore.getState().operations).toHaveLength(0);
    });

    it('el siguiente pago continúa la numeración', () => {
        const store = useOperationsStore.getState();
        store.seedIfEmpty(NOW);
        const { receiptCounter } = useOperationsStore.getState();
        const op = store.addOperation({ type: 'import', description: 'Nueva', categoryId: 'cat-libros', value: 50, freight: 5, insurance: 0 }, 0, DEFAULT_SETTINGS);
        store.payOperation(op.id);
        expect(useOperationsStore.getState().operations.find((o) => o.id === op.id)?.receiptNumber).toBe(`ADU-${String(receiptCounter + 1).padStart(6, '0')}`);
    });
});
