import { Pressable, Text } from 'react-native';
import { BRAND, COLORS } from '@/Shared/Global/colors';
import { Icon, type IconName } from '@/components/Shared/Ui/Icon';

type ChipProps = {
    label: string;
    selected: boolean;
    onPress: () => void;
    icon?: IconName;
};

export function Chip({ label, selected, onPress, icon }: ChipProps) {

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            className={`h-9 flex-row items-center gap-1.5 rounded-full border px-3.5 ${selected ? 'border-primario bg-primario' : 'border-borde bg-fondo2'} active:opacity-80`}
        >
            {icon ? <Icon name={icon} size={14} color={selected ? BRAND.blanco : COLORS.texto2} /> : null}
            <Text className={`text-sm font-medium ${selected ? 'text-white' : 'text-texto1'}`}>{label}</Text>
        </Pressable>
    );
}
