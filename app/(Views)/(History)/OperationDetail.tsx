import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { BreakdownCard } from '@/components/(Views)/Quote/BreakdownCard';
import { Screen } from '@/components/Layout/Screen';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { InfoTooltip } from '@/components/Shared/Buttons/InfoTooltip';
import { OperationMissing } from '@/components/Shared/Feedback/OperationMissing';
import { Card } from '@/components/Shared/Ui/Card';
import { MoneyRow } from '@/components/Shared/Ui/MoneyRow';
import { StatusBadge } from '@/components/Shared/Ui/StatusBadge';
import { TRANSPORT_LABELS, TYPE_LABELS } from '@/constants/labels';
import { toMoney } from '@/services/taxes/calculateTaxes';
import { toast } from '@/services/toast/toast';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { confirm } from '@/stores/shared/confirmStore';
import { formatDate } from '@/utils/format';

function Line({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row justify-between gap-3">
            <Text className="text-sm text-texto2">{label}</Text>
            <Text className="flex-1 text-right text-sm font-medium text-texto1">{value}</Text>
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
    const rate = operation.exchangeRate;

    const remove = async () => {
        const ok = await confirm({
            title: 'Eliminar operación',
            message: 'Esta operación pendiente se borrará del historial. No se puede deshacer.',
            confirmLabel: 'Eliminar',
            destructive: true,
        });
        if (!ok) return;
        router.back();
        removeOperation(operation.id);
        toast.success('Operación eliminada');
    };

    const release = async () => {
        const ok = await confirm({
            title: 'Liberar mercancía',
            message: 'Confirma que los impuestos fueron pagados y la mercancía puede entregarse.',
            confirmLabel: 'Liberar',
        });
        if (!ok) return;
        releaseOperation(operation.id);
        toast.success('Mercancía liberada');
    };

    return (
        <Screen title="Detalle" onBack={() => router.back()}>
            <Card>
                <View className="flex-row items-start justify-between gap-3">
                    <Text className="flex-1 text-xl font-bold text-texto1">{operation.description}</Text>
                    <StatusBadge status={operation.status} />
                </View>
                <View className="gap-2 border-t border-borde pt-3">
                    <Line label="Tipo" value={TYPE_LABELS[operation.type]} />
                    <Line label="Transporte" value={TRANSPORT_LABELS[operation.transport]} />
                    <Line label="Categoría" value={categoryName} />
                    <Line label="Registrada" value={formatDate(operation.createdAt)} />
                    {operation.paidAt ? <Line label="Pagada" value={formatDate(operation.paidAt)} /> : null}
                    {operation.receiptNumber ? <Line label="Comprobante" value={operation.receiptNumber} /> : null}
                </View>
            </Card>

            <Card>
                <Text className="text-xs font-semibold uppercase tracking-wider text-texto2">Montos declarados</Text>
                <MoneyRow label="Valor del producto" amount={toMoney(operation.value, rate)} />
                <MoneyRow label="Flete" amount={toMoney(operation.freight, rate)} accessory={<InfoTooltip term="freight" />} />
                <MoneyRow label="Seguro" amount={toMoney(operation.insurance, rate)} accessory={<InfoTooltip term="insurance" />} />
            </Card>

            <BreakdownCard type={operation.type} breakdown={operation.breakdown} exchangeRate={rate} />

            {operation.status === 'pending' ? (
                <>
                    <ActionButton label="Pagar ahora" icon="wallet" onPress={() => router.push({ pathname: '/Payment', params: { id: operation.id } })} />
                    <ActionButton label="Eliminar operación" icon="trash" variant="danger" onPress={remove} />
                </>
            ) : (
                <>
                    {operation.status === 'paid' ? <ActionButton label="Liberar mercancía" icon="package-check" onPress={release} /> : null}
                    <ActionButton
                        label="Ver comprobante"
                        icon="receipt"
                        variant="secondary"
                        onPress={() => router.push({ pathname: '/Receipt', params: { id: operation.id } })}
                    />
                </>
            )}
        </Screen>
    );
}
