import type { OperationStatus, OperationType } from '@/types/operation';

export const TYPE_LABELS: Record<OperationType, string> = {
    import: 'Importación',
    export: 'Exportación',
};

export const STATUS_LABELS: Record<OperationStatus, string> = {
    pending: 'Pendiente',
    paid: 'Pagada',
    released: 'Liberada',
};
