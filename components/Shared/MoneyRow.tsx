import { Text, View } from 'react-native';
import type { Money } from '@/types/operation';
import { formatBs, formatUsd } from '@/utils/format';

type MoneyRowProps = {
    label: string;
    amount: Money;
    strong?: boolean;
    note?: string;
};

export function MoneyRow({ label, amount, strong = false, note }: MoneyRowProps) {
    return (
        <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
                <Text className={`text-base text-texto1 ${strong ? 'font-bold' : ''}`}>{label}</Text>
                {note ? <Text className="text-sm text-verde">{note}</Text> : null}
            </View>
            <View className="items-end">
                <Text className={`text-base text-texto1 ${strong ? 'font-bold' : ''}`}>{formatUsd(amount.usd)}</Text>
                <Text className="text-sm text-texto2">{formatBs(amount.bs)}</Text>
            </View>
        </View>
    );
}
