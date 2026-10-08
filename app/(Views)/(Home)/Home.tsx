import { useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { CollectedChart } from '@/components/(Views)/Home/CollectedChart';
import { PendingRing } from '@/components/(Views)/Home/PendingRing';
import { RateCard } from '@/components/(Views)/Home/RateCard';
import { ReceivableChart } from '@/components/(Views)/Home/ReceivableChart';
import { TypeSplitBar } from '@/components/(Views)/Home/TypeSplitBar';
import { OperationRow } from '@/components/(Views)/History/OperationRow';
import { Screen } from '@/components/Layout/Screen';
import { IconButton } from '@/components/Shared/Buttons/IconButton';
import { EmptyState } from '@/components/Shared/Feedback/EmptyState';
import { collectedByDay, pendingBars } from '@/services/operations/charts';
import { summarizeOperations } from '@/services/operations/summary';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { goToTab } from '@/utils/navigation';

const RECENT_COUNT = 3;
const PENDING_BARS = 4;
const CHART_DAYS = 7;

export default function Home() {
    const router = useRouter();
    const operations = useOperationsStore((state) => state.operations);
    const categories = useRatesStore((state) => state.categories);
    const exchangeRate = useRatesStore((state) => state.settings.exchangeRate);

    const summary = summarizeOperations(operations);
    const days = useMemo(() => collectedByDay(operations, CHART_DAYS, new Date()), [operations]);
    const bars = useMemo(() => pendingBars(operations, PENDING_BARS), [operations]);
    const recent = operations.slice(0, RECENT_COUNT);

    const categoryName = (id: string) => categories.find((item) => item.id === id)?.name ?? 'Sin categoría';
    const openSettings = () => router.push('/Settings');

    return (
        <Screen title="Aduanas" showLogo actions={<IconButton icon="settings" label="Ajustes" onPress={openSettings} />}>
            <RateCard exchangeRate={exchangeRate} onPress={openSettings} />

            <Animated.View entering={FadeInDown.duration(320)} className="flex-row gap-3">
                <PendingRing pending={summary.pendingCount} total={summary.totalCount} />
                <TypeSplitBar importCount={summary.importCount} exportCount={summary.exportCount} transportCounts={summary.transportCounts} />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(320).delay(80)}>
                <CollectedChart collected={summary.collected} days={days} />
            </Animated.View>
            <Animated.View entering={FadeInDown.duration(320).delay(160)}>
                <ReceivableChart receivable={summary.receivable} bars={bars} pendingCount={summary.pendingCount} />
            </Animated.View>

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
                recent.map((operation, index) => (
                    <Animated.View key={operation.id} entering={FadeInDown.duration(320).delay(240 + index * 60)}>
                        <OperationRow
                            operation={operation}
                            categoryName={categoryName(operation.categoryId)}
                            onPress={() => router.push({ pathname: '/OperationDetail', params: { id: operation.id } })}
                        />
                    </Animated.View>
                ))
            )}
        </Screen>
    );
}
