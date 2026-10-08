type TabRouter = {
    canDismiss: () => boolean;
    dismissAll: () => void;
    replace: (href: string) => void;
};

/** Cambia de pestaña sin dejar pantallas apiladas debajo. */
export function goToTab(router: TabRouter, href: string, currentPath?: string): void {
    if (currentPath === href) return;
    if (router.canDismiss()) router.dismissAll();
    router.replace(href);
}
