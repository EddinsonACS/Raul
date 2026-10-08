/** Rutas que se muestran sin la barra de pestanas. */
export const NAVBAR_HIDDEN_ROUTES = ['/Settings'];

export const isNavbarHidden = (pathname: string) => NAVBAR_HIDDEN_ROUTES.includes(pathname);
