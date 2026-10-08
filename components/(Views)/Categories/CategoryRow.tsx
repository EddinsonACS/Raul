import { Pressable, Text, View } from 'react-native';
import { COLORS } from '@/Shared/Global/colors';
import { Icon } from '@/components/Shared/Ui/Icon';
import { TRANSPORT_ICONS, TRANSPORT_MODES } from '@/constants/labels';
import { hasModeRates, tariffRateFor } from '@/services/taxes/tariff';
import type { Category } from '@/types/rates';

type CategoryRowProps = {
    category: Category;
    onPress: () => void;
};

export function CategoryRow({ category, onPress }: CategoryRowProps) {
    const byMode = hasModeRates(category);

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
            <View className="flex-1">
                <Text className="text-base font-medium text-texto1" numberOfLines={1}>
                    {category.name}
                </Text>
                {byMode ? <Text className="text-xs text-texto2">Arancel según transporte</Text> : null}
            </View>
            {byMode ? (
                <View className="flex-row gap-1">
                    {TRANSPORT_MODES.map((mode) => (
                        <View key={mode} className="flex-row items-center gap-1 rounded-full bg-fondo3 px-2 py-1">
                            <Icon name={TRANSPORT_ICONS[mode]} size={12} color={COLORS.texto2} />
                            <Text className="text-xs font-bold text-texto1">{tariffRateFor(category, mode)}%</Text>
                        </View>
                    ))}
                </View>
            ) : (
                <View className="rounded-full bg-fondo3 px-3 py-1">
                    <Text className="text-sm font-bold text-texto1">{category.tariffRate} %</Text>
                </View>
            )}
            <Icon name="chevron-right" size={18} color={COLORS.texto2} />
        </Pressable>
    );
}
