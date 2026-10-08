import type { TaxSettings } from '@/types/rates';

export type OperationForm = {
    description: string;
    categoryId: string | null;
    value: number;
    freight: number;
    insurance: number;
};

export type OperationErrors = Partial<Record<'description' | 'categoryId' | 'value' | 'freight' | 'insurance', string>>;
export type SettingsErrors = Partial<Record<keyof TaxSettings, string>>;
export type CategoryErrors = Partial<Record<'name' | 'tariffRate', string>>;

const INVALID_AMOUNT = 'Escribe un monto válido.';
const INVALID_PERCENT = 'Debe estar entre 0 y 100.';

const isAmount = (n: number) => Number.isFinite(n) && n >= 0;
const isPercent = (n: number) => Number.isFinite(n) && n >= 0 && n <= 100;

export function validateOperation(form: OperationForm): OperationErrors {
    const errors: OperationErrors = {};
    if (form.description.trim() === '') errors.description = 'Escribe una descripción.';
    if (!form.categoryId) errors.categoryId = 'Elige una categoría.';
    if (!(Number.isFinite(form.value) && form.value > 0)) errors.value = 'El valor debe ser mayor que cero.';
    if (!isAmount(form.freight)) errors.freight = INVALID_AMOUNT;
    if (!isAmount(form.insurance)) errors.insurance = INVALID_AMOUNT;
    return errors;
}

export function validateSettings(settings: TaxSettings): SettingsErrors {
    const errors: SettingsErrors = {};
    if (!isPercent(settings.vatRate)) errors.vatRate = INVALID_PERCENT;
    if (!isAmount(settings.exemptMinimum)) errors.exemptMinimum = INVALID_AMOUNT;
    if (!isAmount(settings.exportFee)) errors.exportFee = INVALID_AMOUNT;
    if (!(Number.isFinite(settings.exchangeRate) && settings.exchangeRate > 0)) {
        errors.exchangeRate = 'Debe ser mayor que cero.';
    }
    return errors;
}

export function validateCategory(form: { name: string; tariffRate: number }): CategoryErrors {
    const errors: CategoryErrors = {};
    if (form.name.trim() === '') errors.name = 'Escribe un nombre.';
    if (!isPercent(form.tariffRate)) errors.tariffRate = INVALID_PERCENT;
    return errors;
}
