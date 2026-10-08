import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { filterOperations } from '@/services/operations/filters';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import type { Operation } from '@/types/operation';

function seed(): Operation[] {
    useOperationsStore.setState(useOperationsStore.getInitialState(), true);
    const store = useOperationsStore.getState();
    const base = { type: 'import' as const, categoryId: 'cat-electronica', value: 300, freight: 30, insurance: 10 };
    store.addOperation({ ...base, description: 'Teléfono Samsung' }, 5, DEFAULT_SETTINGS);
    const paid = store.addOperation({ ...base, description: 'Cámara' }, 5, DEFAULT_SETTINGS);
    const released = store.addOperation({ ...base, description: 'Laptop' }, 5, DEFAULT_SETTINGS);
    store.payOperation(paid.id);
    store.payOperation(released.id);
    store.releaseOperation(released.id);
    return useOperationsStore.getState().operations;
}

describe('filterOperations', () => {
    it('sin filtros devuelve todo en el mismo orden', () => {
        const operations = seed();
        expect(filterOperations(operations, { query: '', status: 'all' })).toEqual(operations);
    });

    it('filtra por estado', () => {
        const operations = seed();
        expect(filterOperations(operations, { query: '', status: 'paid' }).map((o) => o.description)).toEqual(['Cámara']);
        expect(filterOperations(operations, { query: '', status: 'pending' }).map((o) => o.description)).toEqual(['Teléfono Samsung']);
    });

    it('busca por descripción sin acentos y por número de comprobante', () => {
        const operations = seed();
        expect(filterOperations(operations, { query: 'camara', status: 'all' }).map((o) => o.description)).toEqual(['Cámara']);
        expect(filterOperations(operations, { query: 'ADU-000002', status: 'all' }).map((o) => o.description)).toEqual(['Laptop']);
    });

    it('combina búsqueda y estado', () => {
        const operations = seed();
        expect(filterOperations(operations, { query: 'laptop', status: 'paid' })).toEqual([]);
        expect(filterOperations(operations, { query: 'laptop', status: 'released' })).toHaveLength(1);
    });
});
