import { TRANSPORT_MODES } from '@/constants/labels';
import type { TransportMode } from '@/types/operation';
import type { Category } from '@/types/rates';

/** Arancel de la categoria para un transporte, o undefined si no esta disponible para el. */
export function tariffRateFor(category: Pick<Category, 'rates'>, transport: TransportMode): number | undefined {
    return category.rates[transport];
}

export function isAvailableFor(category: Pick<Category, 'rates'>, transport: TransportMode): boolean {
    return category.rates[transport] !== undefined;
}

/** Transportes para los que la categoria tiene arancel, en el orden fijo de la app. */
export function availableModes(category: Pick<Category, 'rates'>): TransportMode[] {
    return TRANSPORT_MODES.filter((mode) => isAvailableFor(category, mode));
}
