import type { Operation, OperationStatus } from '@/types/operation';
import { matchesQuery } from '@/utils/text';

export type StatusFilter = OperationStatus | 'all';

export type OperationFilters = {
    query: string;
    status: StatusFilter;
};

export function filterOperations(operations: Operation[], { query, status }: OperationFilters): Operation[] {
    return operations.filter((operation) => {
        if (status !== 'all' && operation.status !== status) return false;
        return matchesQuery(operation.description, query) || matchesQuery(operation.receiptNumber ?? '', query);
    });
}
