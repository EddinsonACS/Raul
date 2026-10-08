import { create } from 'zustand';

type ModalDepthState = {
    /** Cuantos modales nativos hay abiertos; los hosts de la raiz se ocultan mientras sea mayor que cero. */
    depth: number;
    increment: () => void;
    decrement: () => void;
};

export const useModalDepthStore = create<ModalDepthState>((set) => ({
    depth: 0,
    increment: () => set((state) => ({ depth: state.depth + 1 })),
    decrement: () => set((state) => ({ depth: Math.max(0, state.depth - 1) })),
}));
