import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useTheme } from '@/Context/ThemeContext';
import { BreakdownCard } from '@/components/(Views)/Quote/BreakdownCard';
import { Screen } from '@/components/Layout/Screen';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { OperationMissing } from '@/components/Shared/Feedback/OperationMissing';
import { CenteredModal } from '@/components/Shared/Modals/CenteredModal';
import { Card } from '@/components/Shared/Ui/Card';
import { StatusBadge } from '@/components/Shared/Ui/StatusBadge';
import { TYPE_LABELS } from '@/constants/labels';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { formatBs, formatUsd } from '@/utils/format';
import { goToTab } from '@/utils/navigation';

type Step = 'closed' | 'confirm' | 'processing' | 'done';

const PROCESSING_MS = 1100;

export default function Payment() {
    const router = useRouter();
    const { colors } = useTheme();
    const { id } = useLocalSearchParams<{ id: string }>();
    const operation = useOperationsStore((state) => state.operations.find((item) => item.id === id));
    const payOperation = useOperationsStore((state) => state.payOperation);
    const [step, setStep] = useState<Step>('closed');
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (timer.current) clearTimeout(timer.current);
    }, []);

    if (!operation) return <OperationMissing />;

    const total = operation.breakdown.total;
    const goBack = () => (router.canGoBack() ? router.back() : goToTab(router, '/History'));
    const openReceipt = () => router.replace({ pathname: '/Receipt', params: { id: operation.id } });

    const startPayment = () => {
        if (step !== 'confirm') return;
        setStep('processing');
        timer.current = setTimeout(() => {
            payOperation(operation.id);
            setStep('done');
        }, PROCESSING_MS);
    };

    const finish = () => {
        setStep('closed');
        openReceipt();
    };

    return (
        <Screen
            title="Pago"
            onBack={goBack}
            footer={
                operation.status === 'pending' ? (
                    <ActionButton label={`Pagar ${formatUsd(total.usd)}`} icon="wallet" onPress={() => setStep('confirm')} />
                ) : (
                    <ActionButton label="Ver comprobante" icon="receipt" onPress={openReceipt} />
                )
            }
        >
            <Card>
                <View className="flex-row items-start justify-between gap-3">
                    <View className="flex-1">
                        <Text className="text-xs font-semibold uppercase tracking-wider text-texto2">{TYPE_LABELS[operation.type]}</Text>
                        <Text className="mt-1 text-xl font-bold text-texto1">{operation.description}</Text>
                    </View>
                    <StatusBadge status={operation.status} />
                </View>
            </Card>

            <BreakdownCard type={operation.type} breakdown={operation.breakdown} exchangeRate={operation.exchangeRate} />

            <Card variant="flat">
                <Text className="text-sm text-texto2">
                    {operation.status === 'pending'
                        ? 'El pago es simulado: no se mueve dinero real. Al confirmar se emite el comprobante.'
                        : 'Esta operación ya fue pagada.'}
                </Text>
            </Card>

            <CenteredModal
                visible={step !== 'closed'}
                onClose={() => setStep('closed')}
                contentKey={step}
                canClose={step === 'confirm'}
            >
                {step === 'confirm' ? (
                    <>
                        <CenteredModal.Icon name="wallet" />
                        <CenteredModal.Title>Confirmar pago</CenteredModal.Title>
                        <CenteredModal.Subtitle>
                            Se pagarán {formatUsd(total.usd)} ({formatBs(total.bs)}) por "{operation.description}".
                        </CenteredModal.Subtitle>
                        <CenteredModal.Actions>
                            <ActionButton label="Pagar" icon="check" onPress={startPayment} />
                            <ActionButton label="Cancelar" variant="secondary" onPress={() => setStep('closed')} />
                        </CenteredModal.Actions>
                    </>
                ) : step === 'processing' ? (
                    <>
                        <View className="mb-2 h-16 w-16 items-center justify-center">
                            <ActivityIndicator size="large" color={colors.primario} />
                        </View>
                        <CenteredModal.Title>Procesando pago</CenteredModal.Title>
                        <CenteredModal.Subtitle>Un momento…</CenteredModal.Subtitle>
                    </>
                ) : (
                    <>
                        <CenteredModal.Icon name="circle-check" tone="success" />
                        <CenteredModal.Title>Pago realizado</CenteredModal.Title>
                        <CenteredModal.Subtitle>Comprobante {operation.receiptNumber ?? ''}</CenteredModal.Subtitle>
                        <CenteredModal.Actions>
                            <ActionButton label="Ver comprobante" icon="receipt" onPress={finish} />
                        </CenteredModal.Actions>
                    </>
                )}
            </CenteredModal>
        </Screen>
    );
}
