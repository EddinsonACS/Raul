import { Pressable, Text, View } from 'react-native';
import { useTheme } from '@/Context/ThemeContext';
import { Icon, type IconName } from '@/components/Shared/Ui/Icon';

export type QuickAction = {
    label: string;
    icon: IconName;
    onPress: () => void;
};

export function QuickActions({ actions }: { actions: QuickAction[] }) {
    const { colors } = useTheme();

    return (
        <View className="flex-row gap-3">
            {actions.map((action) => (
                <Pressable
                    key={action.label}
                    onPress={action.onPress}
                    accessibilityRole="button"
                    className="flex-1 items-center gap-2 rounded-3xl border border-borde bg-fondo2 py-4 active:opacity-80"
                >
                    <View className="h-11 w-11 items-center justify-center rounded-2xl bg-primario/12">
                        <Icon name={action.icon} size={22} color={colors.primario} />
                    </View>
                    <Text className="text-xs font-semibold text-texto1">{action.label}</Text>
                </Pressable>
            ))}
        </View>
    );
}
