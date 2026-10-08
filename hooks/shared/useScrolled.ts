import { useCallback, useState } from 'react';
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';

const THRESHOLD = 4;

/** Indica si una lista se desplazo mas alla del borde superior, para mostrar la linea del encabezado. */
export function useScrolled() {
    const [scrolled, setScrolled] = useState(false);

    const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const next = event.nativeEvent.contentOffset.y > THRESHOLD;
        setScrolled((current) => (current === next ? current : next));
    }, []);

    return { scrolled, onScroll };
}
