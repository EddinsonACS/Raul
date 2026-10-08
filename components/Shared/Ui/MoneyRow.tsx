import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { Money } from '@/types/operation';
import { formatBs, formatUsd } from '@/utils/format';

type MoneyRowProps = {
    label: string;
    amount: Money;
    strong?: boolean;
    note?: string;
    /** Elemento junto a la etiqueta, por ejemplo un tooltip. */
    accessory?: ReactNode;
};

export function MoneyRow({ label, amount, strong = false, note, accessory }: MoneyRowProps) {
    return (
        <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
                <View className="flex-row items-center gap-1.5">
                    <Text className={`text-base text-texto1 ${strong ? 'font-bold' : ''}`}>{label}</Text>
                    {accessory}
                </View>
                {note ? <Text className="text-xs text-verde">{note}</Text> : null}
            </View>
            <View className="items-end">
                <Text className={`text-base text-texto1 ${strong ? 'text-lg font-bold' : ''}`}>{formatUsd(amount.usd)}</Text>
                <Text className="text-xs text-texto2">{formatBs(amount.bs)}</Text>
            </View>
        </View>
    );
}
