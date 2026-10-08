import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { COLORS } from '@/Shared/Global/colors';
import { Icon, type IconName } from '@/components/Shared/Ui/Icon';

export type SegmentOption<T extends string> = {
    key: T;
    label: string;
    icon?: IconName;
};

type SegmentedControlProps<T extends string> = {
    options: SegmentOption<T>[];
    value: T;
    onChange: (value: T) => void;
};

/** Control segmentado con indicador deslizante; sirve para 2 o 3 opciones. */
export function SegmentedControl<T extends string>({ options, value, onChange }: SegmentedControlProps<T>) {
    const [width, setWidth] = useState(0);
    const offset = useSharedValue(0);
    const index = Math.max(0, options.findIndex((option) => option.key === value));
    const segment = width / options.length;

    useEffect(() => {
        offset.value = withSpring(index * segment, { damping: 18, stiffness: 180 });
    }, [index, segment, offset]);

    const indicatorStyle = useAnimatedStyle(() => ({ transform: [{ translateX: offset.value }] }));

    return (
        <View className="h-12 flex-row rounded-2xl bg-fondo3 p-1" onLayout={(event) => setWidth(event.nativeEvent.layout.width - 8)}>
            {width > 0 ? (
                <Animated.View style={[indicatorStyle, { width: segment }]} className="absolute bottom-1 left-1 top-1 rounded-xl bg-fondo2 shadow-sm" />
            ) : null}
            {options.map((option) => {
                const active = option.key === value;
                return (
                    <Pressable
                        key={option.key}
                        onPress={() => onChange(option.key)}
                        accessibilityRole="button"
                        accessibilityState={{ selected: active }}
                        className="flex-1 flex-row items-center justify-center gap-1.5"
                    >
                        {option.icon ? <Icon name={option.icon} size={16} color={active ? COLORS.texto1 : COLORS.texto2} /> : null}
                        <Text className={`text-sm ${active ? 'font-semibold text-texto1' : 'font-medium text-texto2'}`}>{option.label}</Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
