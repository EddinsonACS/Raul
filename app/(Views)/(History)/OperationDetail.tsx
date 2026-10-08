import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { BreakdownCard } from '@/components/(Views)/Operation/BreakdownCard';
import { OperationMissing } from '@/components/(Views)/Operation/OperationMissing';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Card';
import { MoneyRow } from '@/components/Shared/MoneyRow';
import { Screen } from '@/components/Shared/Screen';
import { StatusBadge } from '@/components/Shared/StatusBadge';
import { TYPE_LABELS } from '@/constants/labels';
import { toMoney } from '@/services/taxes/calculateTaxes';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { formatDate } from '@/utils/format';

function Line({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row justify-between gap-3">
            <Text className="text-sm text-texto2">{label}</Text>
            <Text className="flex-1 text-right text-sm text-texto1">{value}</Text>
        </View>
    );
}

export default function OperationDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const operation = useOperationsStore((state) => state.operations.find((item) => item.id === id));
    const releaseOperation = useOperationsStore((state) => state.releaseOperation);
    const removeOperation = useOperationsStore((state) => state.removeOperation);
    const categories = useRatesStore((state) => state.categories);

    if (!operation) return <OperationMissing />;

    const categoryName = categories.find((item) => item.id === operation.categoryId)?.name ?? 'Sin categoría';

    const confirmRemove = () => {
        Alert.alert('Eliminar operación', 'Esta acción no se puede deshacer.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => {
                    router.back();
                    removeOperation(operation.id);
                },
            },
        ]);
    };

    return (
        <Screen title="Detalle" onBack={() => router.back()}>
            <Card>
                <Text className="text-lg font-bold text-texto1">{operation.description}</Text>
                <StatusBadge status={operation.status} />
                <Line label="Tipo" value={TYPE_LABELS[operation.type]} />
                <Line label="Categoría" value={categoryName} />
                <Line label="Registrada" value={formatDate(operation.createdAt)} />
                <MoneyRow label="Valor" amount={toMoney(operation.value, operation.exchangeRate)} />
                <MoneyRow label="Flete" amount={toMoney(operation.freight, operation.exchangeRate)} />
                <MoneyRow label="Seguro" amount={toMoney(operation.insurance, operation.exchangeRate)} />
                {operation.receiptNumber ? <Line label="Comprobante" value={operation.receiptNumber} /> : null}
            </Card>

            <BreakdownCard type={operation.type} breakdown={operation.breakdown} exchangeRate={operation.exchangeRate} />

            {operation.status === 'pending' ? (
                <>
                    <Button
                        label="Pagar"
                        onPress={() => router.push({ pathname: '/Payment', params: { id: operation.id } })}
                    />
                    <Button label="Eliminar" variant="danger" onPress={confirmRemove} />
                </>
            ) : (
                <Button
                    label="Ver comprobante"
                    variant="secondary"
                    onPress={() => router.push({ pathname: '/Receipt', params: { id: operation.id } })}
                />
            )}

            {operation.status === 'paid' ? (
                <Button label="Liberar mercancía" onPress={() => releaseOperation(operation.id)} />
            ) : null}
        </Screen>
    );
}
