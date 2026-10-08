import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import type { ToastConfig } from 'react-native-toast-message';
import { BRAND } from '@/Shared/Global/colors';
import { Icon, type IconName } from '@/components/Shared/Ui/Icon';
import type { ToastTone } from '@/services/toast/toast';

const TONE: Record<ToastTone, { color: string; icon: IconName }> = {
    success: { color: BRAND.verde, icon: 'circle-check' },
    error: { color: BRAND.rojo, icon: 'circle-alert' },
    info: { color: BRAND.acento, icon: 'info' },
};

function ToastBody({ tone, text }: { tone: ToastTone; text?: string }) {
    const { color, icon } = TONE[tone];
    return (
        <View
            style={{ borderColor: color }}
            className="mx-5 flex-row items-center gap-3 rounded-full border-[1.5px] bg-fondo2 py-2 pl-2 pr-4"
        >
            <Image source={require('../../../assets/icon.png')} style={{ width: 32, height: 32, borderRadius: 16 }} />
            <Text className="flex-1 text-sm font-semibold text-texto1" numberOfLines={2}>
                {text}
            </Text>
            <Icon name={icon} size={20} color={color} />
        </View>
    );
}

export const toastConfig: ToastConfig = {
    success: ({ text1 }) => <ToastBody tone="success" text={text1} />,
    error: ({ text1 }) => <ToastBody tone="error" text={text1} />,
    info: ({ text1 }) => <ToastBody tone="info" text={text1} />,
};
