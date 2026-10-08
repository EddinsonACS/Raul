import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import type { OperationInput } from '@/types/operation';

const INPUT: OperationInput = {
    type: 'import',
    description: 'Teléfono',
    categoryId: 'cat-electronica',
    value: 300,
    freight: 30,
    insurance: 10,
};

const store = () => useOperationsStore.getState();
const add = () => store().addOperation(INPUT, 5, DEFAULT_SETTINGS);

beforeEach(() => {
    useOperationsStore.setState(useOperationsStore.getInitialState(), true);
});

describe('operationsStore', () => {
    it('registra una operación pendiente con su desglose y su tasa', () => {
        const operation = add();
        expect(operation.status).toBe('pending');
        expect(operation.receiptNumber).toBeNull();
        expect(operation.paidAt).toBeNull();
        expect(operation.exchangeRate).toBe(900);
        expect(operation.breakdown.total).toEqual({ usd: 74.12, bs: 66708 });
        expect(store().operations).toEqual([operation]);
    });

    it('pone las operaciones nuevas primero', () => {
        const first = add();
        const second = add();
        expect(store().operations.map((o) => o.id)).toEqual([second.id, first.id]);
    });

    it('paga una operación pendiente y le asigna comprobante', () => {
        const { id } = add();
        expect(store().payOperation(id)).toBe(true);
        const paid = store().operations[0];
        expect(paid.status).toBe('paid');
        expect(paid.receiptNumber).toBe('ADU-000001');
        expect(paid.paidAt).not.toBeNull();
    });

    it('no paga dos veces ni salta el consecutivo', () => {
        const first = add();
        expect(store().payOperation(first.id)).toBe(true);
        expect(store().payOperation(first.id)).toBe(false);
        expect(store().receiptCounter).toBe(1);

        const second = add();
        store().payOperation(second.id);
        expect(store().operations.find((o) => o.id === second.id)?.receiptNumber).toBe('ADU-000002');
    });

    it('libera solo una operación pagada', () => {
        const { id } = add();
        expect(store().releaseOperation(id)).toBe(false);
        store().payOperation(id);
        expect(store().releaseOperation(id)).toBe(true);
        expect(store().operations[0].status).toBe('released');
        expect(store().releaseOperation(id)).toBe(false);
    });

    it('elimina solo una operación pendiente', () => {
        const pending = add();
        const paid = add();
        store().payOperation(paid.id);
        expect(store().removeOperation(paid.id)).toBe(false);
        expect(store().removeOperation(pending.id)).toBe(true);
        expect(store().operations.map((o) => o.id)).toEqual([paid.id]);
    });

    it('devuelve false con un id que no existe', () => {
        expect(store().payOperation('nope')).toBe(false);
        expect(store().releaseOperation('nope')).toBe(false);
        expect(store().removeOperation('nope')).toBe(false);
    });

    it('conserva los montos aunque la tasa cambie antes de pagar', () => {
        const first = add();
        const second = store().addOperation(INPUT, 5, { ...DEFAULT_SETTINGS, exchangeRate: 950 });
        store().payOperation(first.id);
        const stored = store().operations.find((o) => o.id === first.id);
        expect(stored?.exchangeRate).toBe(900);
        expect(stored?.breakdown.total.bs).toBe(66708);
        expect(second.breakdown.total.bs).toBe(70414);
    });
});
