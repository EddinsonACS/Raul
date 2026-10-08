import { Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
};

const CONTAINER: Record<ButtonVariant, string> = {
    primary: 'bg-primario',
    secondary: 'border border-borde bg-tarjeta',
    danger: 'border border-rojo bg-tarjeta',
};

const LABEL: Record<ButtonVariant, string> = {
    primary: 'text-white',
    secondary: 'text-texto1',
    danger: 'text-rojo',
};

export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            className={`items-center rounded-xl px-4 py-3 ${CONTAINER[variant]} ${disabled ? 'opacity-40' : ''}`}
        >
            <Text className={`text-base font-semibold ${LABEL[variant]}`}>{label}</Text>
        </Pressable>
    );
}
