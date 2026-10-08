import { Text, View } from 'react-native';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { Icon, type IconName } from '@/components/Shared/Ui/Icon';
import { COLORS } from '@/Shared/Global/colors';

type EmptyStateProps = {
    icon: IconName;
    title: string;
    subtitle?: string;
    action?: { label: string; onPress: () => void; icon?: IconName };
};

export function EmptyState({ icon, title, subtitle, action }: EmptyStateProps) {

    return (
        <View className="items-center gap-3 px-6 py-10">
            <View className="h-20 w-20 items-center justify-center rounded-4xl bg-primario/10">
                <Icon name={icon} size={34} color={COLORS.primario} strokeWidth={1.75} />
            </View>
            <Text className="text-center text-lg font-bold text-texto1">{title}</Text>
            {subtitle ? <Text className="text-center text-sm text-texto2">{subtitle}</Text> : null}
            {action ? (
                <View className="pt-2">
                    <ActionButton label={action.label} onPress={action.onPress} icon={action.icon} fullWidth={false} />
                </View>
            ) : null}
        </View>
    );
}
