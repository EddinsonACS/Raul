import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/constants/defaults';
import { useRatesStore } from '@/stores/rates/ratesStore';

beforeEach(() => {
    useRatesStore.setState(useRatesStore.getInitialState(), true);
});

describe('ratesStore', () => {
    it('arranca con las tasas y categorías de ejemplo', () => {
        const { settings, categories } = useRatesStore.getState();
        expect(settings).toEqual({ vatRate: 16, exemptMinimum: 200, exportFee: 10, exchangeRate: 900 });
        expect(settings).toEqual(DEFAULT_SETTINGS);
        expect(categories).toEqual(DEFAULT_CATEGORIES);
        expect(categories.map((c) => [c.name, c.tariffRate])).toEqual([
            ['Ropa y calzado', 20],
            ['Electrónica', 5],
            ['Libros', 0],
            ['Juguetes', 15],
            ['Cosméticos', 15],
            ['Otros', 10],
        ]);
    });

    it('actualiza la configuración', () => {
        useRatesStore.getState().updateSettings({ ...DEFAULT_SETTINGS, exchangeRate: 950 });
        expect(useRatesStore.getState().settings.exchangeRate).toBe(950);
    });

    it('agrega una categoría con el nombre sin espacios sobrantes', () => {
        useRatesStore.getState().addCategory('  Repuestos ', 12);
        const added = useRatesStore.getState().categories.at(-1);
        expect(added?.name).toBe('Repuestos');
        expect(added?.tariffRate).toBe(12);
        expect(added?.id).toBeTruthy();
        expect(useRatesStore.getState().categories).toHaveLength(7);
    });

    it('edita una categoría existente', () => {
        const target = useRatesStore.getState().categories[0];
        useRatesStore.getState().updateCategory(target.id, 'Ropa', 25);
        expect(useRatesStore.getState().categories[0]).toEqual({ id: target.id, name: 'Ropa', tariffRate: 25 });
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
