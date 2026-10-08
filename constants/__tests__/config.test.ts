import appJson from '../../app.json';
import { COLORS } from '@/Shared/Global/colors';

describe('configuración de la app', () => {
    it('usa solo el tema claro', () => {
        expect(appJson.expo.userInterfaceStyle).toBe('light');
    });

    it('define los colores de interfaz en hexadecimal para admitir opacidad en las clases', () => {
        for (const value of Object.values(COLORS)) expect(value).toMatch(/^#[0-9A-F]{6}$/);
    });
});
