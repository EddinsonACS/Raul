import '../global.css';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Navbar } from '@/components/Layout/Navbar';
import { toastConfig } from '@/components/Shared/Feedback/AppToast';
import { ConfirmDialogHost } from '@/components/Shared/Modals/ConfirmDialogHost';
import { useOperationsStore } from '@/stores/operations/operationsStore';

function AppShell() {
    const insets = useSafeAreaInsets();

    // Datos de ejemplo la primera vez que se abre la app, cuando el almacenamiento ya se leyo.
    useEffect(() => {
        const seed = () => useOperationsStore.getState().seedIfEmpty();
        if (useOperationsStore.persist.hasHydrated()) seed();
        return useOperationsStore.persist.onFinishHydration(seed);
    }, []);

    return (
        <View className="flex-1 bg-fondo">
            <StatusBar style="dark" />
            <View className="flex-1">
                <Stack screenOptions={{ headerShown: false }} />
            </View>
            <Navbar />
            <ConfirmDialogHost />
            <Toast config={toastConfig} topOffset={insets.top + 12} />
        </View>
    );
}

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <SafeAreaProvider>
                <AppShell />
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
