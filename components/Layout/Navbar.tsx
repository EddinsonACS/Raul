import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = {
    href: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    routes: string[];
};

const TABS: Tab[] = [
    { href: '/Home', label: 'Inicio', icon: 'home-outline', routes: ['/Home'] },
    { href: '/NewOperation', label: 'Nueva', icon: 'add-circle-outline', routes: ['/NewOperation', '/Payment', '/Receipt'] },
    { href: '/History', label: 'Historial', icon: 'list-outline', routes: ['/History', '/OperationDetail'] },
    { href: '/Admin', label: 'Admin', icon: 'settings-outline', routes: ['/Admin'] },
];

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const goTo = (href: string) => {
        if (router.canDismiss()) router.dismissAll();
        router.replace(href);
    };

    return (
        <View
            style={{ paddingBottom: Math.max(insets.bottom, 8) }}
            className="flex-row border-t border-borde bg-tarjeta pt-2"
        >
            {TABS.map((tab) => {
                const active = tab.routes.includes(pathname);
                const color = active ? '#029AFF' : '#6B7280';
                return (
                    <Pressable
                        key={tab.href}
                        onPress={() => goTo(tab.href)}
                        accessibilityRole="button"
                        accessibilityLabel={tab.label}
                        className="flex-1 items-center gap-1"
                    >
                        <Ionicons name={tab.icon} size={24} color={color} />
                        <Text style={{ color }} className="text-xs font-medium">
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
