import type { TransportMode } from '@/types/operation';
import type { Category } from '@/types/rates';

/** Arancel que aplica a una categoria segun el transporte; si no hay valor especifico, el general. */
export function tariffRateFor(category: Pick<Category, 'tariffRate' | 'tariffByMode'>, transport: TransportMode): number {
    return category.tariffByMode?.[transport] ?? category.tariffRate;
}

/** true cuando la categoria define arancel distinto para algun transporte. */
export function hasModeRates(category: Pick<Category, 'tariffByMode'>): boolean {
    return Object.keys(category.tariffByMode ?? {}).length > 0;
}
