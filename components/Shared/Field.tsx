import { Text, TextInput, View } from 'react-native';

type FieldProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    placeholder?: string;
    numeric?: boolean;
};

export function Field({ label, value, onChangeText, error, placeholder, numeric = false }: FieldProps) {
    return (
        <View className="gap-1">
            <Text className="text-sm font-medium text-texto1">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                keyboardType={numeric ? 'decimal-pad' : 'default'}
                accessibilityLabel={label}
                className={`rounded-xl border bg-tarjeta px-3 py-3 text-base text-texto1 ${error ? 'border-rojo' : 'border-borde'}`}
            />
            {error ? <Text className="text-sm text-rojo">{error}</Text> : null}
        </View>
    );
}
