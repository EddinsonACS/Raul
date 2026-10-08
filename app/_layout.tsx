import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { Navbar } from '@/components/Layout/Navbar';
import { toastConfig } from '@/components/Shared/Feedback/AppToast';
import { ConfirmDialogHost } from '@/components/Shared/Modals/ConfirmDialogHost';
import { ThemeProvider, useTheme } from '@/Context/ThemeContext';

function AppShell() {
    const { isDark } = useTheme();
    const insets = useSafeAreaInsets();

    return (
        <View className="flex-1 bg-fondo">
            <StatusBar style={isDark ? 'light' : 'dark'} />
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
                <ThemeProvider>
                    <AppShell />
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}
