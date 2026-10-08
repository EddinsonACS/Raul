import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildSeedOperations } from '@/services/operations/seed';
import { appStorage } from '@/services/storage/appStorage';
import { calculateTaxes } from '@/services/taxes/calculateTaxes';
import type { Operation, OperationInput, OperationStatus } from '@/types/operation';
import type { TaxSettings } from '@/types/rates';
import { createId } from '@/utils/id';

type OperationsState = {
    operations: Operation[];
    receiptCounter: number;
    /** true una vez cargados los datos de ejemplo; no se vuelven a cargar aunque el usuario borre todo. */
    seeded: boolean;
    seedIfEmpty: (now?: Date) => void;
    addOperation: (input: OperationInput, tariffRate: number, settings: TaxSettings) => Operation;
    payOperation: (id: string) => boolean;
    releaseOperation: (id: string) => boolean;
    removeOperation: (id: string) => boolean;
};

const formatReceipt = (n: number) => `ADU-${String(n).padStart(6, '0')}`;

export const useOperationsStore = create<OperationsState>()(
    persist(
        (set, get) => {
            const hasStatus = (id: string, status: OperationStatus) =>
                get().operations.some((operation) => operation.id === id && operation.status === status);

            return {
                operations: [],
                receiptCounter: 0,
                seeded: false,
                seedIfEmpty: (now = new Date()) => {
                    const { seeded, operations } = get();
                    if (seeded || operations.length > 0) return;
                    set({ ...buildSeedOperations(now), seeded: true });
                },
                addOperation: (input, tariffRate, settings) => {
                    const operation: Operation = {
                        ...input,
                        id: createId(),
                        breakdown: calculateTaxes(input, tariffRate, settings),
                        exchangeRate: settings.exchangeRate,
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        paidAt: null,
                        receiptNumber: null,
                    };
                    set((state) => ({ operations: [operation, ...state.operations] }));
                    return operation;
                },
                payOperation: (id) => {
                    if (!hasStatus(id, 'pending')) return false;
                    set((state) => {
                        const receiptCounter = state.receiptCounter + 1;
                        return {
                            receiptCounter,
                            operations: state.operations.map((operation) =>
                                operation.id === id
                                    ? {
                                          ...operation,
                                          status: 'paid',
                                          paidAt: new Date().toISOString(),
                                          receiptNumber: formatReceipt(receiptCounter),
                                      }
                                    : operation
                            ),
                        };
                    });
                    return true;
                },
                releaseOperation: (id) => {
                    if (!hasStatus(id, 'paid')) return false;
                    set((state) => ({
                        operations: state.operations.map((operation) =>
                            operation.id === id ? { ...operation, status: 'released' } : operation
                        ),
                    }));
                    return true;
                },
                removeOperation: (id) => {
                    if (!hasStatus(id, 'pending')) return false;
                    set((state) => ({ operations: state.operations.filter((operation) => operation.id !== id) }));
                    return true;
                },
            };
        },
        {
            name: 'aduanas-operations',
            storage: appStorage,
            version: 2,
            // v1 no guardaba el transporte: las operaciones viejas quedan como maritimas.
            migrate: (persisted) => {
                const state = persisted as { operations?: (Operation & { transport?: Operation['transport'] })[] };
                return {
                    ...state,
                    operations: (state.operations ?? []).map((operation) => ({ ...operation, transport: operation.transport ?? 'sea' })),
                };
            },
        }
    )
);
