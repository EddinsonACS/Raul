import { Text, View } from 'react-native';

type KpiCardProps = {
    label: string;
    value: string;
    detail: string;
};

export function KpiCard({ label, value, detail }: KpiCardProps) {
    return (
        <View className="flex-1 gap-1 rounded-2xl border border-borde bg-tarjeta p-4">
            <Text className="text-xs font-semibold uppercase text-texto2">{label}</Text>
            <Text className="text-xl font-bold text-texto1" numberOfLines={1} adjustsFontSizeToFit>
                {value}
            </Text>
            <Text className="text-xs text-texto2" numberOfLines={1}>
                {detail}
            </Text>
        </View>
    );
}
