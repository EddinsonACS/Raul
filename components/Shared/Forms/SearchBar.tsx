import { Pressable, TextInput, View } from 'react-native';
import { useTheme } from '@/Context/ThemeContext';
import { Icon } from '@/components/Shared/Ui/Icon';

type SearchBarProps = {
    value: string;
    onChangeText: (text: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
};

export function SearchBar({ value, onChangeText, placeholder = 'Buscar', autoFocus = false }: SearchBarProps) {
    const { colors } = useTheme();

    return (
        <View className="h-12 flex-row items-center gap-2 rounded-2xl border border-borde bg-fondo2 px-4">
            <Icon name="search" size={18} color={colors.texto2} />
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor={colors.texto2}
                autoFocus={autoFocus}
                autoCorrect={false}
                returnKeyType="search"
                accessibilityLabel={placeholder}
                className="flex-1 text-base text-texto1"
                style={{ paddingVertical: 0 }}
            />
            {value.length > 0 ? (
                <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityRole="button" accessibilityLabel="Limpiar búsqueda">
                    <Icon name="x" size={18} color={colors.texto2} />
                </Pressable>
            ) : null}
        </View>
    );
}
