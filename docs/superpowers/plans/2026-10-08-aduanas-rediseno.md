# Rediseño profesional de la app de Aduanas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reconstruir la capa visual de la app con el estándar de Hablax: tema claro/oscuro, modales con Reanimated, tooltips con glosario, buscadores, y las pantallas reorganizadas en 4 pestañas con Ajustes en el encabezado.

**Architecture:** La lógica existente (fórmula, stores, validaciones, navegación) no cambia. Se agrega una base de interfaz reutilizable (`Context/ThemeContext`, `components/Shared/*`, `components/Layout/*`, stores de UI en `stores/shared`) y las pantallas se reescriben encima. Los modales por función (confirmación, toast) usan store + host en la raíz, como Hablax.

**Tech Stack:** Expo 57, Expo Router, NativeWind 4 (`vars()`), Reanimated 4, Gesture Handler, lucide-react-native, expo-image, expo-linear-gradient, react-native-toast-message, Zustand, Jest.

**Spec:** `docs/superpowers/specs/2026-10-08-aduanas-app-design.md`

## Global Constraints

- Debe correr en Expo Go: solo librerías incluidas en Expo Go SDK 57 o puro JS. Nada de `react-native-keyboard-controller` ni MMKV.
- Ningún color literal en pantallas ni componentes de vista: clases del tema (`bg-fondo`, `bg-fondo2`, `bg-fondo3`, `text-texto1`, `text-texto2`, `border-borde`, `bg-primario`, `text-primario`) o `useTheme().colors.*` para props (`color`, `placeholderTextColor`).
- Constantes de marca sin tema: `marca` `#071633`, `marca2` `#0E2A52`, `acento` `#38BDF8`, `verde` `#0BBE90`, `amarillo` `#F59E0B`, `rojo` `#EF4444`.
- Rutas: `/Home`, `/Quote`, `/Categories`, `/History`, `/OperationDetail?id=`, `/Payment?id=`, `/Receipt?id=`, `/Settings`.
- Textos en español; identificadores en inglés; 4 espacios; alias `@/`; sin barrels.
- Las pruebas existentes (47) siguen pasando; se agregan pruebas a toda función pura nueva.
- Verificación por tarea: `npx tsc --noEmit`, `npx jest`, `npx expo export --platform android --output-dir dist`.

## Review Focus

- Hoja inferior con teclado abierto en iOS: el campo activo debe quedar visible (la hoja se eleva con la altura del teclado vía `Keyboard` listeners). Verificación manual.
- Tooltip cerca del borde derecho de la pantalla: la burbuja se mantiene dentro con margen de 12 px. Prueba de la función de posicionamiento.
- Buscadores sin acentos: "electronica" encuentra "Electrónica". Prueba de `normalizeText`/`matchesQuery`.
- Doble toque en "Pagar" dentro del diálogo: una sola transición y un solo pago. `payOperation` ya lo protege; el botón se deshabilita mientras procesa.
- Cambiar tema con un modal abierto: el modal también cambia (está dentro del `ThemeProvider`). Verificación manual.

---

### Task 1: Dependencias, tema y proveedores

**Files:**
- Modify: `package.json`, `tailwind.config.js`, `app/_layout.tsx`, `jest.setup.js`
- Create: `Shared/Global/colors.ts`, `Context/ThemeContext.tsx`, `stores/shared/themeStore.ts`, `components/Shared/Ui/Icon.tsx`
- Test: `stores/shared/__tests__/themeStore.test.ts`

**Interfaces:**
- `COLORS.light` / `COLORS.dark`: `{ fondo, fondo2, fondo3, texto1, texto2, borde, primario, velo }` (velo como `"r, g, b"`).
- `useThemeStore`: `{ preference: 'system' | 'light' | 'dark'; setPreference }`, persistido en `aduanas-theme`.
- `useTheme(): { isDark: boolean; colors: ThemeColors; preference; setPreference }`.
- `<Icon name size color strokeWidth />` sobre lucide.

- [ ] Instalar: `npx expo install react-native-gesture-handler react-native-svg expo-image expo-linear-gradient expo-system-ui` y `npm install lucide-react-native react-native-toast-message`.
- [ ] `tailwind.config.js`: colores del tema como `var(--x)`, `velo: 'rgb(var(--velo) / <alpha-value>)'`, constantes de marca en hex, `borderRadius` `3xl: 20px`, `4xl: 28px`. `content` incluye `Context/` y `Shared/`.
- [ ] `ThemeContext`: resuelve `isDark` según `preference` y `useColorScheme()` de react-native; envuelve en `<View style={[{flex:1}, vars({...})]}>`.
- [ ] Prueba del store: por defecto `system`; `setPreference('dark')` persiste el valor.
- [ ] `app/_layout.tsx`: `GestureHandlerRootView > SafeAreaProvider > ThemeProvider > (Stack + Navbar)`. La barra de estado sigue el tema.
- [ ] `jest.setup.js`: mock de `react-native-reanimated` (`require('react-native-reanimated/mock')`) y de `react-native-gesture-handler/jestSetup`.
- [ ] Verificar y commit: `feat: tema claro/oscuro, iconos lucide y proveedores`.

