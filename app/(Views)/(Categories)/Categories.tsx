import { useMemo, useState } from 'react';
import { CategoryRow } from '@/components/(Views)/Categories/CategoryRow';
import { CategorySheet } from '@/components/(Views)/Categories/CategorySheet';
import { Screen } from '@/components/Layout/Screen';
import { IconButton } from '@/components/Shared/Buttons/IconButton';
import { EmptyState } from '@/components/Shared/Feedback/EmptyState';
import { SearchBar } from '@/components/Shared/Forms/SearchBar';
import { toast } from '@/services/toast/toast';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import type { Category, CategoryInput } from '@/types/rates';
import { matchesQuery } from '@/utils/text';

type SheetState = { open: boolean; category: Category | null };

export default function Categories() {
    const operations = useOperationsStore((state) => state.operations);
    const categories = useRatesStore((state) => state.categories);
    const addCategory = useRatesStore((state) => state.addCategory);
    const updateCategory = useRatesStore((state) => state.updateCategory);
    const removeCategory = useRatesStore((state) => state.removeCategory);

    const [query, setQuery] = useState('');
    const [sheet, setSheet] = useState<SheetState>({ open: false, category: null });
    const [pendingToast, setPendingToast] = useState<string | null>(null);

    const filtered = useMemo(() => categories.filter((item) => matchesQuery(item.name, query)), [categories, query]);

    const closeSheet = () => setSheet((current) => ({ ...current, open: false }));

    const save = (input: CategoryInput) => {
        if (sheet.category) updateCategory(sheet.category.id, input);
        else addCategory(input);
        setPendingToast(sheet.category ? 'Categoría actualizada' : 'Categoría agregada');
        closeSheet();
    };

    const remove = (category: Category) => {
        const removed = removeCategory(category.id, operations);
        if (removed) {
            setPendingToast('Categoría eliminada');
            closeSheet();
        }
        return removed;
    };

    const onSheetClosed = () => {
        if (pendingToast) toast.success(pendingToast);
        setPendingToast(null);
    };

    return (
        <Screen
            title="Categorías"
            actions={<IconButton icon="plus" tone="primary" label="Nueva categoría" onPress={() => setSheet({ open: true, category: null })} />}
        >
            <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar categoría" />
            {filtered.length === 0 ? (
                categories.length === 0 ? (
                    <EmptyState
                        icon="tags"
                        title="Sin categorías"
                        subtitle="Agrega una categoría con su arancel para poder cotizar."
                        action={{ label: 'Nueva categoría', icon: 'plus', onPress: () => setSheet({ open: true, category: null }) }}
                    />
                ) : (
                    <EmptyState icon="search" title="Sin resultados" subtitle={`Ninguna categoría coincide con "${query}".`} />
                )
            ) : (
                filtered.map((category) => (
                    <CategoryRow key={category.id} category={category} onPress={() => setSheet({ open: true, category })} />
                ))
            )}
            <CategorySheet
                visible={sheet.open}
                onClose={closeSheet}
                category={sheet.category}
                onSave={save}
                onDelete={remove}
                onClosed={onSheetClosed}
            />
        </Screen>
    );
}
