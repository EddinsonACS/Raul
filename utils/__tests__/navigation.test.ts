import { goToTab } from '@/utils/navigation';

function fakeRouter(canDismiss: boolean) {
    const calls: string[] = [];
    return {
        calls,
        canDismiss: () => canDismiss,
        dismissAll: () => {
            calls.push('dismissAll');
        },
        replace: (href: string) => {
            calls.push(`replace ${href}`);
        },
    };
}

describe('goToTab', () => {
    it('vacía la pila antes de cambiar de pestaña', () => {
        const router = fakeRouter(true);
        goToTab(router, '/History');
        expect(router.calls).toEqual(['dismissAll', 'replace /History']);
    });

    it('solo reemplaza cuando no hay pantallas apiladas', () => {
        const router = fakeRouter(false);
        goToTab(router, '/Home');
        expect(router.calls).toEqual(['replace /Home']);
    });

    it('no hace nada si ya está en esa pestaña, para no borrar el formulario', () => {
        const router = fakeRouter(true);
        goToTab(router, '/NewOperation', '/NewOperation');
        expect(router.calls).toEqual([]);
    });
});
