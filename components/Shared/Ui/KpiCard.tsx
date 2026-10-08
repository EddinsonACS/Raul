import { Text, View } from 'react-native';
import { Icon, type IconName } from '@/components/Shared/Ui/Icon';
import { BRAND, COLORS } from '@/Shared/Global/colors';

type KpiCardProps = {
    label: string;
    value: string;
    detail: string;
    icon: IconName;
    tone?: 'primary' | 'success' | 'warning';
};

const TONE = {
    primary: { bg: 'bg-primario/15', key: 'primario' },
    success: { bg: 'bg-verde/15', key: 'verde' },
    warning: { bg: 'bg-amarillo/15', key: 'amarillo' },
} as const;


export function KpiCard({ label, value, detail, icon, tone = 'primary' }: KpiCardProps) {
    const iconColor = tone === 'primary' ? COLORS.primario : BRAND[TONE[tone].key];

    return (
        <View className="flex-1 gap-2 rounded-3xl border border-borde bg-fondo2 p-4">
            <View className={`h-9 w-9 items-center justify-center rounded-xl ${TONE[tone].bg}`}>
                <Icon name={icon} size={18} color={iconColor} />
            </View>
            <View>
                <Text className="text-xs font-medium text-texto2">{label}</Text>
                <Text className="text-xl font-bold text-texto1" numberOfLines={1} adjustsFontSizeToFit>
                    {value}
                </Text>
                <Text className="text-xs text-texto2" numberOfLines={1}>
                    {detail}
                </Text>
            </View>
        </View>
    );
}
