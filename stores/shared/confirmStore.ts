import { create } from 'zustand';

export type ConfirmOptions = {
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
};

type ConfirmState = {
    visible: boolean;
    options: ConfirmOptions | null;
    resolver: ((value: boolean) => void) | null;
    open: (options: ConfirmOptions) => Promise<boolean>;
    settle: (value: boolean) => void;
};

export const useConfirmStore = create<ConfirmState>((set, get) => ({
    visible: false,
    options: null,
    resolver: null,
    open: (options) =>
        new Promise<boolean>((resolve) => {
            get().resolver?.(false);
            set({ visible: true, options, resolver: resolve });
        }),
    settle: (value) => {
        get().resolver?.(value);
        set({ visible: false, resolver: null });
    },
}));

/** Abre un dialogo de confirmacion y resuelve true si el usuario confirma. */
export function confirm(options: ConfirmOptions): Promise<boolean> {
    return useConfirmStore.getState().open(options);
}
