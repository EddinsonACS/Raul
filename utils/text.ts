export function normalizeText(text: string): string {
    return text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim();
}

export function matchesQuery(text: string, query: string): boolean {
    const needle = normalizeText(query);
    return needle === '' || normalizeText(text).includes(needle);
}
