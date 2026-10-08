import type { ReactNode } from 'react';
import { View } from 'react-native';

export function Card({ children }: { children: ReactNode }) {
    return <View className="gap-2 rounded-2xl border border-borde bg-tarjeta p-4">{children}</View>;
}
