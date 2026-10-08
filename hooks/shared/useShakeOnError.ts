import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

/** Sacude horizontalmente el contenedor cada vez que aparece un mensaje de error. */
export function useShakeOnError(errorMessage?: string) {
    const shake = useSharedValue(0);

    useEffect(() => {
        if (!errorMessage) return;
        shake.value = withSequence(
            withTiming(-6, { duration: 50 }),
            withTiming(6, { duration: 50 }),
            withTiming(-4, { duration: 50 }),
            withTiming(4, { duration: 50 }),
            withTiming(0, { duration: 50 })
        );
    }, [errorMessage, shake]);

    return useAnimatedStyle(() => ({ transform: [{ translateX: shake.value }] }));
}
