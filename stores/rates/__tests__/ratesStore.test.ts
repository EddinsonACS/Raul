import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/constants/defaults';
import { migrateCategory, useRatesStore } from '@/stores/rates/ratesStore';

beforeEach(() => {
    useRatesStore.setState(useRatesStore.getInitialState(), true);
});

describe('ratesStore', () => {
    it('arranca con las tasas y categorías de ejemplo', () => {
        const { settings, categories } = useRatesStore.getState();
        expect(settings).toEqual({ vatRate: 16, exemptMinimum: 100, customsFeeRate: 1, exportFee: 10, exchangeRate: 900 });
        expect(settings).toEqual(DEFAULT_SETTINGS);
        expect(categories).toEqual(DEFAULT_CATEGORIES);
        expect(categories.map((c) => c.name)).toEqual(['Ropa y calzado', 'Electrónica', 'Libros', 'Juguetes', 'Cosméticos', 'Otros']);
        expect(categories.every((c) => Object.keys(c.rates).length > 0)).toBe(true);
    });

    it('actualiza la configuración', () => {
        useRatesStore.getState().updateSettings({ ...DEFAULT_SETTINGS, exchangeRate: 950 });
        expect(useRatesStore.getState().settings.exchangeRate).toBe(950);
    });

    it('agrega una categoría con el nombre sin espacios sobrantes y solo los transportes definidos', () => {
        useRatesStore.getState().addCategory({ name: '  Repuestos ', rates: { sea: 12, air: undefined, land: 10 } });
        const added = useRatesStore.getState().categories.at(-1);
        expect(added?.name).toBe('Repuestos');
        expect(added?.rates).toEqual({ sea: 12, land: 10 });
        expect(added?.id).toBeTruthy();
        expect(useRatesStore.getState().categories).toHaveLength(7);
    });

    it('edita una categoría existente', () => {
        const target = useRatesStore.getState().categories[0];
        useRatesStore.getState().updateCategory(target.id, { name: 'Ropa', rates: { air: 30 } });
        expect(useRatesStore.getState().categories[0]).toEqual({ id: target.id, name: 'Ropa', rates: { air: 30 } });
    });

    it('elimina una categoría que nadie usa', () => {
        const target = useRatesStore.getState().categories[0];
        expect(useRatesStore.getState().removeCategory(target.id, [])).toBe(true);
        expect(useRatesStore.getState().categories.find((c) => c.id === target.id)).toBeUndefined();
    });

    it('no elimina una categoría usada por una operación', () => {
        const target = useRatesStore.getState().categories[0];
        expect(useRatesStore.getState().removeCategory(target.id, [{ categoryId: target.id }])).toBe(false);
        expect(useRatesStore.getState().categories).toHaveLength(6);
    });
});

describe('migrateCategory', () => {
    it('convierte el arancel general en arancel por cada transporte', () => {
        expect(migrateCategory({ id: 'a', name: 'Ropa', tariffRate: 20 })).toEqual({ id: 'a', name: 'Ropa', rates: { sea: 20, air: 20, land: 20 } });
    });

    it('respeta los aranceles por transporte que ya existían', () => {
        expect(migrateCategory({ id: 'a', name: 'Ropa', tariffRate: 20, tariffByMode: { air: 25 } })).toEqual({ id: 'a', name: 'Ropa', rates: { sea: 20, air: 25, land: 20 } });
    });

    it('deja igual una categoría ya migrada', () => {
        expect(migrateCategory({ id: 'a', name: 'Ropa', rates: { sea: 1 } })).toEqual({ id: 'a', name: 'Ropa', rates: { sea: 1 } });
    });
});
