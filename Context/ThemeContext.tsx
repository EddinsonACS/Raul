import { vars } from 'nativewind';
import { createContext, type ReactNode, useContext, useMemo } from 'react';
import { useColorScheme, View } from 'react-native';
import { COLORS, type ThemeColors } from '@/Shared/Global/colors';
import { type ThemePreference, resolveIsDark, useThemeStore } from '@/stores/shared/themeStore';

type ThemeContextValue = {
    isDark: boolean;
    colors: ThemeColors;
    preference: ThemePreference;
    setPreference: (preference: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function toVars(colors: ThemeColors) {
    return vars({
        '--fondo': colors.fondo,
        '--fondo2': colors.fondo2,
        '--fondo3': colors.fondo3,
        '--texto1': colors.texto1,
        '--texto2': colors.texto2,
        '--borde': colors.borde,
        '--primario': colors.primario,
        '--velo': colors.velo,
    });
}

const THEME_VARS = { light: toVars(COLORS.light), dark: toVars(COLORS.dark) };

export function ThemeProvider({ children }: { children: ReactNode }) {
    const systemScheme = useColorScheme();
    const preference = useThemeStore((state) => state.preference);
    const setPreference = useThemeStore((state) => state.setPreference);
    const isDark = resolveIsDark(preference, systemScheme);

    const value = useMemo<ThemeContextValue>(
        () => ({ isDark, colors: COLORS[isDark ? 'dark' : 'light'], preference, setPreference }),
        [isDark, preference, setPreference]
    );

    return (
        <ThemeContext.Provider value={value}>
            <View style={[{ flex: 1 }, THEME_VARS[isDark ? 'dark' : 'light']]}>{children}</View>
        </ThemeContext.Provider>
    );
}

export function useTheme(): ThemeContextValue {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme debe usarse dentro de ThemeProvider');
    return context;
}
