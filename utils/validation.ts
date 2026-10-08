import type { TransportMode } from '@/types/operation';
import type { CategoryInput, TaxSettings } from '@/types/rates';

export type OperationForm = {
    description: string;
    categoryId: string | null;
    value: number;
    freight: number;
    insurance: number;
};

export type OperationErrors = Partial<Record<'description' | 'categoryId' | 'value' | 'freight' | 'insurance', string>>;
export type SettingsErrors = Partial<Record<keyof TaxSettings, string>>;
export type CategoryErrors = Partial<Record<'name' | 'rates' | TransportMode, string>>;

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
    if (!isPercent(settings.customsFeeRate)) errors.customsFeeRate = INVALID_PERCENT;
    if (!isAmount(settings.exemptMinimum)) errors.exemptMinimum = INVALID_AMOUNT;
    if (!isAmount(settings.exportFee)) errors.exportFee = INVALID_AMOUNT;
    if (!(Number.isFinite(settings.exchangeRate) && settings.exchangeRate > 0)) {
        errors.exchangeRate = 'Debe ser mayor que cero.';
    }
    return errors;
}

/** Valida nombre y aranceles: cada transporte definido entre 0 y 100, y al menos uno definido. */
export function validateCategory(form: CategoryInput): CategoryErrors {
    const errors: CategoryErrors = {};
    if (form.name.trim() === '') errors.name = 'Escribe un nombre.';
    const entries = Object.entries(form.rates) as [TransportMode, number][];
    if (entries.length === 0) errors.rates = 'Indica el arancel de al menos un transporte.';
    for (const [mode, rate] of entries) {
        if (!isPercent(rate)) errors[mode] = INVALID_PERCENT;
    }
    return errors;
}
