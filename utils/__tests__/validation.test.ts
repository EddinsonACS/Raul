import { validateCategory, validateOperation, validateSettings } from '@/utils/validation';

const VALID_FORM = { description: 'Teléfono', categoryId: 'cat-1', value: 300, freight: 30, insurance: 0 };

describe('validateOperation', () => {
    it('acepta un formulario completo', () => {
        expect(validateOperation(VALID_FORM)).toEqual({});
    });

    it('exige descripción y categoría', () => {
        const errors = validateOperation({ ...VALID_FORM, description: '   ', categoryId: null });
        expect(errors.description).toBe('Escribe una descripción.');
        expect(errors.categoryId).toBe('Elige una categoría.');
    });

    it('exige un valor mayor que cero', () => {
        expect(validateOperation({ ...VALID_FORM, value: 0 }).value).toBe('El valor debe ser mayor que cero.');
        expect(validateOperation({ ...VALID_FORM, value: NaN }).value).toBe('El valor debe ser mayor que cero.');
    });

    it('rechaza flete y seguro inválidos pero acepta cero', () => {
        const errors = validateOperation({ ...VALID_FORM, freight: NaN, insurance: NaN });
        expect(errors.freight).toBe('Escribe un monto válido.');
        expect(errors.insurance).toBe('Escribe un monto válido.');
        expect(validateOperation({ ...VALID_FORM, freight: 0, insurance: 0 })).toEqual({});
    });
});

describe('validateSettings', () => {
    const VALID = { vatRate: 16, exemptMinimum: 100, customsFeeRate: 1, exportFee: 10, exchangeRate: 900 };

    it('acepta la configuración inicial y los ceros permitidos', () => {
        expect(validateSettings(VALID)).toEqual({});
        expect(validateSettings({ vatRate: 0, exemptMinimum: 0, customsFeeRate: 0, exportFee: 0, exchangeRate: 1 })).toEqual({});
    });

    it('exige porcentajes entre 0 y 100', () => {
        expect(validateSettings({ ...VALID, vatRate: 101 }).vatRate).toBe('Debe estar entre 0 y 100.');
        expect(validateSettings({ ...VALID, vatRate: NaN }).vatRate).toBe('Debe estar entre 0 y 100.');
        expect(validateSettings({ ...VALID, customsFeeRate: -1 }).customsFeeRate).toBe('Debe estar entre 0 y 100.');
    });

    it('exige tasa del día mayor que cero', () => {
        expect(validateSettings({ ...VALID, exchangeRate: 0 }).exchangeRate).toBe('Debe ser mayor que cero.');
        expect(validateSettings({ ...VALID, exchangeRate: NaN }).exchangeRate).toBe('Debe ser mayor que cero.');
    });

    it('rechaza mínimo exento y trámite inválidos', () => {
        const errors = validateSettings({ ...VALID, exemptMinimum: NaN, exportFee: NaN });
        expect(errors.exemptMinimum).toBe('Escribe un monto válido.');
        expect(errors.exportFee).toBe('Escribe un monto válido.');
    });
});

describe('validateCategory', () => {
    it('acepta nombre y tasa válidos, incluido 0 y 100', () => {
        expect(validateCategory({ name: 'Libros', tariffRate: 0 })).toEqual({});
        expect(validateCategory({ name: 'Lujo', tariffRate: 100, tariffByMode: { air: 30, sea: 20 } })).toEqual({});
    });

    it('exige nombre y tasa entre 0 y 100', () => {
        const errors = validateCategory({ name: ' ', tariffRate: 150 });
        expect(errors.name).toBe('Escribe un nombre.');
        expect(errors.tariffRate).toBe('Debe estar entre 0 y 100.');
        expect(validateCategory({ name: 'X', tariffRate: NaN }).tariffRate).toBe('Debe estar entre 0 y 100.');
    });

    it('revisa cada arancel por transporte', () => {
        const errors = validateCategory({ name: 'Ropa', tariffRate: 20, tariffByMode: { air: NaN, land: 101, sea: 10 } });
        expect(errors.air).toBe('Debe estar entre 0 y 100.');
        expect(errors.land).toBe('Debe estar entre 0 y 100.');
        expect(errors.sea).toBeUndefined();
    });
});
