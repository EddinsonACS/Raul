import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { OperationRow } from '@/components/(Views)/History/OperationRow';
import { StatusFilter } from '@/components/(Views)/History/StatusFilter';
import { Screen } from '@/components/Layout/Screen';
import { EmptyState } from '@/components/Shared/Feedback/EmptyState';
import { SearchBar } from '@/components/Shared/Forms/SearchBar';
import { filterOperations, type StatusFilter as StatusFilterValue } from '@/services/operations/filters';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { goToTab } from '@/utils/navigation';

export default function History() {
    const router = useRouter();
    const operations = useOperationsStore((state) => state.operations);
    const categories = useRatesStore((state) => state.categories);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<StatusFilterValue>('all');

    const filtered = useMemo(() => filterOperations(operations, { query, status }), [operations, query, status]);
    const categoryName = (id: string) => categories.find((item) => item.id === id)?.name ?? 'Sin categoría';

    return (
        <Screen title="Historial">
            <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar por descripción o comprobante" />
            <StatusFilter value={status} onChange={setStatus} />
            {operations.length === 0 ? (
                <EmptyState
                    icon="history"
                    title="Sin operaciones todavía"
                    subtitle="Las operaciones que registres aparecerán aquí con su estado."
                    action={{ label: 'Nueva cotización', icon: 'calculator', onPress: () => goToTab(router, '/Quote') }}
                />
            ) : filtered.length === 0 ? (
                <EmptyState icon="search" title="Sin resultados" subtitle="Prueba con otra búsqueda u otro estado." />
            ) : (
                filtered.map((operation) => (
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
