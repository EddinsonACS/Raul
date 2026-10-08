import { useMemo, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { useTheme } from '@/Context/ThemeContext';
import { SearchBar } from '@/components/Shared/Forms/SearchBar';
import { BottomSheetModal } from '@/components/Shared/Modals/BottomSheetModal';
import { Icon } from '@/components/Shared/Ui/Icon';
import { matchesQuery } from '@/utils/text';

export type SheetOption = {
    key: string;
    label: string;
    sublabel?: string;
};

type OptionSheetProps = {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: SheetOption[];
    selectedKey: string | null;
    onSelect: (key: string) => void;
    searchable?: boolean;
    emptyText?: string;
};

const LIST_MAX_HEIGHT = Dimensions.get('window').height * 0.55;

export function OptionSheet({ visible, onClose, title, options, selectedKey, onSelect, searchable = false, emptyText = 'Sin resultados' }: OptionSheetProps) {
    const { colors } = useTheme();
    const [query, setQuery] = useState('');
    const filtered = useMemo(() => options.filter((option) => matchesQuery(option.label, query)), [options, query]);

    const choose = (key: string) => {
        onSelect(key);
        onClose();
    };

    return (
        <BottomSheetModal visible={visible} onClose={onClose} title={title} onClosed={() => setQuery('')}>
            {searchable ? (
                <View className="pb-3">
                    <SearchBar value={query} onChangeText={setQuery} placeholder="Buscar" />
                </View>
            ) : null}
            <FlatList
                data={filtered}
                keyExtractor={(option) => option.key}
                style={{ maxHeight: LIST_MAX_HEIGHT }}
                keyboardShouldPersistTaps="handled"
                ItemSeparatorComponent={() => <View className="h-px bg-borde" />}
                ListEmptyComponent={<Text className="py-6 text-center text-sm text-texto2">{emptyText}</Text>}
                renderItem={({ item }) => {
                    const selected = item.key === selectedKey;
                    return (
                        <Pressable
                            onPress={() => choose(item.key)}
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            className="flex-row items-center justify-between gap-3 py-3.5 active:opacity-70"
                        >
                            <View className="flex-1">
                                <Text className={`text-base text-texto1 ${selected ? 'font-semibold' : ''}`}>{item.label}</Text>
                                {item.sublabel ? <Text className="text-xs text-texto2">{item.sublabel}</Text> : null}
                            </View>
                            {selected ? <Icon name="check" size={20} color={colors.primario} /> : null}
                        </Pressable>
                    );
                }}
            />
        </BottomSheetModal>
    );
}
