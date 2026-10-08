import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '@/components/Shared/Buttons/IconButton';

type TopHeaderProps = {
    title: string;
    showLogo?: boolean;
    onBack?: () => void;
    actions?: ReactNode;
    scrolled: boolean;
};

export function TopHeader({ title, showLogo = false, onBack, actions, scrolled }: TopHeaderProps) {
    const insets = useSafeAreaInsets();

    return (
        <View
            style={{ paddingTop: insets.top + 12 }}
            className={`flex-row items-center gap-3 bg-fondo px-5 pb-4 ${scrolled ? 'border-b border-borde' : ''}`}
        >
            {onBack ? <IconButton icon="arrow-left" label="Volver" onPress={onBack} /> : null}
            {showLogo ? (
                <Image
                    source={require('../../assets/icon.png')}
                    style={{ width: 40, height: 40, borderRadius: 12 }}
                    accessibilityLabel="Logotipo de Aduanas"
                />
            ) : null}
            <Text className="flex-1 text-2xl font-bold text-texto1" numberOfLines={1}>
                {title}
            </Text>
            {actions ? <View className="flex-row items-center gap-2">{actions}</View> : null}
        </View>
    );
}
