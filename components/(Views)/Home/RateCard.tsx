import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View } from 'react-native';
import { BRAND } from '@/Shared/Global/colors';
import { Icon } from '@/components/Shared/Ui/Icon';
import { formatBs } from '@/utils/format';

type RateCardProps = {
    exchangeRate: number;
    onPress: () => void;
};

export function RateCard({ exchangeRate, onPress }: RateCardProps) {
    return (
        <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel="Editar tasa del día" className="active:opacity-90">
            <LinearGradient
                colors={[BRAND.marca2, BRAND.marca]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ borderRadius: 24, padding: 20, overflow: 'hidden' }}
            >
                <View className="absolute -right-6 -top-8 h-36 w-36 rounded-full bg-acento/10" />
                <View className="absolute -right-2 top-10 h-20 w-20 rounded-full bg-acento/10" />
                <View className="flex-row items-center justify-between">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-white/70">Tasa del día</Text>
                    <View className="flex-row items-center gap-1 rounded-full bg-white/10 px-2.5 py-1">
                        <Icon name="pencil" size={12} color={BRAND.blanco} />
                        <Text className="text-xs font-medium text-white">Editar</Text>
                    </View>
                </View>
                <Text className="mt-3 text-4xl font-bold text-white">{formatBs(exchangeRate)}</Text>
                <Text className="mt-1 text-sm text-white/70">por cada $1.00</Text>
            </LinearGradient>
        </Pressable>
    );
}
