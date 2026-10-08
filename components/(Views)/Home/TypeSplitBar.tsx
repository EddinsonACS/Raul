import { Text, View } from 'react-native';
import { ChartCard } from '@/components/(Views)/Home/ChartCard';

type TypeSplitBarProps = {
    importCount: number;
    exportCount: number;
};

function Legend({ color, label, count }: { color: string; label: string; count: number }) {
    return (
        <View className="flex-row items-center gap-1.5">
            <View className={`h-2.5 w-2.5 rounded-full ${color}`} />
            <Text className="text-xs text-texto2">
                {label} <Text className="font-semibold text-texto1">{count}</Text>
            </Text>
        </View>
    );
}

/** Barra apilada: cuantas operaciones son importacion y cuantas exportacion. */
export function TypeSplitBar({ importCount, exportCount }: TypeSplitBarProps) {
    const total = importCount + exportCount;
    const importShare = total === 0 ? 0 : importCount / total;

    return (
        <ChartCard title="Operaciones" value={String(total)} detail="registradas" className="flex-1">
            <View className="h-3 flex-row gap-0.5 overflow-hidden rounded-full bg-fondo3">
                {importCount > 0 ? <View style={{ flex: importShare }} className="rounded-full bg-primario" /> : null}
                {exportCount > 0 ? <View style={{ flex: 1 - importShare }} className="rounded-full bg-acento" /> : null}
            </View>
            <View className="gap-1">
                <Legend color="bg-primario" label="Importación" count={importCount} />
                <Legend color="bg-acento" label="Exportación" count={exportCount} />
            </View>
        </ChartCard>
    );
}
