import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { BreakdownCard } from '@/components/(Views)/Operation/BreakdownCard';
import { OperationMissing } from '@/components/(Views)/Operation/OperationMissing';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Card';
import { Screen } from '@/components/Shared/Screen';
import { StatusBadge } from '@/components/Shared/StatusBadge';
import { TYPE_LABELS } from '@/constants/labels';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { formatDate } from '@/utils/format';
import { goToTab } from '@/utils/navigation';

function Line({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row justify-between gap-3">
            <Text className="text-sm text-texto2">{label}</Text>
            <Text className="flex-1 text-right text-sm text-texto1">{value}</Text>
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
        <Screen title="Comprobante">
            <Card>
                <Text className="text-sm text-texto2">Comprobante de pago</Text>
                <Text className="text-2xl font-bold text-texto1">{operation.receiptNumber}</Text>
                <StatusBadge status={operation.status} />
                <Line label="Fecha de pago" value={formatDate(operation.paidAt)} />
                <Line label="Tipo" value={TYPE_LABELS[operation.type]} />
                <Line label="Descripción" value={operation.description} />
                <Line label="Categoría" value={categoryName} />
            </Card>

            <BreakdownCard type={operation.type} breakdown={operation.breakdown} exchangeRate={operation.exchangeRate} />

            <Button label="Ir al historial" onPress={() => goToTab(router, '/History')} />
            <Button label="Nueva operación" variant="secondary" onPress={() => goToTab(router, '/NewOperation')} />
        </Screen>
    );
}
