import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navbar } from '@/components/Layout/Navbar';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <View className="flex-1 bg-fondo">
                <View className="flex-1">
                    <Stack screenOptions={{ headerShown: false }} />
                </View>
                <Navbar />
            </View>
        </SafeAreaProvider>
    );
}
