import type { ColorSchemeName } from 'react-native';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appStorage } from '@/services/storage/appStorage';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeState = {
    preference: ThemePreference;
    setPreference: (preference: ThemePreference) => void;
};

export function resolveIsDark(preference: ThemePreference, systemScheme: ColorSchemeName | null | undefined): boolean {
    if (preference === 'system') return systemScheme === 'dark';
    return preference === 'dark';
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            preference: 'system',
            setPreference: (preference) => set({ preference }),
        }),
        { name: 'aduanas-theme', storage: appStorage }
    )
);
