import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { summarizeOperations } from '@/services/operations/summary';
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

beforeEach(() => {
    useOperationsStore.setState(useOperationsStore.getInitialState(), true);
});

describe('summarizeOperations', () => {
    it('devuelve ceros sin operaciones', () => {
        expect(summarizeOperations([])).toEqual({ pendingCount: 0, collected: { usd: 0, bs: 0 } });
    });

    it('cuenta pendientes y suma lo pagado y lo liberado', () => {
        const store = useOperationsStore.getState();
        store.addOperation(INPUT, 5, DEFAULT_SETTINGS);
        const paid = store.addOperation(INPUT, 5, DEFAULT_SETTINGS);
        const released = store.addOperation(INPUT, 5, DEFAULT_SETTINGS);
        store.payOperation(paid.id);
        store.payOperation(released.id);
        store.releaseOperation(released.id);

        expect(summarizeOperations(useOperationsStore.getState().operations)).toEqual({
            pendingCount: 1,
            collected: { usd: 148.24, bs: 133416 },
        });
    });
});
