import { forwardRef, type ReactNode } from 'react';
import { Text, TextInput, type TextInputProps, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { BRAND, COLORS } from '@/Shared/Global/colors';
import { Icon, type IconName } from '@/components/Shared/Ui/Icon';
import { useShakeOnError } from '@/hooks/shared/useShakeOnError';

type FormInputProps = TextInputProps & {
    label?: string;
    /** Elemento junto a la etiqueta, por ejemplo un tooltip. */
    labelAccessory?: ReactNode;
    errorMessage?: string;
    hint?: string;
    icon?: IconName;
    /** Texto fijo a la derecha, por ejemplo la unidad. */
    suffix?: string;
    numeric?: boolean;
};

export const FormInput = forwardRef<TextInput, FormInputProps>(function FormInput(
    { label, labelAccessory, errorMessage, hint, icon, suffix, numeric = false, className = '', ...inputProps },
    ref
) {
    const shakeStyle = useShakeOnError(errorMessage);
    const border = errorMessage ? 'border-rojo' : 'border-borde focus:border-primario';

    return (
        <View className="gap-1.5">
            {label ? (
                <View className="flex-row items-center gap-1.5">
                    <Text className="text-sm font-medium text-texto1">{label}</Text>
                    {labelAccessory}
                </View>
            ) : null}
            <Animated.View
                style={shakeStyle}
                className={`h-12 flex-row items-center gap-2 rounded-2xl border bg-fondo2 px-4 ${border}`}
            >
                {icon ? <Icon name={icon} size={18} color={COLORS.texto2} /> : null}
                <TextInput
                    ref={ref}
                    placeholderTextColor={COLORS.texto2}
                    keyboardType={numeric ? 'decimal-pad' : 'default'}
                    accessibilityLabel={label}
                    className={`flex-1 text-base text-texto1 ${className}`}
                    style={{ paddingVertical: 0 }}
                    {...inputProps}
                />
                {suffix ? <Text className="text-sm font-medium text-texto2">{suffix}</Text> : null}
            </Animated.View>
            {errorMessage ? (
                <View className="flex-row items-center gap-1">
                    <Icon name="circle-alert" size={14} color={BRAND.rojo} />
                    <Text className="text-xs text-rojo">{errorMessage}</Text>
                </View>
            ) : hint ? (
                <Text className="text-xs text-texto2">{hint}</Text>
            ) : null}
        </View>
    );
});
