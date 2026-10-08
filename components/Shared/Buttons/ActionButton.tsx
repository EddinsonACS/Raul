import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { BRAND, COLORS } from '@/Shared/Global/colors';
import { Icon, type IconName } from '@/components/Shared/Ui/Icon';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ActionButtonProps = {
    label: string;
    onPress: () => void;
    variant?: Variant;
    icon?: IconName;
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
};

const CONTAINER: Record<Variant, string> = {
    primary: 'bg-primario',
    secondary: 'border border-borde bg-fondo2',
    ghost: 'bg-transparent',
    danger: 'bg-rojo/15',
};

const LABEL: Record<Variant, string> = {
    primary: 'text-white',
    secondary: 'text-texto1',
    ghost: 'text-primario',
    danger: 'text-rojo',
};

export function ActionButton({
    label,
    onPress,
    variant = 'primary',
    icon,
    loading = false,
    disabled = false,
    fullWidth = true,
}: ActionButtonProps) {
    const contentColor = { primary: BRAND.blanco, secondary: COLORS.texto1, ghost: COLORS.primario, danger: BRAND.rojo }[variant];
    const inactive = disabled || loading;

    return (
        <Pressable
            onPress={onPress}
            disabled={inactive}
            accessibilityRole="button"
            accessibilityState={{ disabled: inactive, busy: loading }}
            className={`h-12 flex-row items-center justify-center gap-2 rounded-2xl px-5 ${CONTAINER[variant]} ${fullWidth ? '' : 'self-start'} ${disabled ? 'opacity-40' : ''} active:opacity-80`}
        >
            <View className="flex-row items-center gap-2" style={{ opacity: loading ? 0 : 1 }}>
                {icon ? <Icon name={icon} size={18} color={contentColor} /> : null}
                <Text className={`text-base font-semibold ${LABEL[variant]}`} numberOfLines={1}>
                    {label}
                </Text>
            </View>
            {loading ? <ActivityIndicator size="small" color={contentColor} style={{ position: 'absolute' }} /> : null}
        </Pressable>
    );
}
