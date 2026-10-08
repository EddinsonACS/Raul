import { type ReactNode, useEffect, useState } from 'react';
import { Dimensions, Keyboard, Modal, Platform, Pressable, Text, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { IconButton } from '@/components/Shared/Buttons/IconButton';
import { ConfirmDialogHost } from '@/components/Shared/Modals/ConfirmDialogHost';
import { useModalDepthStore } from '@/stores/shared/modalDepthStore';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const CLOSE_DISTANCE = 120;
const CLOSE_VELOCITY = 800;

type BottomSheetModalProps = {
    visible: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    /** Se llama cuando termina la animacion de salida. */
    onClosed?: () => void;
};

export function BottomSheetModal({ visible, onClose, title, children, onClosed }: BottomSheetModalProps) {
    const insets = useSafeAreaInsets();
    const [mounted, setMounted] = useState(visible);
    const [keyboardHeight, setKeyboardHeight] = useState(0);
    const slideY = useSharedValue(SCREEN_HEIGHT);
    const overlay = useSharedValue(0);
    const keyboardLift = useSharedValue(0);
    const increment = useModalDepthStore((state) => state.increment);
    const decrement = useModalDepthStore((state) => state.decrement);

    useEffect(() => {
        if (visible) {
            setMounted(true);
            slideY.value = withTiming(0, { duration: 280 });
            overlay.value = withTiming(1, { duration: 220 });
            return;
        }
        if (!mounted) return;
        const finish = () => {
            setMounted(false);
            onClosed?.();
        };
        overlay.value = withTiming(0, { duration: 200 });
        slideY.value = withTiming(SCREEN_HEIGHT, { duration: 240 }, (finished) => {
            if (finished) runOnJS(finish)();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    useEffect(() => {
        if (!mounted) return;
        increment();
        return decrement;
    }, [mounted, increment, decrement]);

    // El modal nativo no se redimensiona con el teclado: la hoja se eleva a mano en ambas plataformas.
    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
        const show = Keyboard.addListener(showEvent, (event) => {
            const height = Math.max(0, event.endCoordinates.height - insets.bottom);
            setKeyboardHeight(height);
            keyboardLift.value = withTiming(height, { duration: event.duration || 220 });
        });
        const hide = Keyboard.addListener(hideEvent, (event) => {
            setKeyboardHeight(0);
            keyboardLift.value = withTiming(0, { duration: event.duration || 220 });
        });
        return () => {
            show.remove();
            hide.remove();
        };
    }, [insets.bottom, keyboardLift]);

    const pan = Gesture.Pan()
        .onUpdate((event) => {
            slideY.value = Math.max(0, event.translationY);
        })
        .onEnd((event) => {
            if (event.translationY > CLOSE_DISTANCE || event.velocityY > CLOSE_VELOCITY) {
                runOnJS(onClose)();
            } else {
                slideY.value = withSpring(0, { damping: 20, stiffness: 220 });
            }
        });

    const overlayStyle = useAnimatedStyle(() => ({ opacity: overlay.value }));
    const sheetStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: slideY.value - keyboardLift.value }],
    }));

    const onBackdropPress = () => {
        if (Keyboard.isVisible()) Keyboard.dismiss();
        else onClose();
    };

    // Con el teclado abierto la hoja se acorta para no esconder la cabecera bajo la barra de estado.
    const maxHeight = SCREEN_HEIGHT - keyboardHeight - insets.top - 12;

    if (!mounted) return null;

    return (
        <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={onClose}>
            <GestureHandlerRootView style={{ flex: 1, justifyContent: 'flex-end' }}>
                <Pressable className="absolute inset-0" onPress={onBackdropPress} accessibilityLabel="Cerrar">
                    <Animated.View className="flex-1 bg-velo/60" style={overlayStyle} />
                </Pressable>
                <Animated.View
                    style={[sheetStyle, { paddingBottom: insets.bottom + 16, maxHeight: Math.min(SCREEN_HEIGHT * 0.9, maxHeight) }]}
                    className="rounded-t-4xl bg-fondo2 px-5"
                >
                    <GestureDetector gesture={pan}>
                        <View className="items-center pb-2 pt-3">
                            <View className="h-1.5 w-12 rounded-full bg-borde" />
                            {title ? (
                                <View className="mt-3 w-full flex-row items-center justify-between">
                                    <Text className="flex-1 text-xl font-bold text-texto1">{title}</Text>
                                    <IconButton icon="x" label="Cerrar" onPress={onClose} />
                                </View>
                            ) : null}
                        </View>
                    </GestureDetector>
                    {children}
                </Animated.View>
            </GestureHandlerRootView>
            <ConfirmDialogHost layer />
        </Modal>
    );
}
