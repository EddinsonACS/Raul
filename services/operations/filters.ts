import type { Operation, OperationStatus, OperationType, TransportMode } from '@/types/operation';
import { matchesQuery } from '@/utils/text';

export type StatusFilter = OperationStatus | 'all';
export type TypeFilter = OperationType | 'all';
export type TransportFilter = TransportMode | 'all';

export type OperationFilters = {
    query: string;
    status: StatusFilter;
    type: TypeFilter;
    transport: TransportFilter;
};

export const EMPTY_FILTERS: OperationFilters = { query: '', status: 'all', type: 'all', transport: 'all' };

export function filterOperations(operations: Operation[], { query, status, type, transport }: OperationFilters): Operation[] {
    return operations.filter((operation) => {
        if (status !== 'all' && operation.status !== status) return false;
        if (type !== 'all' && operation.type !== type) return false;
        if (transport !== 'all' && operation.transport !== transport) return false;
        return matchesQuery(operation.description, query) || matchesQuery(operation.receiptNumber ?? '', query);
    });
}
