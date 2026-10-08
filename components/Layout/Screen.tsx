import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { TopHeader } from '@/components/Layout/TopHeader';
import { useScrolled } from '@/hooks/shared/useScrolled';

type ScreenProps = {
    title: string;
    children: ReactNode;
    showLogo?: boolean;
    onBack?: () => void;
    actions?: ReactNode;
    /** Barra fija bajo el contenido, por ejemplo el boton principal. */
    footer?: ReactNode;
};

export function Screen({ title, children, showLogo, onBack, actions, footer }: ScreenProps) {
    const { scrolled, onScroll } = useScrolled();

    return (
        <KeyboardAvoidingView className="flex-1 bg-fondo" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <TopHeader title={title} showLogo={showLogo} onBack={onBack} actions={actions} scrolled={scrolled} />
            <ScrollView
                onScroll={onScroll}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32, gap: 16 }}
            >
                {children}
            </ScrollView>
            {footer ? <View className="border-t border-borde bg-fondo px-5 py-3">{footer}</View> : null}
        </KeyboardAvoidingView>
    );
}
