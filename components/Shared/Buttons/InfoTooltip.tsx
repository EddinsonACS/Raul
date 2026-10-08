import { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { Icon } from '@/components/Shared/Ui/Icon';
import { GLOSSARY, type GlossaryKey } from '@/constants/glossary';
import { type TooltipPlacement, tooltipPosition } from '@/utils/tooltipPosition';
import { COLORS } from '@/Shared/Global/colors';

const TOOLTIP_WIDTH = 260;
const AUTO_CLOSE_MS = 6000;

type InfoTooltipProps = {
    term: GlossaryKey;
    size?: number;
};

/** Boton de ayuda que muestra la explicacion del glosario en una burbuja flotante. */
export function InfoTooltip({ term, size = 16 }: InfoTooltipProps) {
    const anchorRef = useRef<View>(null);
    const [placement, setPlacement] = useState<TooltipPlacement | null>(null);
    const progress = useSharedValue(0);
    const entry = GLOSSARY[term];

    const open = () => {
        anchorRef.current?.measureInWindow((x, y, width, height) => {
            setPlacement(
                tooltipPosition({
                    anchorX: x,
                    anchorY: y,
                    anchorW: width,
                    anchorH: height,
                    width: TOOLTIP_WIDTH,
                    screenW: Dimensions.get('window').width,
                    margin: 12,
                })
            );
        });
    };

    const close = () => setPlacement(null);

    useEffect(() => {
        progress.value = withTiming(placement ? 1 : 0, { duration: 180, easing: Easing.out(Easing.cubic) });
        if (!placement) return;
        const timer = setTimeout(close, AUTO_CLOSE_MS);
        return () => clearTimeout(timer);
    }, [placement, progress]);

    const bubbleStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ translateY: -4 + progress.value * 4 }, { scale: 0.96 + progress.value * 0.04 }],
    }));

    return (
        <>
            <Pressable
                ref={anchorRef}
                onPress={open}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Qué es ${entry.title}`}
            >
                <Icon name="circle-help" size={size} color={COLORS.texto2} />
            </Pressable>
            {placement ? (
                <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={close}>
                    <Pressable className="flex-1" onPress={close} accessibilityLabel="Cerrar ayuda">
                        <Animated.View
                            style={[bubbleStyle, { position: 'absolute', left: placement.left, top: placement.top, width: TOOLTIP_WIDTH }]}
                            className="rounded-2xl bg-marca px-4 py-3"
                        >
                            <View
                                style={{ left: placement.arrowLeft - 7 }}
                                className="absolute -top-[7px] h-0 w-0 border-x-[7px] border-b-[7px] border-x-transparent border-b-marca"
                            />
                            <Text className="text-sm font-bold text-white">{entry.title}</Text>
                            <Text className="mt-1 text-sm leading-5 text-white/85">{entry.text}</Text>
                        </Animated.View>
                    </Pressable>
                </Modal>
            ) : null}
        </>
    );
}
