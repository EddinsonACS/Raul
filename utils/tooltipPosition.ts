type TooltipInput = {
    anchorX: number;
    anchorY: number;
    anchorW: number;
    anchorH: number;
    width: number;
    height: number;
    screenW: number;
    screenH: number;
    margin: number;
};

export type TooltipPlacement = {
    left: number;
    top: number;
    /** Centro de la flecha, relativo al borde izquierdo de la burbuja. */
    arrowLeft: number;
    /** true cuando la burbuja se dibuja encima del ancla porque no cabe debajo. */
    above: boolean;
};

const ARROW_INSET = 12;
const GAP = 8;

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/** Coloca la burbuja bajo el ancla, centrada y dentro de la pantalla; si no cabe debajo, la pone encima. */
export function tooltipPosition({ anchorX, anchorY, anchorW, anchorH, width, height, screenW, screenH, margin }: TooltipInput): TooltipPlacement {
    const anchorCenter = anchorX + anchorW / 2;
    const left = clamp(anchorCenter - width / 2, margin, screenW - margin - width);
    const below = anchorY + anchorH + GAP;
    const above = below + height > screenH - margin;
    return {
        left,
        top: above ? anchorY - GAP - height : below,
        arrowLeft: clamp(anchorCenter - left, ARROW_INSET, width - ARROW_INSET),
        above,
    };
}
