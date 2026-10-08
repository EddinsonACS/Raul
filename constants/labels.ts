import type { IconName } from '@/components/Shared/Ui/Icon';
import type { OperationStatus, OperationType, TransportMode } from '@/types/operation';

export const TYPE_LABELS: Record<OperationType, string> = {
    import: 'Importación',
    export: 'Exportación',
};

export const STATUS_LABELS: Record<OperationStatus, string> = {
    pending: 'Pendiente',
    paid: 'Pagada',
    released: 'Liberada',
};

export const TRANSPORT_MODES: TransportMode[] = ['sea', 'air', 'land'];

export const TRANSPORT_LABELS: Record<TransportMode, string> = {
    sea: 'Marítimo',
    air: 'Aéreo',
    land: 'Terrestre',
};

export const TRANSPORT_ICONS: Record<TransportMode, IconName> = {
    sea: 'ship',
    air: 'plane',
    land: 'truck',
};
