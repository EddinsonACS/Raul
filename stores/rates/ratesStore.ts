import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/constants/defaults';
import { appStorage } from '@/services/storage/appStorage';
import type { Operation } from '@/types/operation';
import type { Category, TaxSettings } from '@/types/rates';
import { createId } from '@/utils/id';

type RatesState = {
    categories: Category[];
    settings: TaxSettings;
    updateSettings: (settings: TaxSettings) => void;
    addCategory: (name: string, tariffRate: number) => void;
    updateCategory: (id: string, name: string, tariffRate: number) => void;
    removeCategory: (id: string, operations: Pick<Operation, 'categoryId'>[]) => boolean;
};

export const useRatesStore = create<RatesState>()(
    persist(
        (set) => ({
            categories: DEFAULT_CATEGORIES,
            settings: DEFAULT_SETTINGS,
            updateSettings: (settings) => set({ settings }),
            addCategory: (name, tariffRate) =>
                set((state) => ({
                    categories: [...state.categories, { id: createId(), name: name.trim(), tariffRate }],
                })),
            updateCategory: (id, name, tariffRate) =>
                set((state) => ({
                    categories: state.categories.map((category) =>
                        category.id === id ? { id, name: name.trim(), tariffRate } : category
                    ),
                })),
            removeCategory: (id, operations) => {
                if (operations.some((operation) => operation.categoryId === id)) return false;
                set((state) => ({ categories: state.categories.filter((category) => category.id !== id) }));
                return true;
            },
        }),
        { name: 'aduanas-rates', storage: appStorage }
    )
);
