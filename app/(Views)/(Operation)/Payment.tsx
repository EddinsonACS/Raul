import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { BreakdownCard } from '@/components/(Views)/Operation/BreakdownCard';
import { OperationMissing } from '@/components/(Views)/Operation/OperationMissing';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Ui/Card';
import { Screen } from '@/components/Layout/Screen';
import { TYPE_LABELS } from '@/constants/labels';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { formatBs, formatUsd } from '@/utils/format';
import { goToTab } from '@/utils/navigation';

export default function Payment() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const operation = useOperationsStore((state) => state.operations.find((item) => item.id === id));
    const payOperation = useOperationsStore((state) => state.payOperation);

    if (!operation) return <OperationMissing />;

    const pay = () => {
        payOperation(operation.id);
        router.replace({ pathname: '/Receipt', params: { id: operation.id } });
    };

    return (
        <Screen title="Pago" onBack={() => (router.canGoBack() ? router.back() : goToTab(router, '/History'))}>
            <Card>
                <Text className="text-sm text-texto2">{TYPE_LABELS[operation.type]}</Text>
                <Text className="text-lg font-bold text-texto1">{operation.description}</Text>
            </Card>

            <BreakdownCard type={operation.type} breakdown={operation.breakdown} exchangeRate={operation.exchangeRate} />

            {operation.status === 'pending' ? (
                <>
                    <Text className="text-sm text-texto2">Pago simulado: no se mueve dinero real.</Text>
                    <Button
                        label={`Pagar ${formatUsd(operation.breakdown.total.usd)} · ${formatBs(operation.breakdown.total.bs)}`}
                        onPress={pay}
                    />
                    <Button label="Pagar después" variant="secondary" onPress={() => goToTab(router, '/History')} />
                </>
            ) : (
                <>
                    <Text className="text-sm text-texto2">Esta operación ya fue pagada.</Text>
                    <Button
                        label="Ver comprobante"
                        onPress={() => router.replace({ pathname: '/Receipt', params: { id: operation.id } })}
                    />
                </>
            )}
        </Screen>
    );
}
