import { Pressable, Text, View } from 'react-native';
import { COLORS } from '@/Shared/Global/colors';
import { Icon } from '@/components/Shared/Ui/Icon';
import { StatusBadge } from '@/components/Shared/Ui/StatusBadge';
import { TRANSPORT_ICONS, TRANSPORT_LABELS, TYPE_LABELS } from '@/constants/labels';
import type { Operation } from '@/types/operation';
import { formatBs, formatDate, formatUsd } from '@/utils/format';

type OperationRowProps = {
    operation: Operation;
    categoryName: string;
    onPress: () => void;
};

export function OperationRow({ operation, categoryName, onPress }: OperationRowProps) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${operation.description}, ${TYPE_LABELS[operation.type]} ${TRANSPORT_LABELS[operation.transport].toLowerCase()}`}
            className="gap-3 rounded-3xl border border-borde bg-fondo2 p-4 active:opacity-80"
        >
            <View className="flex-row items-center gap-3">
                <View className="h-10 w-10 items-center justify-center rounded-2xl bg-fondo3">
                    <Icon name={TRANSPORT_ICONS[operation.transport]} size={18} color={COLORS.texto1} />
                </View>
                <View className="flex-1">
                    <Text className="text-base font-semibold text-texto1" numberOfLines={1}>
                        {operation.description}
                    </Text>
                    <Text className="text-xs text-texto2" numberOfLines={1}>
                        {TYPE_LABELS[operation.type]} · {TRANSPORT_LABELS[operation.transport]} · {categoryName}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-base font-bold text-texto1">{formatUsd(operation.breakdown.total.usd)}</Text>
                    <Text className="text-xs text-texto2">{formatBs(operation.breakdown.total.bs)}</Text>
                </View>
            </View>
            <View className="flex-row items-center justify-between">
                <StatusBadge status={operation.status} />
                <Text className="text-xs text-texto2">{formatDate(operation.createdAt)}</Text>
            </View>
        </Pressable>
    );
}
