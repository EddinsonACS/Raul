import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { EMPTY_FILTERS, filterOperations } from '@/services/operations/filters';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import type { Operation } from '@/types/operation';

function seed(): Operation[] {
    useOperationsStore.setState(useOperationsStore.getInitialState(), true);
    const store = useOperationsStore.getState();
    const base = { type: 'import' as const, transport: 'sea' as const, categoryId: 'cat-electronica', value: 300, freight: 30, insurance: 10 };
    store.addOperation({ ...base, description: 'Teléfono Samsung', transport: 'air' }, 5, DEFAULT_SETTINGS);
    const paid = store.addOperation({ ...base, description: 'Cámara' }, 5, DEFAULT_SETTINGS);
    const released = store.addOperation({ ...base, description: 'Laptop', type: 'export', transport: 'land' }, 5, DEFAULT_SETTINGS);
    store.payOperation(paid.id);
    store.payOperation(released.id);
    store.releaseOperation(released.id);
    return useOperationsStore.getState().operations;
}

const names = (operations: Operation[]) => operations.map((o) => o.description);

describe('filterOperations', () => {
    it('sin filtros devuelve todo en el mismo orden', () => {
        const operations = seed();
        expect(filterOperations(operations, EMPTY_FILTERS)).toEqual(operations);
    });

    it('filtra por estado', () => {
        const operations = seed();
        expect(names(filterOperations(operations, { ...EMPTY_FILTERS, status: 'paid' }))).toEqual(['Cámara']);
        expect(names(filterOperations(operations, { ...EMPTY_FILTERS, status: 'pending' }))).toEqual(['Teléfono Samsung']);
    });

    it('filtra por tipo y por transporte', () => {
        const operations = seed();
        expect(names(filterOperations(operations, { ...EMPTY_FILTERS, type: 'export' }))).toEqual(['Laptop']);
        expect(names(filterOperations(operations, { ...EMPTY_FILTERS, type: 'import' }))).toEqual(['Cámara', 'Teléfono Samsung']);
        expect(names(filterOperations(operations, { ...EMPTY_FILTERS, transport: 'air' }))).toEqual(['Teléfono Samsung']);
        expect(names(filterOperations(operations, { ...EMPTY_FILTERS, transport: 'sea' }))).toEqual(['Cámara']);
    });

    it('busca por descripción sin acentos y por número de comprobante', () => {
        const operations = seed();
        expect(names(filterOperations(operations, { ...EMPTY_FILTERS, query: 'camara' }))).toEqual(['Cámara']);
        expect(names(filterOperations(operations, { ...EMPTY_FILTERS, query: 'ADU-000002' }))).toEqual(['Laptop']);
    });

    it('combina búsqueda, estado, tipo y transporte', () => {
        const operations = seed();
        expect(filterOperations(operations, { query: 'laptop', status: 'paid', type: 'all', transport: 'all' })).toEqual([]);
        expect(filterOperations(operations, { query: 'laptop', status: 'released', type: 'export', transport: 'land' })).toHaveLength(1);
        expect(filterOperations(operations, { query: 'laptop', status: 'released', type: 'export', transport: 'sea' })).toEqual([]);
    });
});
