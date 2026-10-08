import { Text, View } from 'react-native';
import { STATUS_LABELS } from '@/constants/labels';
import type { OperationStatus } from '@/types/operation';

const BACKGROUND: Record<OperationStatus, string> = {
    pending: 'bg-amarillo',
    paid: 'bg-primario',
    released: 'bg-verde',
};

export function StatusBadge({ status }: { status: OperationStatus }) {
    return (
        <View className={`self-start rounded-full px-3 py-1 ${BACKGROUND[status]}`}>
            <Text className="text-xs font-semibold text-white">{STATUS_LABELS[status]}</Text>
        </View>
    );
}
