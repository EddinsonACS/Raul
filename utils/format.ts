const VALID_AMOUNT = /^(\d+\.?\d*|\.\d+)$/;

export function parseAmount(text: string): number {
    const normalized = text.trim().replace(',', '.');
    return VALID_AMOUNT.test(normalized) ? Number(normalized) : NaN;
}

export function parseOptionalAmount(text: string): number {
    return text.trim() === '' ? 0 : parseAmount(text);
}

function splitAmount(n: number, thousands: string): [string, string] {
    const [integer, decimals] = Math.abs(n).toFixed(2).split('.');
    return [integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousands), decimals];
}

export function formatUsd(n: number): string {
    const [integer, decimals] = splitAmount(n, ',');
    return `${n < 0 ? '-' : ''}$${integer}.${decimals}`;
}

export function formatBs(n: number): string {
    const [integer, decimals] = splitAmount(n, '.');
    return `${n < 0 ? '-' : ''}Bs ${integer},${decimals}`;
}

export function formatDate(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
