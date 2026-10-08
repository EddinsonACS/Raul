import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { collectedByDay, pendingBars } from '@/services/operations/charts';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import type { Operation } from '@/types/operation';

const INPUT = { type: 'import' as const, categoryId: 'cat-electronica', value: 300, freight: 30, insurance: 10 };

function seed(): Operation[] {
    useOperationsStore.setState(useOperationsStore.getInitialState(), true);
    const store = useOperationsStore.getState();
    store.addOperation({ ...INPUT, description: 'Pendiente chica', value: 100 }, 5, DEFAULT_SETTINGS);
    store.addOperation({ ...INPUT, description: 'Pendiente grande', value: 900 }, 5, DEFAULT_SETTINGS);
    const paid = store.addOperation({ ...INPUT, description: 'Pagada hoy' }, 5, DEFAULT_SETTINGS);
    store.payOperation(paid.id);
    return useOperationsStore.getState().operations;
}

describe('collectedByDay', () => {
    it('devuelve siete días terminando hoy, con lo pagado cada día', () => {
        const operations = seed();
        const now = new Date();
        const days = collectedByDay(operations, 7, now);
        expect(days).toHaveLength(7);
        expect(days.slice(0, 6).every((day) => day.usd === 0)).toBe(true);
        expect(days[6].usd).toBe(74.12);
        expect(days[6].label).toHaveLength(2);
    });

    it('ignora las pendientes y suma varias del mismo día', () => {
        const operations = seed();
        const twice = operations.map((operation) => (operation.status === 'paid' ? { ...operation, id: 'copy' } : operation));
        const days = collectedByDay([...operations, ...twice], 7, new Date());
        expect(days[6].usd).toBe(148.24);
    });

    it('sin operaciones devuelve ceros', () => {
        expect(collectedByDay([], 7, new Date()).map((day) => day.usd)).toEqual([0, 0, 0, 0, 0, 0, 0]);
    });
});

describe('pendingBars', () => {
    it('lista las pendientes de mayor a menor, hasta el máximo', () => {
        const operations = seed();
        const bars = pendingBars(operations, 1);
        expect(bars).toHaveLength(1);
        expect(bars[0].description).toBe('Pendiente grande');
        expect(pendingBars(operations, 5).map((bar) => bar.description)).toEqual(['Pendiente grande', 'Pendiente chica']);
    });
});
