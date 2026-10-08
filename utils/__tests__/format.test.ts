import { formatBs, formatDate, formatUsd, parseAmount, parseOptionalAmount } from '@/utils/format';

describe('parseAmount', () => {
    it('lee decimales con punto y con coma', () => {
        expect(parseAmount('12.5')).toBe(12.5);
        expect(parseAmount('12,5')).toBe(12.5);
        expect(parseAmount(' 300 ')).toBe(300);
        expect(parseAmount('.5')).toBe(0.5);
        expect(parseAmount('7.')).toBe(7);
    });

    it('devuelve NaN con texto vacío o inválido', () => {
        expect(parseAmount('')).toBeNaN();
        expect(parseAmount('abc')).toBeNaN();
        expect(parseAmount('-5')).toBeNaN();
        expect(parseAmount('1.234,5')).toBeNaN();
        expect(parseAmount('1e3')).toBeNaN();
    });
});

describe('parseOptionalAmount', () => {
    it('trata el campo vacío como cero', () => {
        expect(parseOptionalAmount('')).toBe(0);
        expect(parseOptionalAmount('   ')).toBe(0);
        expect(parseOptionalAmount('20')).toBe(20);
    });

    it('devuelve NaN con texto inválido', () => {
        expect(parseOptionalAmount('abc')).toBeNaN();
    });
});

describe('formatUsd', () => {
    it('usa coma de miles y punto decimal', () => {
        expect(formatUsd(74.12)).toBe('$74.12');
        expect(formatUsd(0)).toBe('$0.00');
        expect(formatUsd(1234567.5)).toBe('$1,234,567.50');
    });
});

describe('formatBs', () => {
    it('usa punto de miles y coma decimal', () => {
        expect(formatBs(66708)).toBe('Bs 66.708,00');
        expect(formatBs(0.5)).toBe('Bs 0,50');
        expect(formatBs(1234567.891)).toBe('Bs 1.234.567,89');
    });
});

describe('formatDate', () => {
    it('muestra día/mes/año y hora local', () => {
        const iso = new Date(2026, 9, 8, 14, 5).toISOString();
        expect(formatDate(iso)).toBe('08/10/2026 14:05');
    });
});
