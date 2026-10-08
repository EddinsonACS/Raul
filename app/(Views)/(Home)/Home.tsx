import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { OperationRow } from '@/components/(Views)/History/OperationRow';
import { KpiCard } from '@/components/Shared/Ui/KpiCard';
import { Button } from '@/components/Shared/Button';
import { Screen } from '@/components/Shared/Screen';
import { summarizeOperations } from '@/services/operations/summary';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { formatBs, formatUsd } from '@/utils/format';
import { goToTab } from '@/utils/navigation';

const RECENT_COUNT = 3;

export default function Home() {
    const router = useRouter();
    const operations = useOperationsStore((state) => state.operations);
    const categories = useRatesStore((state) => state.categories);
    const exchangeRate = useRatesStore((state) => state.settings.exchangeRate);
    const summary = summarizeOperations(operations);
    const recent = operations.slice(0, RECENT_COUNT);

    const categoryName = (id: string) => categories.find((item) => item.id === id)?.name ?? 'Sin categoría';

    return (
        <Screen title="Aduanas" icon="cube">
            <View className="gap-1 rounded-2xl bg-primario p-4">
                <Text className="text-xs font-semibold uppercase text-white">Tasa del día</Text>
                <Text className="text-3xl font-bold text-white">{formatBs(exchangeRate)}</Text>
                <Text className="text-sm text-white">por $1.00</Text>
            </View>

            <View className="flex-row gap-3">
                <KpiCard
                    label="Recaudado"
                    value={formatUsd(summary.collected.usd)}
                    detail={formatBs(summary.collected.bs)}
                    icon="wallet"
                    tone="success"
                />
                <KpiCard
                    label="Por cobrar"
                    value={formatUsd(summary.receivable.usd)}
                    detail={formatBs(summary.receivable.bs)}
                    icon="banknote"
                    tone="warning"
                />
            </View>

            <View className="flex-row gap-3">
                <KpiCard label="Pendientes" value={String(summary.pendingCount)} detail="operaciones sin pagar" icon="receipt" />
                <KpiCard
                    label="Operaciones"
                    value={String(summary.totalCount)}
                    detail={`${summary.importCount} import. · ${summary.exportCount} export.`}
                    icon="trending-up"
                />
            </View>

            <Button label="Nueva cotización" onPress={() => goToTab(router, '/Quote')} />

            <Text className="pt-2 text-sm font-semibold uppercase text-texto2">Últimas operaciones</Text>
            {recent.length === 0 ? (
                <Text className="text-sm text-texto2">Todavía no hay operaciones registradas.</Text>
            ) : (
                <>
                    {recent.map((operation) => (
                        <OperationRow
                            key={operation.id}
                            operation={operation}
                            categoryName={categoryName(operation.categoryId)}
                            onPress={() => router.push({ pathname: '/OperationDetail', params: { id: operation.id } })}
                        />
                    ))}
                    <Button label="Ver todo el historial" variant="secondary" onPress={() => goToTab(router, '/History')} />
                </>
            )}
        </Screen>
    );
}
