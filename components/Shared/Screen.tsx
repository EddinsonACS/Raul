import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps = {
    title: string;
    children: ReactNode;
    onBack?: () => void;
};

export function Screen({ title, children, onBack }: ScreenProps) {
    const insets = useSafeAreaInsets();

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-fondo"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View
                style={{ paddingTop: insets.top + 8 }}
                className="flex-row items-center gap-2 border-b border-borde bg-tarjeta px-4 pb-3"
            >
                {onBack && (
                    <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Volver">
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </Pressable>
                )}
                <Text className="text-xl font-bold text-texto1">{title}</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
