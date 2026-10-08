import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { OperationRow } from '@/components/(Views)/History/OperationRow';
import { Screen } from '@/components/Layout/Screen';
import { EmptyState } from '@/components/Shared/Feedback/EmptyState';
import { OptionSheet, type SheetOption } from '@/components/Shared/Forms/OptionSheet';
import { SearchBar } from '@/components/Shared/Forms/SearchBar';
import { SelectField } from '@/components/Shared/Forms/SelectField';
import { STATUS_LABELS, TRANSPORT_LABELS, TRANSPORT_MODES, TYPE_LABELS } from '@/constants/labels';
import { EMPTY_FILTERS, filterOperations, type OperationFilters } from '@/services/operations/filters';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { goToTab } from '@/utils/navigation';

type FilterKey = 'status' | 'type' | 'transport';

const FILTER_OPTIONS: Record<FilterKey, { label: string; options: SheetOption[] }> = {
    status: {
        label: 'Estado',
        options: [
            { key: 'all', label: 'Todas' },
            { key: 'pending', label: `${STATUS_LABELS.pending}s` },
            { key: 'paid', label: `${STATUS_LABELS.paid}s` },
            { key: 'released', label: `${STATUS_LABELS.released}s` },
        ],
    },
    type: {
        label: 'Tipo',
        options: [
            { key: 'all', label: 'Todos' },
            { key: 'import', label: TYPE_LABELS.import },
            { key: 'export', label: TYPE_LABELS.export },
        ],
    },
    transport: {
        label: 'Transporte',
        options: [{ key: 'all', label: 'Todos' }, ...TRANSPORT_MODES.map((mode) => ({ key: mode, label: TRANSPORT_LABELS[mode] }))],
    },
};

const FILTER_KEYS: FilterKey[] = ['status', 'type', 'transport'];

export default function History() {
    const router = useRouter();
    const operations = useOperationsStore((state) => state.operations);
    const categories = useRatesStore((state) => state.categories);
    const [filters, setFilters] = useState<OperationFilters>(EMPTY_FILTERS);
    const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);

    const filtered = useMemo(() => filterOperations(operations, filters), [operations, filters]);
    const categoryName = (id: string) => categories.find((item) => item.id === id)?.name ?? 'Sin categoría';
    const labelFor = (key: FilterKey) => FILTER_OPTIONS[key].options.find((option) => option.key === filters[key])?.label ?? '';

    return (
        <Screen title="Historial">
            <SearchBar value={filters.query} onChangeText={(query) => setFilters((current) => ({ ...current, query }))} placeholder="Buscar por descripción o comprobante" />
            <View className="flex-row gap-2">
                {FILTER_KEYS.map((key) => (
                    <SelectField
                        key={key}
                        label={FILTER_OPTIONS[key].label}
                        value={labelFor(key)}
                        active={filters[key] !== 'all'}
                        onPress={() => setOpenFilter(key)}
                    />
                ))}
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
            {openFilter ? (
                <OptionSheet
                    visible
                    onClose={() => setOpenFilter(null)}
                    title={FILTER_OPTIONS[openFilter].label}
                    options={FILTER_OPTIONS[openFilter].options}
                    selectedKey={filters[openFilter]}
                    onSelect={(key) => setFilters((current) => ({ ...current, [openFilter]: key }))}
                />
            ) : null}
        </Screen>
    );
}
