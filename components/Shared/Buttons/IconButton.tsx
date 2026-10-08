import { Pressable } from 'react-native';
import { useTheme } from '@/Context/ThemeContext';
import { BRAND } from '@/Shared/Global/colors';
import { Icon, type IconName } from '@/components/Shared/Ui/Icon';

type IconButtonProps = {
    icon: IconName;
    onPress: () => void;
    /** Texto para lectores de pantalla. */
    label: string;
    size?: number;
    tone?: 'neutral' | 'primary' | 'danger';
};

export function IconButton({ icon, onPress, label, size = 20, tone = 'neutral' }: IconButtonProps) {
    const { colors } = useTheme();
    const color = { neutral: colors.texto1, primary: BRAND.blanco, danger: BRAND.rojo }[tone];
    const surface = { neutral: 'bg-fondo3', primary: 'bg-primario', danger: 'bg-rojo/12' }[tone];

    return (
        <Pressable
            onPress={onPress}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={label}
            className={`h-10 w-10 items-center justify-center rounded-xl ${surface} active:opacity-70`}
        >
            <Icon name={icon} size={size} color={color} />
        </Pressable>
    );
}
