import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { QuickActions } from '@/components/(Views)/Home/QuickActions';
import { RateCard } from '@/components/(Views)/Home/RateCard';
import { OperationRow } from '@/components/(Views)/History/OperationRow';
import { Screen } from '@/components/Layout/Screen';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { IconButton } from '@/components/Shared/Buttons/IconButton';
import { EmptyState } from '@/components/Shared/Feedback/EmptyState';
import { KpiCard } from '@/components/Shared/Ui/KpiCard';
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
    const openSettings = () => router.push('/Settings');

    return (
        <Screen title="Aduanas" showLogo actions={<IconButton icon="settings" label="Ajustes" onPress={openSettings} />}>
            <RateCard exchangeRate={exchangeRate} onPress={openSettings} />

            <Animated.View entering={FadeInDown.duration(320)} className="flex-row gap-3">
                <KpiCard label="Recaudado" value={formatUsd(summary.collected.usd)} detail={formatBs(summary.collected.bs)} icon="wallet" tone="success" />
                <KpiCard label="Por cobrar" value={formatUsd(summary.receivable.usd)} detail={formatBs(summary.receivable.bs)} icon="banknote" tone="warning" />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(320).delay(80)} className="flex-row gap-3">
                <KpiCard label="Pendientes" value={String(summary.pendingCount)} detail="operaciones sin pagar" icon="receipt" />
                <KpiCard
                    label="Operaciones"
                    value={String(summary.totalCount)}
                    detail={`${summary.importCount} import. · ${summary.exportCount} export.`}
                    icon="trending-up"
                />
            </Animated.View>

            <QuickActions
                actions={[
                    { label: 'Cotizar', icon: 'calculator', onPress: () => goToTab(router, '/Quote') },
                    { label: 'Categorías', icon: 'tags', onPress: () => goToTab(router, '/Categories') },
                    { label: 'Historial', icon: 'history', onPress: () => goToTab(router, '/History') },
                ]}
            />

            <View className="flex-row items-end justify-between pt-2">
                <Text className="text-xs font-semibold uppercase tracking-wider text-texto2">Últimas operaciones</Text>
                {operations.length > RECENT_COUNT ? (
                    <Text className="text-xs font-semibold text-primario" onPress={() => goToTab(router, '/History')}>
                        Ver todas
                    </Text>
                ) : null}
            </View>
            {recent.length === 0 ? (
                <EmptyState
                    icon="inbox"
                    title="Sin operaciones todavía"
                    subtitle="Cotiza una importación o exportación para empezar."
                    action={{ label: 'Nueva cotización', icon: 'calculator', onPress: () => goToTab(router, '/Quote') }}
                />
            ) : (
                <>
                    {recent.map((operation, index) => (
                        <Animated.View key={operation.id} entering={FadeInDown.duration(320).delay(160 + index * 60)}>
                            <OperationRow
                                operation={operation}
                                categoryName={categoryName(operation.categoryId)}
                                onPress={() => router.push({ pathname: '/OperationDetail', params: { id: operation.id } })}
                            />
                        </Animated.View>
                    ))}
                    <ActionButton label="Nueva cotización" icon="calculator" onPress={() => goToTab(router, '/Quote')} />
                </>
            )}
        </Screen>
    );
}
