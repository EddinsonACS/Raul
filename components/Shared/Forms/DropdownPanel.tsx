import { Pressable, Text, View } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';
import { COLORS } from '@/Shared/Global/colors';
import { Icon } from '@/components/Shared/Ui/Icon';

export type DropdownOption = {
    key: string;
    label: string;
};

type DropdownPanelProps = {
    options: DropdownOption[];
    selectedKey: string;
    onSelect: (key: string) => void;
};

/** Lista desplegable en linea (acordeon) que se muestra bajo un SelectField. */
export function DropdownPanel({ options, selectedKey, onSelect }: DropdownPanelProps) {
    return (
        <Animated.View
            entering={FadeInDown.duration(160)}
            exiting={FadeOut.duration(120)}
            className="overflow-hidden rounded-2xl border border-borde bg-fondo2"
        >
            {options.map((option, index) => {
                const selected = option.key === selectedKey;
                return (
                    <Pressable
                        key={option.key}
                        onPress={() => onSelect(option.key)}
                        accessibilityRole="button"
                        accessibilityState={{ selected }}
                        className={`flex-row items-center justify-between px-4 py-3 active:bg-fondo3 ${index > 0 ? 'border-t border-borde' : ''} ${selected ? 'bg-primario/15' : ''}`}
                    >
                        <Text className={`text-sm ${selected ? 'font-semibold text-primario' : 'text-texto1'}`}>{option.label}</Text>
                        {selected ? <Icon name="check" size={16} color={COLORS.primario} /> : null}
                    </Pressable>
                );
            })}
        </Animated.View>
    );
}
