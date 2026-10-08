import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { BreakdownCard } from '@/components/(Views)/Quote/BreakdownCard';
import { Screen } from '@/components/Layout/Screen';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { OperationMissing } from '@/components/Shared/Feedback/OperationMissing';
import { Card } from '@/components/Shared/Ui/Card';
import { Icon } from '@/components/Shared/Ui/Icon';
import { StatusBadge } from '@/components/Shared/Ui/StatusBadge';
import { TYPE_LABELS } from '@/constants/labels';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { formatDate } from '@/utils/format';
import { goToTab } from '@/utils/navigation';
import { BRAND, COLORS } from '@/Shared/Global/colors';

function Line({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row justify-between gap-3">
            <Text className="text-sm text-texto2">{label}</Text>
            <Text className="flex-1 text-right text-sm font-medium text-texto1">{value}</Text>
        </View>
    );
}

export default function Receipt() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const operation = useOperationsStore((state) => state.operations.find((item) => item.id === id));
    const categories = useRatesStore((state) => state.categories);

    if (!operation || !operation.receiptNumber || !operation.paidAt) return <OperationMissing />;

    const categoryName = categories.find((item) => item.id === operation.categoryId)?.name ?? 'Sin categoría';

    return (
        <Screen title="Comprobante" onBack={() => goToTab(router, '/History')}>
            <Card>
                <View className="items-center gap-2 pb-2">
                    <View className="h-14 w-14 items-center justify-center rounded-full bg-verde/15">
                        <Icon name="circle-check" size={28} color={BRAND.verde} />
                    </View>
                    <Text className="text-xs font-semibold uppercase tracking-wider text-texto2">Comprobante de pago</Text>
                    <Text className="text-3xl font-bold tracking-wide text-texto1">{operation.receiptNumber}</Text>
                    <StatusBadge status={operation.status} />
                </View>
                <View className="gap-2 border-t border-dashed border-borde pt-3">
                    <Line label="Fecha de pago" value={formatDate(operation.paidAt)} />
                    <Line label="Tipo" value={TYPE_LABELS[operation.type]} />
                    <Line label="Descripción" value={operation.description} />
                    <Line label="Categoría" value={categoryName} />
                </View>
            </Card>

            <BreakdownCard type={operation.type} breakdown={operation.breakdown} exchangeRate={operation.exchangeRate} />

            <ActionButton label="Ir al historial" icon="history" onPress={() => goToTab(router, '/History')} />
            <ActionButton label="Nueva cotización" icon="calculator" variant="secondary" onPress={() => goToTab(router, '/Quote')} />
            <Text className="text-center text-xs" style={{ color: COLORS.texto2 }}>
                Documento simulado con fines educativos.
            </Text>
        </Screen>
    );
}
