import { Text, View } from 'react-native';
import { ChartCard } from '@/components/(Views)/Home/ChartCard';
import type { DayAmount } from '@/services/operations/charts';
import type { Money } from '@/types/operation';
import { formatBs, formatUsd } from '@/utils/format';

type CollectedChartProps = {
    collected: Money;
    days: DayAmount[];
};

const CHART_HEIGHT = 72;

/** Barras verticales: lo cobrado cada uno de los ultimos dias. */
export function CollectedChart({ collected, days }: CollectedChartProps) {
    const max = Math.max(...days.map((day) => day.usd), 0);
    const weekTotal = days.reduce((sum, day) => sum + day.usd, 0);

    return (
        <ChartCard title="Recaudado" value={formatUsd(collected.usd)} detail={formatBs(collected.bs)}>
            <View className="flex-row items-end gap-2" style={{ height: CHART_HEIGHT }}>
                {days.map((day, index) => {
                    const height = max === 0 ? 0 : Math.max(4, (day.usd / max) * CHART_HEIGHT);
                    return (
                        <View key={index} className="flex-1 items-center justify-end" style={{ height: CHART_HEIGHT }}>
                            <View className="w-full rounded-t-md bg-fondo3" style={{ height: CHART_HEIGHT }} />
                            <View
                                className={`absolute bottom-0 w-full rounded-t-md ${day.isToday ? 'bg-primario' : 'bg-primario/55'}`}
                                style={{ height }}
                            />
                        </View>
                    );
                })}
            </View>
            <View className="flex-row gap-2">
                {days.map((day, index) => (
                    <Text key={index} className={`flex-1 text-center text-[11px] ${day.isToday ? 'font-semibold text-texto1' : 'text-texto2'}`}>
                        {day.label}
                    </Text>
                ))}
            </View>
            <Text className="text-xs text-texto2">Últimos 7 días: {formatUsd(weekTotal)}</Text>
        </ChartCard>
    );
}
