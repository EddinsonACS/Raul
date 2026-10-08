import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appStorage } from '@/services/storage/appStorage';
import { calculateTaxes } from '@/services/taxes/calculateTaxes';
import type { Operation, OperationInput, OperationStatus } from '@/types/operation';
import type { TaxSettings } from '@/types/rates';
import { createId } from '@/utils/id';

type OperationsState = {
    operations: Operation[];
    receiptCounter: number;
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
        { name: 'aduanas-operations', storage: appStorage }
    )
);
