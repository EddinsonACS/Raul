import { Pressable, Text, View } from 'react-native';
import { Icon } from '@/components/Shared/Ui/Icon';
import type { Category } from '@/types/rates';
import { COLORS } from '@/Shared/Global/colors';

type CategoryRowProps = {
    category: Category;
    onPress: () => void;
};

export function CategoryRow({ category, onPress }: CategoryRowProps) {

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${category.name}, arancel ${category.tariffRate} por ciento`}
            className="flex-row items-center gap-3 rounded-3xl border border-borde bg-fondo2 px-4 py-3.5 active:opacity-80"
        >
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primario/15">
                <Icon name="tags" size={18} color={COLORS.primario} />
            </View>
            <Text className="flex-1 text-base font-medium text-texto1" numberOfLines={1}>
                {category.name}
            </Text>
            <View className="rounded-full bg-fondo3 px-3 py-1">
                <Text className="text-sm font-bold text-texto1">{category.tariffRate} %</Text>
            </View>
            <Icon name="chevron-right" size={18} color={COLORS.texto2} />
        </Pressable>
    );
}
