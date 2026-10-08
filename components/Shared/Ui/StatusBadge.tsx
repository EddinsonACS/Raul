import { Text, View } from 'react-native';
import { STATUS_LABELS } from '@/constants/labels';
import type { OperationStatus } from '@/types/operation';

const TONE: Record<OperationStatus, { dot: string; text: string; bg: string }> = {
    pending: { dot: 'bg-amarillo', text: 'text-amarillo', bg: 'bg-amarillo/15' },
    paid: { dot: 'bg-primario', text: 'text-primario', bg: 'bg-primario/15' },
    released: { dot: 'bg-verde', text: 'text-verde', bg: 'bg-verde/15' },
};

export function StatusBadge({ status }: { status: OperationStatus }) {
    const tone = TONE[status];
    return (
        <View className={`flex-row items-center gap-1.5 self-start rounded-full px-2.5 py-1 ${tone.bg}`}>
            <View className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
            <Text className={`text-xs font-semibold ${tone.text}`}>{STATUS_LABELS[status]}</Text>
        </View>
    );
}
