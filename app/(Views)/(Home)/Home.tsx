import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Card';
import { MoneyRow } from '@/components/Shared/MoneyRow';
import { Screen } from '@/components/Shared/Screen';
import { summarizeOperations } from '@/services/operations/summary';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { formatBs } from '@/utils/format';
import { goToTab } from '@/utils/navigation';

export default function Home() {
    const router = useRouter();
    const operations = useOperationsStore((state) => state.operations);
    const exchangeRate = useRatesStore((state) => state.settings.exchangeRate);
    const { pendingCount, collected } = summarizeOperations(operations);

    return (
        <Screen title="Aduanas">
            <Card>
                <Text className="text-sm text-texto2">Tasa del día</Text>
                <Text className="text-2xl font-bold text-texto1">{formatBs(exchangeRate)}</Text>
                <Text className="text-sm text-texto2">por $1.00</Text>
            </Card>

            <Card>
                <Text className="text-sm text-texto2">Operaciones pendientes de pago</Text>
                <Text className="text-2xl font-bold text-texto1">{pendingCount}</Text>
            </Card>

            <Card>
                <MoneyRow label="Total pagado" amount={collected} strong />
            </Card>

            <Button label="Nueva operación" onPress={() => goToTab(router, '/NewOperation')} />
            <Button label="Ver historial" variant="secondary" onPress={() => goToTab(router, '/History')} />
        </Screen>
    );
}
