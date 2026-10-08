import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { OperationRow } from '@/components/(Views)/History/OperationRow';
import { Button } from '@/components/Shared/Button';
import { Screen } from '@/components/Layout/Screen';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { goToTab } from '@/utils/navigation';

export default function History() {
    const router = useRouter();
    const operations = useOperationsStore((state) => state.operations);
    const categories = useRatesStore((state) => state.categories);

    const categoryName = (id: string) => categories.find((item) => item.id === id)?.name ?? 'Sin categoría';

    return (
        <Screen title="Historial">
            {operations.length === 0 ? (
                <>
                    <Text className="text-base text-texto2">Todavía no hay operaciones registradas.</Text>
                    <Button label="Nueva cotización" onPress={() => goToTab(router, '/Quote')} />
                </>
            ) : (
                operations.map((operation) => (
                    <OperationRow
                        key={operation.id}
                        operation={operation}
                        categoryName={categoryName(operation.categoryId)}
                        onPress={() => router.push({ pathname: '/OperationDetail', params: { id: operation.id } })}
                    />
                ))
            )}
        </Screen>
    );
}
