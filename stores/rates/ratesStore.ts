import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/constants/defaults';
import { TRANSPORT_MODES } from '@/constants/labels';
import { appStorage } from '@/services/storage/appStorage';
import type { Operation, TransportMode } from '@/types/operation';
import type { Category, CategoryInput, TaxSettings } from '@/types/rates';
import { createId } from '@/utils/id';

type RatesState = {
    categories: Category[];
    settings: TaxSettings;
    updateSettings: (settings: TaxSettings) => void;
    addCategory: (input: CategoryInput) => void;
    updateCategory: (id: string, input: CategoryInput) => void;
    removeCategory: (id: string, operations: Pick<Operation, 'categoryId'>[]) => boolean;
};

const STORE_VERSION = 3;

/** Normaliza una categoria: nombre sin espacios sobrantes y sin transportes indefinidos. */
function normalizeCategory(input: CategoryInput): CategoryInput {
    return {
        name: input.name.trim(),
        rates: Object.fromEntries(Object.entries(input.rates).filter(([, rate]) => rate !== undefined)),
    };
}

type LegacyCategory = { id: string; name: string; tariffRate?: number; tariffByMode?: Partial<Record<TransportMode, number>>; rates?: Category['rates'] };

/** v1-v2 tenian arancel general + opcional por transporte: se convierte en arancel por cada transporte. */
export function migrateCategory(category: LegacyCategory): Category {
    if (category.rates) return { id: category.id, name: category.name, rates: category.rates };
    const general = category.tariffRate ?? 0;
    return {
        id: category.id,
        name: category.name,
        rates: Object.fromEntries(TRANSPORT_MODES.map((mode) => [mode, category.tariffByMode?.[mode] ?? general])),
    };
}

export const useRatesStore = create<RatesState>()(
    persist(
        (set) => ({
            categories: DEFAULT_CATEGORIES,
            settings: DEFAULT_SETTINGS,
            updateSettings: (settings) => set({ settings }),
            addCategory: (input) =>
                set((state) => ({ categories: [...state.categories, { id: createId(), ...normalizeCategory(input) }] })),
            updateCategory: (id, input) =>
                set((state) => ({
                    categories: state.categories.map((category) => (category.id === id ? { id, ...normalizeCategory(input) } : category)),
                })),
            removeCategory: (id, operations) => {
                if (operations.some((operation) => operation.categoryId === id)) return false;
                set((state) => ({ categories: state.categories.filter((category) => category.id !== id) }));
                return true;
            },
        }),
        {
            name: 'aduanas-rates',
            storage: appStorage,
            version: STORE_VERSION,
            // v1 no tenia tasa aduanera y el minimo exento era sobre el CIF: se pasan a los valores legales.
            migrate: (persisted, version) => {
                const state = persisted as { categories?: LegacyCategory[]; settings?: Partial<TaxSettings> };
                const legal = version < 2 ? { customsFeeRate: DEFAULT_SETTINGS.customsFeeRate, exemptMinimum: DEFAULT_SETTINGS.exemptMinimum } : {};
                return {
                    categories: (state.categories ?? DEFAULT_CATEGORIES).map(migrateCategory),
                    settings: { ...DEFAULT_SETTINGS, ...(state.settings ?? {}), ...legal },
                };
            },
        }
    )
);