### Task 2: Primitivas de interfaz

**Files:**
- Create: `components/Shared/Ui/Card.tsx`, `MoneyRow.tsx`, `StatusBadge.tsx`, `KpiCard.tsx`; `components/Shared/Buttons/ActionButton.tsx`, `IconButton.tsx`; `components/Shared/Forms/FormInput.tsx`, `SearchBar.tsx`, `Chip.tsx`; `components/Shared/Feedback/EmptyState.tsx`; `hooks/shared/useShakeOnError.ts`; `utils/text.ts`
- Delete: `components/Shared/*` antiguos (`Button`, `Field`, `Card`, `MoneyRow`, `StatusBadge`, `Screen`), `components/(Views)/Home/KpiCard.tsx`
- Test: `utils/__tests__/text.test.ts`

**Interfaces:**
- `ActionButton { label; onPress; variant?: 'primary'|'secondary'|'ghost'|'danger'; icon?; loading?; disabled?; fullWidth? }` — con spinner superpuesto, el ancho no salta.
- `IconButton { icon; onPress; label (accesibilidad); size?; tone?: 'neutral'|'primary' }`.
- `FormInput extends TextInputProps { label?; errorMessage?; icon?; trailing?; hint? }` — vibra cuando `errorMessage` cambia a un valor.
- `SearchBar { value; onChangeText; placeholder?; autoFocus? }` con botón de limpiar.
- `Chip { label; selected; onPress; icon? }`.
- `EmptyState { icon; title; subtitle?; action?: { label; onPress; icon? } }`.
- `normalizeText(s)`: minúsculas sin acentos; `matchesQuery(text, query)`: true si el texto normalizado contiene la consulta normalizada (consulta vacía = true).

- [ ] Prueba de `normalizeText`/`matchesQuery` (acentos, mayúsculas, vacío) → RED → GREEN.
- [ ] Escribir los componentes; el `useShakeOnError` replica el `withSequence` de Hablax.
- [ ] Reescribir temporalmente las pantallas existentes para que compilen con los nuevos nombres (solo cambio de imports; se reescriben a fondo en la Task 5).
- [ ] Verificar y commit: `feat: primitivas de interfaz reutilizables`.

### Task 3: Encabezado, pantalla base y barra de pestañas

**Files:**
- Create: `components/Layout/TopHeader.tsx`, `components/Layout/Screen.tsx`, `hooks/shared/useScrolled.ts`
- Modify: `components/Layout/Navbar.tsx`

**Interfaces:**
- `TopHeader { title; showLogo?; onBack?; actions?: ReactNode; scrolled }` — paddingTop `insets.top + 16`, paddingBottom 16, logo `expo-image` 36×36 radio 10, título 22 bold; borde inferior solo si `scrolled`.
- `Screen { title; showLogo?; onBack?; actions?; children; footer?; scroll?: boolean }` — compone TopHeader + `ScrollView` (gap 16, padding 20) + footer fijo opcional; el estado `scrolled` sale de `useScrolled(onScroll)`.
- Navbar: 4 pestañas (`home`, `calculator`, `tags`, `history`) con lucide, activo en `primario`, inactivo en `texto2`, indicador superior animado con `withTiming`.

- [ ] Escribir y verificar; commit: `feat: encabezado con logo, pantalla base y barra de 4 pestañas`.

### Task 4: Modales, confirmación, toast y tooltip

**Files:**
- Create: `stores/shared/modalDepthStore.ts`, `stores/shared/confirmStore.ts`, `components/Shared/Modals/BottomSheetModal.tsx`, `CenteredModal.tsx`, `ConfirmDialogHost.tsx`, `services/toast/toast.ts`, `components/Shared/Feedback/AppToast.tsx`, `components/Shared/Buttons/InfoTooltip.tsx`, `constants/glossary.ts`, `utils/tooltipPosition.ts`, `components/Shared/Forms/OptionSheet.tsx`
- Modify: `app/_layout.tsx` (monta `ConfirmDialogHost` y `Toast`)
- Test: `utils/__tests__/tooltipPosition.test.ts`

