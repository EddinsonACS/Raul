import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/constants/defaults';
import { appStorage } from '@/services/storage/appStorage';
import type { Operation } from '@/types/operation';
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

const STORE_VERSION = 2;

/** Normaliza una categoria: nombre sin espacios sobrantes y sin `tariffByMode` vacio. */
function normalizeCategory(input: CategoryInput): CategoryInput {
    const modes = Object.fromEntries(Object.entries(input.tariffByMode ?? {}).filter(([, rate]) => rate !== undefined));
    return {
        name: input.name.trim(),
        tariffRate: input.tariffRate,
        ...(Object.keys(modes).length > 0 ? { tariffByMode: modes } : {}),
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
            migrate: (persisted) => {
                const state = persisted as Partial<RatesState>;
                return {
                    ...state,
                    settings: { ...DEFAULT_SETTINGS, ...(state.settings ?? {}), customsFeeRate: DEFAULT_SETTINGS.customsFeeRate, exemptMinimum: DEFAULT_SETTINGS.exemptMinimum },
                };
            },
        }
    )
);
