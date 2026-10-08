import type { ReactNode } from 'react';
import { usePathname } from 'expo-router';
import { KeyboardAvoidingView, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TopHeader } from '@/components/Layout/TopHeader';
import { isNavbarHidden } from '@/constants/layout';
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
    const insets = useSafeAreaInsets();
    const pathname = usePathname();
    const footerBottom = isNavbarHidden(pathname) ? Math.max(insets.bottom, 12) : 12;

    return (
        <KeyboardAvoidingView className="flex-1 bg-fondo" behavior="padding">
            <TopHeader title={title} showLogo={showLogo} onBack={onBack} actions={actions} scrolled={scrolled} />
            <ScrollView
                onScroll={onScroll}
                scrollEventThrottle={16}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 4, paddingBottom: 32, gap: 16 }}
            >
                {children}
            </ScrollView>
            {footer ? (
                <View style={{ paddingBottom: footerBottom }} className="border-t border-borde bg-fondo px-5 pt-3">
                    {footer}
                </View>
            ) : null}
        </KeyboardAvoidingView>
    );
}