**Interfaces:**
- `BottomSheetModal { visible; onClose; title?; children; onClosed? }`: `Modal transparent statusBarTranslucent`; `mounted` separado para animar la salida; `slideY` con `withTiming` (280 ms entrada, 240 ms salida); backdrop `bg-velo/60` que primero cierra el teclado; `Gesture.Pan()` sobre el asa y cabecera: arrastre > 120 px o velocidad > 800 cierra, si no vuelve con `withSpring`; se eleva con la altura del teclado (`Keyboard.addListener`).
- `CenteredModal { visible; onClose; contentKey; canClose?; children }` + `CenteredModal.Icon/Title/Subtitle/Actions`: al cambiar `contentKey` hace fade-out 200 ms, cambia, fade-in 240 ms.
- `confirm({ title, message, confirmLabel?, destructive? }): Promise<boolean>` por `confirmStore`; `ConfirmDialogHost` lo renderiza con `CenteredModal`.
- `toast.success(message)`, `toast.error(message)`, `toast.info(message)`; `AppToast` define el `config` (píldora `bg-fondo2`, borde 1.5 del tono, logo).
- `InfoTooltip { term: GlossaryKey; size? }`: botón `circle-help`; mide con `measureInWindow`; `tooltipPosition({ anchorX, anchorY, anchorW, anchorH, width, screenW, margin })` devuelve `{ left, top, arrowLeft }`; se cierra tocando fuera o a los 6 s.
- `OptionSheet<T> { visible; onClose; title; options: { key; label; sublabel? }[]; selectedKey; onSelect; searchable? }`: hoja con buscador y lista.
- `GLOSSARY: Record<GlossaryKey, { title; text }>` con las 8 entradas de la spec.

- [ ] Prueba de `tooltipPosition` (centrado, pegado a la derecha, pegado a la izquierda) → RED → GREEN.
- [ ] Escribir los componentes; verificar y commit: `feat: hojas inferiores, dialogos, toasts y tooltips con glosario`.

### Task 5: Pantallas

**Files:**
- Rewrite: `app/(Views)/(Home)/Home.tsx`, `(Quote)/Quote.tsx` (mover desde `(Operation)/Quote.tsx`), `(Categories)/Categories.tsx`, `(History)/History.tsx`, `(History)/OperationDetail.tsx`, `(Operation)/Payment.tsx`, `(Operation)/Receipt.tsx`, `(Settings)/Settings.tsx`
- Create: `components/(Views)/Home/RateCard.tsx`, `QuickActions.tsx`; `components/(Views)/Quote/TypeSwitch.tsx`, `BreakdownCard.tsx`, `RegisterSheet.tsx`; `components/(Views)/Categories/CategoryRow.tsx`, `CategorySheet.tsx`; `components/(Views)/History/OperationRow.tsx`, `StatusFilter.tsx`; `services/operations/filters.ts`
- Test: `services/operations/__tests__/filters.test.ts`

**Comportamiento:**
- **Home:** `Screen showLogo actions={engranaje → /Settings}`; `RateCard` con `LinearGradient` marca→marca2; 4 `KpiCard` con animación `FadeInDown.delay(i*60)`; `QuickActions` (Cotizar, Categorías, Historial); últimas 3 operaciones o `EmptyState`.
- **Quote:** `TypeSwitch` (segmentado animado), categoría como fila que abre `OptionSheet` con buscador, montos con `FormInput` + `InfoTooltip`, `BreakdownCard` con tooltip por línea y nota de exención, botón "Registrar operación" en el footer que abre `RegisterSheet` (descripción + resumen + confirmar) → `addOperation` → `toast.success('Operación registrada')` → `/Payment`.
- **Categories:** `SearchBar`, lista de `CategoryRow` (nombre, chip `20 %`, chevron), `EmptyState` si la búsqueda no encuentra; `+` en el encabezado abre `CategorySheet` en modo crear; tocar fila abre en modo editar con botón "Eliminar" → `confirm()` → `removeCategory` (si está en uso, `toast.error`).
- **History:** `SearchBar` + `StatusFilter` (chips) + lista; `filterOperations(operations, { query, status })` probado.
- **OperationDetail:** tarjeta de cabecera con `StatusBadge`, montos en ambas monedas, desglose, acciones según estado; eliminar con `confirm()`.
- **Payment:** resumen + `ActionButton` "Pagar" → `CenteredModal` con `contentKey` `confirm` → `processing` (1 s, spinner) → `done` (check) → `/Receipt`.
- **Receipt:** comprobante con número grande, filas, desglose, "Ir al historial" y "Nueva cotización".
- **Settings:** `onBack`; bloques Tipo de cambio, Impuestos de importación, Exportación (con `InfoTooltip`), Apariencia (chips sistema/claro/oscuro), Acerca de (fórmula). Guardar → `toast.success`.

- [ ] Prueba de `filterOperations` → RED → GREEN.
- [ ] Escribir pantallas y componentes; borrar lo obsoleto (`components/(Views)/Operation/*` antiguos, `OperationMissing` se mueve a `components/Shared/Feedback/`).
- [ ] Verificar y commit: `feat: pantallas rediseñadas`.

### Task 6: Cierre

- [ ] `README.md` actualizado (estructura, tema, componentes).
- [ ] `npx tsc --noEmit`, `npx jest`, `npx expo export --platform android --output-dir dist`.
- [ ] Revisión final del branch por un revisor independiente; corregir Critical/Important con prueba; ledger.
