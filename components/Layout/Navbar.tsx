import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { goToTab } from '@/utils/navigation';

type Tab = {
    href: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    routes: string[];
};

const TABS: Tab[] = [
    { href: '/Home', label: 'Inicio', icon: 'home-outline', routes: ['/Home'] },
    { href: '/Quote', label: 'Cotizar', icon: 'calculator-outline', routes: ['/Quote', '/Payment', '/Receipt'] },
    { href: '/History', label: 'Historial', icon: 'list-outline', routes: ['/History', '/OperationDetail'] },
    { href: '/Categories', label: 'Categorías', icon: 'pricetags-outline', routes: ['/Categories'] },
    { href: '/Settings', label: 'Ajustes', icon: 'settings-outline', routes: ['/Settings'] },
];

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

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
                        onPress={() => goToTab(router, tab.href, pathname)}
                        accessibilityRole="button"
                        accessibilityLabel={tab.label}
                        className="flex-1 items-center gap-1"
                    >
                        <Ionicons name={tab.icon} size={22} color={color} />
                        <Text style={{ color }} className="text-[11px] font-medium" numberOfLines={1}>
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
