import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navbar } from '@/components/Layout/Navbar';
import { ThemeProvider, useTheme } from '@/Context/ThemeContext';

function AppShell() {
    const { isDark } = useTheme();

    return (
        <View className="flex-1 bg-fondo">
            <StatusBar style={isDark ? 'light' : 'dark'} />
            <View className="flex-1">
                <Stack screenOptions={{ headerShown: false }} />
            </View>
            <Navbar />
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
