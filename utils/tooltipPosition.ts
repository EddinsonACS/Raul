type TooltipInput = {
    anchorX: number;
    anchorY: number;
    anchorW: number;
    anchorH: number;
    width: number;
    screenW: number;
    margin: number;
};

export type TooltipPlacement = {
    left: number;
    top: number;
    /** Centro de la flecha, relativo al borde izquierdo de la burbuja. */
    arrowLeft: number;
};

const ARROW_INSET = 12;
const GAP = 8;

const clamp = (n: number, min: number, max: number) => Math.min(Math.max(n, min), max);

/** Coloca la burbuja bajo el ancla, centrada, sin salirse de la pantalla. */
export function tooltipPosition({ anchorX, anchorY, anchorW, anchorH, width, screenW, margin }: TooltipInput): TooltipPlacement {
    const anchorCenter = anchorX + anchorW / 2;
    const left = clamp(anchorCenter - width / 2, margin, screenW - margin - width);
    return {
        left,
        top: anchorY + anchorH + GAP,
        arrowLeft: clamp(anchorCenter - left, ARROW_INSET, width - ARROW_INSET),
    };
}
