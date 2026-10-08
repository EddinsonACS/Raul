import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/Context/ThemeContext';
import { Icon } from '@/components/Shared/Ui/Icon';
import type { Category } from '@/types/rates';

type CategoryRowProps = {
    category: Category;
    onPress: () => void;
};

export function CategoryRow({ category, onPress }: CategoryRowProps) {
    const { colors } = useTheme();

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${category.name}, arancel ${category.tariffRate} por ciento`}
            className="flex-row items-center gap-3 rounded-3xl border border-borde bg-fondo2 px-4 py-3.5 active:opacity-80"
        >
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primario/12">
                <Icon name="tags" size={18} color={colors.primario} />
            </View>
            <Text className="flex-1 text-base font-medium text-texto1" numberOfLines={1}>
                {category.name}
            </Text>
            <View className="rounded-full bg-fondo3 px-3 py-1">
                <Text className="text-sm font-bold text-texto1">{category.tariffRate} %</Text>
            </View>
            <Icon name="chevron-right" size={18} color={colors.texto2} />
        </Pressable>
    );
}
