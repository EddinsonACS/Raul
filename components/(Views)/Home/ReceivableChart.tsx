import { Text, View } from 'react-native';
import { ChartCard } from '@/components/(Views)/Home/ChartCard';
import type { PendingBar } from '@/services/operations/charts';
import type { Money } from '@/types/operation';
import { formatBs, formatUsd } from '@/utils/format';

type ReceivableChartProps = {
    receivable: Money;
    bars: PendingBar[];
    pendingCount: number;
};

/** Barras horizontales: las operaciones pendientes con mayor monto. */
export function ReceivableChart({ receivable, bars, pendingCount }: ReceivableChartProps) {
    const max = bars[0]?.usd ?? 0;
    const rest = pendingCount - bars.length;

    return (
        <ChartCard title="Por cobrar" value={formatUsd(receivable.usd)} detail={formatBs(receivable.bs)}>
            {bars.length === 0 ? (
                <Text className="text-xs text-texto2">No hay operaciones pendientes de pago.</Text>
            ) : (
                <View className="gap-2.5">
                    {bars.map((bar) => (
                        <View key={bar.id} className="gap-1">
                            <View className="flex-row justify-between gap-3">
                                <Text className="flex-1 text-xs text-texto1" numberOfLines={1}>
                                    {bar.description}
                                </Text>
                                <Text className="text-xs font-semibold text-texto1">{formatUsd(bar.usd)}</Text>
                            </View>
                            <View className="h-2 overflow-hidden rounded-full bg-fondo3">
                                <View className="h-full rounded-full bg-amarillo" style={{ width: `${max === 0 ? 0 : (bar.usd / max) * 100}%` }} />
                            </View>
                        </View>
                    ))}
                    {rest > 0 ? <Text className="text-xs text-texto2">y {rest} más</Text> : null}
                </View>
            )}
        </ChartCard>
    );
}
