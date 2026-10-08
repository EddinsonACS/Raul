import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { Card } from '@/components/Shared/Ui/Card';

type ChartCardProps = {
    title: string;
    /** Cifra principal, en texto normal (nunca en el color de la serie). */
    value: string;
    detail?: string;
    children: ReactNode;
    className?: string;
};

export function ChartCard({ title, value, detail, children, className = '' }: ChartCardProps) {
    return (
        <Card className={className}>
            <View>
                <Text className="text-xs font-medium text-texto2">{title}</Text>
                <Text className="text-xl font-bold text-texto1" numberOfLines={1} adjustsFontSizeToFit>
                    {value}
                </Text>
                {detail ? (
                    <Text className="text-xs text-texto2" numberOfLines={1}>
                        {detail}
                    </Text>
                ) : null}
            </View>
            {children}
        </Card>
    );
}
