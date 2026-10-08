import { Pressable, Text, View } from 'react-native';
import { StatusBadge } from '@/components/Shared/Ui/StatusBadge';
import { TYPE_LABELS } from '@/constants/labels';
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
            className="gap-2 rounded-2xl border border-borde bg-tarjeta p-4"
        >
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                    <Text className="text-base font-semibold text-texto1" numberOfLines={1}>
                        {operation.description}
                    </Text>
                    <Text className="text-sm text-texto2">
                        {TYPE_LABELS[operation.type]} · {categoryName}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-base font-bold text-texto1">{formatUsd(operation.breakdown.total.usd)}</Text>
                    <Text className="text-sm text-texto2">{formatBs(operation.breakdown.total.bs)}</Text>
                </View>
            </View>
            <View className="flex-row items-center justify-between">
                <StatusBadge status={operation.status} />
                <Text className="text-xs text-texto2">{formatDate(operation.createdAt)}</Text>
            </View>
        </Pressable>
    );
}
