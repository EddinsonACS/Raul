import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { useTheme } from '@/Context/ThemeContext';
import { Icon, type IconName } from '@/components/Shared/Ui/Icon';
import { useModalDepthStore } from '@/stores/shared/modalDepthStore';

type CenteredModalProps = {
    visible: boolean;
    onClose: () => void;
    /** Al cambiar, el contenido se desvanece y aparece el nuevo. */
    contentKey: string;
    /** false bloquea el cierre por fondo o boton fisico, por ejemplo mientras se procesa. */
    canClose?: boolean;
    children: ReactNode;
};

type Slot = { key: string; node: ReactNode };

function CenteredModalRoot({ visible, onClose, contentKey, canClose = true, children }: CenteredModalProps) {
    const [mounted, setMounted] = useState(visible);
    const [slot, setSlot] = useState<Slot>({ key: contentKey, node: children });
    const progress = useSharedValue(0);
    const slotOpacity = useSharedValue(1);
    const increment = useModalDepthStore((state) => state.increment);
    const decrement = useModalDepthStore((state) => state.decrement);

    useEffect(() => {
        if (visible) {
            setMounted(true);
            progress.value = withTiming(1, { duration: 220, easing: Easing.out(Easing.cubic) });
            return;
        }
        progress.value = withTiming(0, { duration: 180 }, (finished) => {
            if (finished) runOnJS(setMounted)(false);
        });
    }, [visible, progress]);

    useEffect(() => {
        if (!mounted) return;
        increment();
        return decrement;
    }, [mounted, increment, decrement]);

    // Contenido nuevo con la misma clave: se actualiza sin animar.
    useEffect(() => {
        if (slot.key === contentKey) {
            setSlot({ key: contentKey, node: children });
            return;
        }
        const swap = () => {
            setSlot({ key: contentKey, node: children });
            slotOpacity.value = withDelay(40, withTiming(1, { duration: 240 }));
        };
        slotOpacity.value = withTiming(0, { duration: 160 }, (finished) => {
            if (finished) runOnJS(swap)();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contentKey, children]);

    const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
    const cardStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ scale: 0.94 + progress.value * 0.06 }],
    }));
    const slotStyle = useAnimatedStyle(() => ({ opacity: slotOpacity.value }));

    const requestClose = () => {
        if (canClose) onClose();
    };

    if (!mounted) return null;

    return (
        <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={requestClose}>
            <View className="flex-1 items-center justify-center px-6">
                <Pressable className="absolute inset-0" onPress={requestClose} accessibilityLabel="Cerrar">
                    <Animated.View className="flex-1 bg-velo/60" style={backdropStyle} />
                </Pressable>
                <Animated.View style={cardStyle} className="w-full max-w-[360px] rounded-4xl bg-fondo2 px-6 pb-6 pt-7">
                    <Animated.View style={slotStyle} className="items-center gap-2">
                        {slot.node}
                    </Animated.View>
                </Animated.View>
            </View>
        </Modal>
    );
}

function ModalIcon({ name, tone = 'primary' }: { name: IconName; tone?: 'primary' | 'danger' | 'success' }) {
    const { colors } = useTheme();
    const color = { primary: colors.primario, danger: '#EF4444', success: '#0BBE90' }[tone];
    const surface = { primary: 'bg-primario/12', danger: 'bg-rojo/12', success: 'bg-verde/12' }[tone];
    return (
        <View className={`mb-2 h-16 w-16 items-center justify-center rounded-full ${surface}`}>
            <Icon name={name} size={30} color={color} strokeWidth={2.2} />
        </View>
    );
}

function ModalTitle({ children }: { children: ReactNode }) {
    return <Text className="text-center text-xl font-bold text-texto1">{children}</Text>;
}

function ModalSubtitle({ children }: { children: ReactNode }) {
    return <Text className="text-center text-sm leading-5 text-texto2">{children}</Text>;
}

function ModalActions({ children }: { children: ReactNode }) {
    return <View className="mt-4 w-full gap-2">{children}</View>;
}

export const CenteredModal = Object.assign(CenteredModalRoot, {
    Icon: ModalIcon,
    Title: ModalTitle,
    Subtitle: ModalSubtitle,
    Actions: ModalActions,
});
