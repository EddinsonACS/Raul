import { Pressable, Text, View } from 'react-native';
import { COLORS } from '@/Shared/Global/colors';
import { Icon } from '@/components/Shared/Ui/Icon';

type SelectFieldProps = {
    label: string;
    /** Texto de la opcion elegida. */
    value: string;
    onPress: () => void;
    /** true cuando hay un filtro distinto del predeterminado; resalta el borde. */
    active?: boolean;
};

/** Campo desplegable compacto: etiqueta arriba, valor y flecha abajo. Abre una hoja con las opciones. */
export function SelectField({ label, value, onPress, active = false }: SelectFieldProps) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            accessibilityLabel={`${label}: ${value}`}
            className={`flex-1 rounded-2xl border bg-fondo2 px-3 py-2 active:opacity-80 ${active ? 'border-primario' : 'border-borde'}`}
        >
            <Text className="text-[11px] font-medium text-texto2">{label}</Text>
            <View className="flex-row items-center justify-between gap-1">
                <Text className={`flex-1 text-sm font-semibold ${active ? 'text-primario' : 'text-texto1'}`} numberOfLines={1}>
                    {value}
                </Text>
                <Icon name="chevron-down" size={16} color={active ? COLORS.primario : COLORS.texto2} />
            </View>
        </Pressable>
    );
}
