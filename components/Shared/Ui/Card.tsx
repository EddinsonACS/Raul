import type { ReactNode } from 'react';
import { View, type ViewProps } from 'react-native';

type CardProps = ViewProps & {
    children: ReactNode;
    /** `flat` quita el borde para tarjetas apiladas dentro de otra. */
    variant?: 'default' | 'flat';
};

export function Card({ children, variant = 'default', className = '', ...props }: CardProps) {
    const surface = variant === 'flat' ? 'bg-fondo3' : 'border border-borde bg-fondo2';
    return (
        <View className={`gap-3 rounded-3xl p-4 ${surface} ${className}`} {...props}>
            {children}
        </View>
    );
}
