import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/constants/defaults';
import { calculateTaxes } from '@/services/taxes/calculateTaxes';
import type { Operation, OperationInput, OperationStatus } from '@/types/operation';

type SeedRow = OperationInput & {
    status: OperationStatus;
    /** Dias atras en que se registro. */
    daysAgo: number;
    /** Horas despues del registro en que se pago. */
    paidAfterHours?: number;
};

// Operaciones de ejemplo: compras por internet e importaciones y exportaciones menores tipicas.
const ROWS: SeedRow[] = [
    { transport: 'air', type: 'import', description: 'Laptop Lenovo IdeaPad 3 (15")', categoryId: 'cat-electronica', value: 649, freight: 48, insurance: 12, status: 'released', daysAgo: 13, paidAfterHours: 5 },
    { transport: 'sea', type: 'import', description: 'Zapatos deportivos Nike Revolution (2 pares)', categoryId: 'cat-ropa', value: 138, freight: 22, insurance: 0, status: 'released', daysAgo: 12, paidAfterHours: 26 },
    { transport: 'sea', type: 'export', description: 'Café en grano tostado, 25 kg', categoryId: 'cat-otros', value: 420, freight: 95, insurance: 15, status: 'released', daysAgo: 11, paidAfterHours: 3 },
    { transport: 'sea', type: 'import', description: 'Libros de texto universitarios (6 unidades)', categoryId: 'cat-libros', value: 212, freight: 30, insurance: 0, status: 'released', daysAgo: 10, paidAfterHours: 8 },
    { transport: 'air', type: 'import', description: 'Set de maquillaje Maybelline', categoryId: 'cat-cosmeticos', value: 86, freight: 14, insurance: 0, status: 'paid', daysAgo: 8, paidAfterHours: 2 },
    { transport: 'air', type: 'import', description: 'Teléfono Samsung Galaxy A55 128 GB', categoryId: 'cat-electronica', value: 389, freight: 25, insurance: 8, status: 'paid', daysAgo: 7, paidAfterHours: 20 },
    { transport: 'air', type: 'export', description: 'Artesanías de madera tallada (12 piezas)', categoryId: 'cat-otros', value: 260, freight: 60, insurance: 10, status: 'paid', daysAgo: 5, paidAfterHours: 4 },
    { transport: 'sea', type: 'import', description: 'Juguetes educativos LEGO Classic', categoryId: 'cat-juguetes', value: 74, freight: 18, insurance: 0, status: 'paid', daysAgo: 4, paidAfterHours: 1 },
    { transport: 'land', type: 'import', description: 'Repuestos de moto: pastillas de freno y filtros', categoryId: 'cat-otros', value: 158, freight: 35, insurance: 5, status: 'paid', daysAgo: 2, paidAfterHours: 6 },
    { transport: 'air', type: 'import', description: 'Audífonos inalámbricos JBL Tune 520', categoryId: 'cat-electronica', value: 49, freight: 9, insurance: 0, status: 'paid', daysAgo: 1, paidAfterHours: 3 },
    { transport: 'air', type: 'import', description: 'Chaqueta impermeable Columbia', categoryId: 'cat-ropa', value: 115, freight: 20, insurance: 0, status: 'pending', daysAgo: 1 },
    { transport: 'sea', type: 'export', description: 'Cacao en polvo orgánico, 40 kg', categoryId: 'cat-otros', value: 520, freight: 110, insurance: 20, status: 'pending', daysAgo: 0 },
    { transport: 'land', type: 'import', description: 'Tablet Xiaomi Redmi Pad SE', categoryId: 'cat-electronica', value: 199, freight: 24, insurance: 6, status: 'pending', daysAgo: 0 },
];

const HOUR_MS = 3600 * 1000;
const DAY_MS = 24 * HOUR_MS;

const formatReceipt = (n: number) => `ADU-${String(n).padStart(6, '0')}`;

/** Construye las operaciones de ejemplo con fechas relativas a `now`. Las mas nuevas quedan primero. */
export function buildSeedOperations(now: Date): { operations: Operation[]; receiptCounter: number } {
    const base = now.getTime() - 90 * 60 * 1000;
    const drafts = ROWS.map((row, index) => {
        const category = DEFAULT_CATEGORIES.find((item) => item.id === row.categoryId);
        if (!category) throw new Error(`Categoría de ejemplo desconocida: ${row.categoryId}`);
        const createdMs = base - row.daysAgo * DAY_MS - (index % 5) * 37 * 60 * 1000;
        const paidMs = row.status === 'pending' ? null : Math.min(createdMs + (row.paidAfterHours ?? 1) * HOUR_MS, now.getTime());
        const { status, daysAgo: _daysAgo, paidAfterHours: _paidAfterHours, ...input } = row;
        return { input, status, createdMs, paidMs, tariffRate: category.tariffRate, id: `seed-${String(index + 1).padStart(2, '0')}` };
    });

    const paidOrder = drafts.filter((draft) => draft.paidMs !== null).sort((a, b) => a.paidMs! - b.paidMs!);
    const receipts = new Map(paidOrder.map((draft, index) => [draft.id, formatReceipt(index + 1)]));

    const operations: Operation[] = drafts
        .map((draft) => ({
            ...draft.input,
            id: draft.id,
            breakdown: calculateTaxes(draft.input, draft.tariffRate, DEFAULT_SETTINGS),
            exchangeRate: DEFAULT_SETTINGS.exchangeRate,
            status: draft.status,
            createdAt: new Date(draft.createdMs).toISOString(),
            paidAt: draft.paidMs === null ? null : new Date(draft.paidMs).toISOString(),
            receiptNumber: receipts.get(draft.id) ?? null,
        }))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return { operations, receiptCounter: paidOrder.length };
}
