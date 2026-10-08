import { usePathname, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type IconName } from '@/components/Shared/Ui/Icon';
import { goToTab } from '@/utils/navigation';
import { COLORS } from '@/Shared/Global/colors';

type Tab = {
    href: string;
    label: string;
    icon: IconName;
    /** Rutas que mantienen esta pestana resaltada. */
    routes: string[];
};

const TABS: Tab[] = [
    { href: '/Home', label: 'Inicio', icon: 'house', routes: ['/Home', '/Settings'] },
    { href: '/Quote', label: 'Cotizar', icon: 'calculator', routes: ['/Quote', '/Payment', '/Receipt'] },
    { href: '/Categories', label: 'Categorías', icon: 'tags', routes: ['/Categories'] },
    { href: '/History', label: 'Historial', icon: 'history', routes: ['/History', '/OperationDetail'] },
];

function TabItem({ tab, active, onPress }: { tab: Tab; active: boolean; onPress: () => void }) {
    const progress = useSharedValue(active ? 1 : 0);

    useEffect(() => {
        progress.value = withTiming(active ? 1 : 0, { duration: 180 });
    }, [active, progress]);

    const pillStyle = useAnimatedStyle(() => ({
        opacity: progress.value,
        transform: [{ scaleX: 0.6 + progress.value * 0.4 }],
    }));

    const color = active ? COLORS.primario : COLORS.texto2;

    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={tab.label}
            className="flex-1 items-center gap-1 pt-2"
        >
            <Animated.View style={pillStyle} className="h-1 w-8 rounded-full bg-primario" />
            <Icon name={tab.icon} size={22} color={color} strokeWidth={active ? 2.4 : 2} />
            <Text style={{ color }} className={`text-[11px] ${active ? 'font-semibold' : 'font-medium'}`} numberOfLines={1}>
                {tab.label}
            </Text>
        </Pressable>
    );
}

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    return (
        <View style={{ paddingBottom: Math.max(insets.bottom, 10) }} className="flex-row border-t border-borde bg-fondo2">
            {TABS.map((tab) => (
                <TabItem
                    key={tab.href}
                    tab={tab}
                    active={tab.routes.includes(pathname)}
                    onPress={() => goToTab(router, tab.href, pathname)}
                />
            ))}
        </View>
    );
}
