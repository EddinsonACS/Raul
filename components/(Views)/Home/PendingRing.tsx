import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS } from '@/Shared/Global/colors';
import { ChartCard } from '@/components/(Views)/Home/ChartCard';

type PendingRingProps = {
    pending: number;
    total: number;
};

const SIZE = 84;
const STROKE = 9;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/** Anillo: proporcion de operaciones pendientes sobre el total. */
export function PendingRing({ pending, total }: PendingRingProps) {
    const share = total === 0 ? 0 : pending / total;

    return (
        <ChartCard title="Pendientes" value={String(pending)} detail="sin pagar" className="flex-1">
            <View className="items-center justify-center">
                <Svg width={SIZE} height={SIZE}>
                    <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={COLORS.fondo3} strokeWidth={STROKE} fill="none" />
                    <Circle
                        cx={SIZE / 2}
                        cy={SIZE / 2}
                        r={RADIUS}
                        stroke={COLORS.primario}
                        strokeWidth={STROKE}
                        strokeLinecap="round"
                        fill="none"
                        strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                        strokeDashoffset={CIRCUMFERENCE * (1 - share)}
                        rotation={-90}
                        origin={`${SIZE / 2}, ${SIZE / 2}`}
                    />
                </Svg>
                <View className="absolute items-center">
                    <Text className="text-base font-bold text-texto1">{Math.round(share * 100)}%</Text>
                </View>
            </View>
            <Text className="text-center text-xs text-texto2">de {total} en total</Text>
        </ChartCard>
    );
}
