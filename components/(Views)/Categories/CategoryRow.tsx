import { Pressable, Text, View } from 'react-native';
import { COLORS } from '@/Shared/Global/colors';
import { Icon } from '@/components/Shared/Ui/Icon';
import { TRANSPORT_ICONS, TRANSPORT_LABELS, TRANSPORT_MODES } from '@/constants/labels';
import { tariffRateFor } from '@/services/taxes/tariff';
import type { Category } from '@/types/rates';

type CategoryRowProps = {
    category: Category;
    onPress: () => void;
};

export function CategoryRow({ category, onPress }: CategoryRowProps) {
    const summary = TRANSPORT_MODES.map((mode) => {
        const rate = tariffRateFor(category, mode);
        return `${TRANSPORT_LABELS[mode]} ${rate === undefined ? 'no disponible' : `${rate} por ciento`}`;
    }).join(', ');

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${category.name}: ${summary}`}
            className="flex-row items-center gap-3 rounded-3xl border border-borde bg-fondo2 px-4 py-3.5 active:opacity-80"
        >
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-primario/15">
                <Icon name="tags" size={18} color={COLORS.primario} />
            </View>
            <Text className="flex-1 text-base font-medium text-texto1" numberOfLines={2}>
                {category.name}
            </Text>
            <View className="flex-row gap-1">
                {TRANSPORT_MODES.map((mode) => {
                    const rate = tariffRateFor(category, mode);
                    const available = rate !== undefined;
                    return (
                        <View key={mode} className={`flex-row items-center gap-1 rounded-full px-2 py-1 ${available ? 'bg-fondo3' : 'bg-transparent'}`}>
                            <Icon name={TRANSPORT_ICONS[mode]} size={12} color={available ? COLORS.texto2 : COLORS.borde} />
                            <Text className={`text-xs font-bold ${available ? 'text-texto1' : 'text-borde'}`}>{available ? `${rate}%` : '—'}</Text>
                        </View>
                    );
                })}
            </View>
            <Icon name="chevron-right" size={18} color={COLORS.texto2} />
        </Pressable>
    );
}
