import { Text, View } from 'react-native';
import { ChartCard } from '@/components/(Views)/Home/ChartCard';
import { TRANSPORT_LABELS, TRANSPORT_MODES } from '@/constants/labels';
import type { TransportMode } from '@/types/operation';

type TypeSplitBarProps = {
    importCount: number;
    exportCount: number;
    transportCounts: Record<TransportMode, number>;
};

type Segment = { key: string; label: string; count: number; color: string };

// Paleta categorica validada (daltonismo): azul, celeste y violeta. Siempre con leyenda.
const TRANSPORT_COLORS: Record<TransportMode, string> = { sea: 'bg-primario', air: 'bg-acento', land: 'bg-violeta' };

function StackedBar({ segments }: { segments: Segment[] }) {
    const total = segments.reduce((sum, segment) => sum + segment.count, 0);
    return (
        <View className="h-3 flex-row gap-0.5 overflow-hidden rounded-full bg-fondo3">
            {segments
                .filter((segment) => segment.count > 0)
                .map((segment) => (
                    <View key={segment.key} style={{ flex: segment.count / total }} className={`rounded-full ${segment.color}`} />
                ))}
        </View>
    );
}

function Legend({ segments, vertical = false }: { segments: Segment[]; vertical?: boolean }) {
    return (
        <View className={vertical ? 'gap-1' : 'flex-row flex-wrap gap-x-3 gap-y-1'}>
            {segments.map((segment) => (
                <View key={segment.key} className="flex-row items-center gap-1.5">
                    <View className={`h-2.5 w-2.5 rounded-full ${segment.color}`} />
                    <Text className="text-xs text-texto2">
                        {segment.label} <Text className="font-semibold text-texto1">{segment.count}</Text>
                    </Text>
                </View>
            ))}
        </View>
    );
}

/** Barra apilada: operaciones por transporte, con leyenda. */
export function TypeSplitBar({ importCount, exportCount, transportCounts }: TypeSplitBarProps) {
    const total = importCount + exportCount;
    const byTransport: Segment[] = TRANSPORT_MODES.map((mode) => ({
        key: mode,
        label: TRANSPORT_LABELS[mode],
        count: transportCounts[mode],
        color: TRANSPORT_COLORS[mode],
    }));

    return (
        <ChartCard title="Operaciones" value={String(total)} detail="por transporte" className="flex-1">
            <StackedBar segments={byTransport} />
            <Legend segments={byTransport} vertical />
        </ChartCard>
    );
}
