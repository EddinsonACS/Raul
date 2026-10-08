import { useEffect, useRef, useState } from 'react';
import { Dimensions, Modal, Platform, Pressable, StatusBar, Text, View } from 'react-native';
import Animated, { Easing, runOnJS, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { COLORS } from '@/Shared/Global/colors';
import { Icon } from '@/components/Shared/Ui/Icon';
import { GLOSSARY, type GlossaryKey } from '@/constants/glossary';
import { type TooltipPlacement, tooltipPosition } from '@/utils/tooltipPosition';

const TOOLTIP_WIDTH = 264;
const AUTO_CLOSE_MS = 7000;

type Anchor = { x: number; y: number; width: number; height: number };

type InfoTooltipProps = {
    term: GlossaryKey;
    size?: number;
};

/** Boton de ayuda que muestra la explicacion del glosario en una burbuja flotante junto al termino. */
export function InfoTooltip({ term, size = 16 }: InfoTooltipProps) {
    const anchorRef = useRef<View>(null);
    const [anchor, setAnchor] = useState<Anchor | null>(null);
    const [height, setHeight] = useState(0);
    const [open, setOpen] = useState(false);
    const progress = useSharedValue(0);
    const entry = GLOSSARY[term];

    const show = () => {
        anchorRef.current?.measureInWindow((x, y, width, h) => {
            // En Android la medida excluye la barra de estado, pero el Modal translucido arranca en el borde superior.
            const statusBarOffset = Platform.OS === 'android' ? (StatusBar.currentHeight ?? 0) : 0;
            setAnchor({ x, y: y + statusBarOffset, width, height: h });
            setOpen(true);
        });
    };

    const unmount = () => {
        setAnchor(null);
        setHeight(0);
    };

    const hide = () => setOpen(false);

    useEffect(() => {
        if (!anchor) return;
        if (open && height > 0) {
            progress.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
            const timer = setTimeout(hide, AUTO_CLOSE_MS);
            return () => clearTimeout(timer);
        }
        if (!open) {
            progress.value = withTiming(0, { duration: 150 }, (finished) => {
                if (finished) runOnJS(unmount)();
            });
        }
    }, [open, height, anchor, progress]);

    const placement: TooltipPlacement | null =
        anchor && height > 0
            ? tooltipPosition({
                  anchorX: anchor.x,
                  anchorY: anchor.y,
                  anchorW: anchor.width,
                  anchorH: anchor.height,
                  width: TOOLTIP_WIDTH,
                  height,
                  screenW: Dimensions.get('window').width,
                  screenH: Dimensions.get('window').height,
                  margin: 12,
              })
            : null;

    const bubbleStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ translateY: (placement?.above ? 4 : -4) * (1 - progress.value) }, { scale: 0.96 + progress.value * 0.04 }],
    }));

    return (
        <>
            <Pressable
                ref={anchorRef}
                onPress={show}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={`Qué es ${entry.title}`}
                className="h-6 w-6 items-center justify-center rounded-full bg-fondo3"
            >
                <Icon name="circle-help" size={size} color={COLORS.texto2} />
            </Pressable>
            {anchor ? (
                <Modal visible transparent statusBarTranslucent animationType="none" onRequestClose={hide}>
                    <Pressable className="flex-1" onPress={hide} accessibilityLabel="Cerrar ayuda">
                        <Animated.View
                            onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
                            style={[
                                bubbleStyle,
                                { position: 'absolute', width: TOOLTIP_WIDTH, left: placement?.left ?? -1000, top: placement?.top ?? 0 },
                            ]}
                            className="rounded-2xl bg-marca px-4 py-3 shadow-lg"
                        >
                            {placement ? (
                                <View
                                    style={{ left: placement.arrowLeft - 7 }}
                                    className={
                                        placement.above
                                            ? 'absolute -bottom-[7px] h-0 w-0 border-x-[7px] border-t-[7px] border-x-transparent border-t-marca'
                                            : 'absolute -top-[7px] h-0 w-0 border-x-[7px] border-b-[7px] border-x-transparent border-b-marca'
                                    }
                                />
                            ) : null}
                            <View className="flex-row items-center gap-2">
                                <Icon name="info" size={14} color={COLORS.fondo2} />
                                <Text className="text-sm font-bold text-white">{entry.title}</Text>
                            </View>
                            <Text className="mt-1.5 text-sm leading-5 text-white/85">{entry.text}</Text>
                        </Animated.View>
                    </Pressable>
                </Modal>
            ) : null}
        </>
    );
}
