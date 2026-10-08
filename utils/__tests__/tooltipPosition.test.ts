import { tooltipPosition } from '@/utils/tooltipPosition';

const base = { anchorX: 180, anchorY: 300, anchorW: 20, anchorH: 20, width: 240, screenW: 400, margin: 12 };

describe('tooltipPosition', () => {
    it('centra la burbuja bajo el ancla cuando cabe', () => {
        expect(tooltipPosition(base)).toEqual({ left: 70, top: 328, arrowLeft: 120 });
    });

    it('la mantiene dentro del margen derecho', () => {
        const result = tooltipPosition({ ...base, anchorX: 370 });
        expect(result.left).toBe(148);
        expect(result.left + base.width).toBe(388);
        expect(result.arrowLeft).toBe(228);
    });

    it('la mantiene dentro del margen izquierdo', () => {
        const result = tooltipPosition({ ...base, anchorX: 4 });
        expect(result.left).toBe(12);
        expect(result.arrowLeft).toBe(12);
    });

    it('nunca deja la flecha fuera de la burbuja', () => {
        const result = tooltipPosition({ ...base, anchorX: -30 });
        expect(result.arrowLeft).toBeGreaterThanOrEqual(12);
    });
});
