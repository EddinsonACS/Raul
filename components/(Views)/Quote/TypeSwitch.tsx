import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { TYPE_LABELS } from '@/constants/labels';
import type { OperationType } from '@/types/operation';

const OPTIONS: OperationType[] = ['import', 'export'];

type TypeSwitchProps = {
    value: OperationType;
    onChange: (type: OperationType) => void;
};

/** Control segmentado con indicador deslizante. */
export function TypeSwitch({ value, onChange }: TypeSwitchProps) {
    const [width, setWidth] = useState(0);
    const offset = useSharedValue(0);
    const index = OPTIONS.indexOf(value);

    useEffect(() => {
        offset.value = withSpring(index * (width / 2), { damping: 18, stiffness: 180 });
    }, [index, width, offset]);

    const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

    return (
        <View className="h-12 flex-row rounded-2xl bg-fondo3 p-1" onLayout={(event) => setWidth(event.nativeEvent.layout.width - 8)}>
            {width > 0 ? (
                <Animated.View
                    style={[indicatorStyle, { width: width / 2 }]}
                    className="absolute bottom-1 top-1 left-1 rounded-xl bg-fondo2 shadow-sm"
                />
            ) : null}
            {OPTIONS.map((option) => {
                const active = option === value;
                return (
                    <Pressable
                        key={option}
                        onPress={() => onChange(option)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        className="flex-1 items-center justify-center"
                    >
                        <Text className={`text-sm ${active ? 'font-semibold text-texto1' : 'font-medium text-texto2'}`}>
                            {TYPE_LABELS[option]}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
