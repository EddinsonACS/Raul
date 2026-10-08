import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { OperationRow } from '@/components/(Views)/History/OperationRow';
import { Screen } from '@/components/Layout/Screen';
import { EmptyState } from '@/components/Shared/Feedback/EmptyState';
import { FilterChips, type FilterOption } from '@/components/Shared/Forms/FilterChips';
import { SearchBar } from '@/components/Shared/Forms/SearchBar';
import { STATUS_LABELS, TRANSPORT_ICONS, TRANSPORT_LABELS, TRANSPORT_MODES, TYPE_LABELS } from '@/constants/labels';
import { EMPTY_FILTERS, filterOperations, type OperationFilters, type StatusFilter, type TransportFilter, type TypeFilter } from '@/services/operations/filters';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { goToTab } from '@/utils/navigation';

const STATUS_OPTIONS: FilterOption<StatusFilter>[] = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: `${STATUS_LABELS.pending}s` },
    { key: 'paid', label: `${STATUS_LABELS.paid}s` },
    { key: 'released', label: `${STATUS_LABELS.released}s` },
];

const TYPE_OPTIONS: FilterOption<TypeFilter>[] = [
    { key: 'all', label: 'Todo tipo' },
    { key: 'import', label: TYPE_LABELS.import, icon: 'package-check' },
    { key: 'export', label: TYPE_LABELS.export, icon: 'ship' },
];

const TRANSPORT_OPTIONS: FilterOption<TransportFilter>[] = [
    { key: 'all', label: 'Todo transporte' },
    ...TRANSPORT_MODES.map((mode) => ({ key: mode, label: TRANSPORT_LABELS[mode], icon: TRANSPORT_ICONS[mode] })),
];

export default function History() {
    const router = useRouter();
    const operations = useOperationsStore((state) => state.operations);
    const categories = useRatesStore((state) => state.categories);
    const [filters, setFilters] = useState<OperationFilters>(EMPTY_FILTERS);

    const filtered = useMemo(() => filterOperations(operations, filters), [operations, filters]);
    const categoryName = (id: string) => categories.find((item) => item.id === id)?.name ?? 'Sin categoría';
    const setFilter = <K extends keyof OperationFilters>(key: K) => (value: OperationFilters[K]) =>
        setFilters((current) => ({ ...current, [key]: value }));

    return (
        <Screen title="Historial">
            <SearchBar value={filters.query} onChangeText={setFilter('query')} placeholder="Buscar por descripción o comprobante" />
            <View className="gap-2">
                <FilterChips options={STATUS_OPTIONS} value={filters.status} onChange={setFilter('status')} />
                <FilterChips options={TYPE_OPTIONS} value={filters.type} onChange={setFilter('type')} />
                <FilterChips options={TRANSPORT_OPTIONS} value={filters.transport} onChange={setFilter('transport')} />
            </View>
            {operations.length === 0 ? (
                <EmptyState
                    icon="history"
                    title="Sin operaciones todavía"
                    subtitle="Las operaciones que registres aparecerán aquí con su estado."
                    action={{ label: 'Nueva cotización', icon: 'calculator', onPress: () => goToTab(router, '/Quote') }}
                />
            ) : filtered.length === 0 ? (
                <EmptyState icon="search" title="Sin resultados" subtitle="Prueba con otra búsqueda u otros filtros." />
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
