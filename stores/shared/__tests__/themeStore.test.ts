import { resolveIsDark, useThemeStore } from '@/stores/shared/themeStore';

beforeEach(() => {
    useThemeStore.setState(useThemeStore.getInitialState(), true);
});

describe('themeStore', () => {
    it('sigue al sistema por defecto', () => {
        expect(useThemeStore.getState().preference).toBe('system');
    });

    it('guarda la preferencia elegida', () => {
        useThemeStore.getState().setPreference('dark');
        expect(useThemeStore.getState().preference).toBe('dark');
    });
});

describe('resolveIsDark', () => {
    it('usa el esquema del sistema cuando la preferencia es system', () => {
        expect(resolveIsDark('system', 'dark')).toBe(true);
        expect(resolveIsDark('system', 'light')).toBe(false);
        expect(resolveIsDark('system', null)).toBe(false);
    });

    it('ignora el sistema cuando hay preferencia fija', () => {
        expect(resolveIsDark('dark', 'light')).toBe(true);
        expect(resolveIsDark('light', 'dark')).toBe(false);
    });
});
