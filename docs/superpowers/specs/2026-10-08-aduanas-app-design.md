# App de cálculo de impuestos y aranceles — Diseño

Fecha: 2026-10-08

## Propósito

Proyecto escolar. Una app móvil que automatiza el cálculo, el cobro y la gestión
de impuestos y aranceles de importaciones y exportaciones menores, procesando
cada operación en el menor tiempo posible.

Todo es simulado y local: no se conecta a aduanas, bancos ni servicios externos.
Las tasas son datos de ejemplo editables.

## Alcance

Incluye:

- Registrar una operación de importación o exportación.
- Calcular al instante arancel, IVA y total, en dólares y en bolívares.
- Pago simulado con comprobante.
- Historial de operaciones con estados.
- Administración de categorías, tasas y tasa de cambio del día.

No incluye: login ni roles, servidor o base de datos remota, pagos reales,
clasificación arancelaria oficial, reportes en PDF, varios idiomas.

## Tecnología

Misma base y orden de carpetas que el proyecto Hablax, sin sus integraciones
nativas, para que corra en Expo Go.

- Expo (SDK más reciente, el que soporta Expo Go), React Native, TypeScript
- Expo Router (rutas por archivos)
- NativeWind (Tailwind) con paleta fija (solo tema claro)
- Reanimated y Gesture Handler para modales, hojas inferiores y animaciones
- Zustand con persistencia en AsyncStorage
- lucide-react-native (íconos), expo-image (logo), expo-linear-gradient,
  react-native-toast-message
- Jest para la lógica de cálculo y utilidades

## Identidad visual

- Logotipo propio: una **A** de remates redondos que es el haz de un radar, con
  el punto de origen en el vértice y anillos de barrido, sin travesaño. PNG
  exportados en `assets/` (ícono, frente y monocromo de Android, splash, favicon).
- Paleta: azul marino `#071633` / `#0E2A52` de marca, acento `#38BDF8`,
  primario `#2563EB`. Solo tema claro.
- Tipografía del sistema, jerarquía por tamaño y peso. Tarjetas con radio 20,
  borde sutil, sin sombras pesadas.

## Pantallas

Cuatro pestañas inferiores, en este orden:

| Pestaña | Contenido |
|---|---|
| Inicio | Tablero: tasa del día en tarjeta con degradado, indicadores 2×2 (recaudado, por cobrar, pendientes, operaciones), accesos rápidos y las tres últimas operaciones. |
| Cotizar | Calculadora con desglose en vivo y tooltip en cada término. "Registrar" abre una hoja inferior que pide la descripción. |
| Categorías | Buscador y lista limpia (nombre y porcentaje). Tocar una fila abre una hoja inferior para editar o eliminar (con confirmación). Botón **+** en el encabezado para crear. |
| Historial | Buscador, filtros por estado (Todas, Pendientes, Pagadas, Liberadas) y lista. Estado vacío ilustrado. |

**Ajustes** no es pestaña: se abre desde el engranaje a la derecha del
encabezado. Contiene tipo de cambio, impuestos de importación (IVA y mínimo
exento), exportación (tasa de trámite) y "Cómo se calcula" con la fórmula
explicada.

Pantallas fuera de las pestañas: Ajustes, Pago, Comprobante y Detalle de operación.

### Encabezado

Barra superior propia en cada pantalla: altura generosa (16 px de margen
vertical además del área segura), logo redondeado + título a la izquierda o
flecha de volver, y acciones a la derecha (engranaje, **+**). El borde inferior
aparece solo al hacer scroll.

### Componentes reutilizables

| Componente | Uso |
|---|---|
| `BottomSheetModal` | Hoja inferior con asa, fondo oscurecido, animación con Reanimated y arrastre hacia abajo para cerrar. |
| `CenteredModal` | Diálogo centrado con transición entre contenidos (`contentKey`), para confirmaciones y el flujo de pago. |
| `InfoTooltip` | Burbuja explicativa junto a un término; el texto sale del glosario. |
| `SearchBar`, `FormInput` (vibra en error), `ActionButton` (con spinner), `Chip`, `EmptyState`, `KpiCard`, `MoneyRow`, `StatusBadge` | Piezas de interfaz comunes. |
| `toast` | Avisos breves: operación registrada, pago realizado, categoría guardada o eliminada. |

### Glosario (tooltips)

Valor en aduana, arancel, IVA, mínimo exento, flete, seguro, tasa de trámite,
tasa del día. Un solo archivo `constants/glossary.ts` con título y explicación
de cada término en lenguaje llano.

### Flujo de una operación

1. El usuario cotiza: tipo, categoría (selector con buscador), valor, flete y seguro (montos en USD).
2. El desglose se actualiza mientras escribe, en USD y en Bs. Nada se guarda todavía.
3. "Registrar operación" abre una hoja inferior con la descripción; al confirmar, la operación queda **pendiente** y se abre Pago.
4. En Pago, "Pagar" abre un diálogo: confirmar → procesando (simulado, ~1 s) → listo. La operación pasa a **pagada**, recibe número de comprobante y se muestra el comprobante.
5. Desde el detalle, "Liberar mercancía" la pasa a **liberada**.

Una operación pendiente se puede eliminar. Una pagada o liberada no se puede
editar, eliminar ni volver a pagar.

## Cálculo

Todos los cálculos se hacen en USD. Los bolívares se obtienen multiplicando cada
monto en USD por la tasa del día.

### Importación

1. Valor en aduana = valor + flete + seguro.
2. Si el valor en aduana es menor o igual al mínimo exento, el arancel es 0.
3. Si no, arancel = valor en aduana × tasa de arancel de la categoría.
4. IVA = (valor en aduana + arancel) × tasa de IVA.
5. Total = arancel + IVA.

### Exportación

Arancel 0, IVA 0. Total = tasa fija de trámite.

### Redondeo

Cada monto en USD se redondea a dos decimales. Cada monto en Bs se calcula a
partir del monto en USD ya redondeado y se redondea a dos decimales.

### Ejemplos (IVA 16 %, mínimo exento 200 USD, tasa 900 Bs/USD)

| Caso | Valor en aduana | Arancel | IVA | Total USD | Total Bs |
|---|---|---|---|---|---|
| Ropa (20 %): 100 + 20 + 5 | 125,00 | 0,00 (exento) | 20,00 | 20,00 | 18.000,00 |
| Electrónica (5 %): 300 + 30 + 10 | 340,00 | 17,00 | 57,12 | 74,12 | 66.708,00 |
| Exportación, trámite 10 USD | — | 0,00 | 0,00 | 10,00 | 9.000,00 |

## Monedas

- Los montos se ingresan en USD.
- Todo monto se muestra en ambas monedas: `$74.12` y `Bs 66.708,00`.
- La tasa del día (Bs por 1 USD) se edita en Ajustes y se ve en Inicio.
- Cada operación guarda la tasa con la que se calculó. Cambiar la tasa del día
  no altera las operaciones ya registradas.

## Datos

**Operación**

| Campo | Descripción |
|---|---|
| id | Identificador único |
| type | `import` o `export` |
| description | Texto libre |
| categoryId | Categoría elegida |
| value, freight, insurance | Montos en USD |
| breakdown | Valor en aduana, arancel, IVA y total, en USD y en Bs |
| exchangeRate | Tasa Bs/USD usada |
| status | `pending`, `paid` o `released` |
| createdAt, paidAt | Fechas |
| receiptNumber | Consecutivo `ADU-000001`, asignado al pagar |

**Categoría**: id, nombre, tasa de arancel (%).

**Configuración**: tasa de IVA (%), mínimo exento (USD), tasa de trámite de
exportación (USD), tasa del día (Bs/USD).

El desglose se guarda con la operación. Cambiar tasas o categorías después no
recalcula operaciones existentes.

### Valores iniciales

IVA 16 %, mínimo exento 200 USD, trámite de exportación 10 USD, tasa del día
900 Bs/USD. Categorías: Ropa y calzado 20 %, Electrónica 5 %, Libros 0 %,
Juguetes 15 %, Cosméticos 15 %, Otros 10 %.

## Estructura

```
app/
  _layout.tsx                    proveedores (gestos, área segura), Stack, Navbar, Toast, host de confirmación
  index.tsx
  (Views)/
    _layout.tsx
    (Home)/Home.tsx
    (Quote)/Quote.tsx
    (Categories)/Categories.tsx
    (History)/History.tsx
    (History)/OperationDetail.tsx
    (Operation)/Payment.tsx
    (Operation)/Receipt.tsx
    (Settings)/Settings.tsx
components/
  Layout/TopHeader.tsx  Navbar.tsx  Screen.tsx
  Shared/Modals/BottomSheetModal.tsx  CenteredModal.tsx  ConfirmDialogHost.tsx
  Shared/Forms/FormInput.tsx  SearchBar.tsx  Chip.tsx  OptionSheet.tsx
  Shared/Buttons/ActionButton.tsx  IconButton.tsx  InfoTooltip.tsx
  Shared/Feedback/EmptyState.tsx  AppToast.tsx
  Shared/Ui/Card.tsx  MoneyRow.tsx  StatusBadge.tsx  KpiCard.tsx  Icon.tsx
  (Views)/Home/…  Quote/…  Categories/…  History/…
Shared/Global/colors.ts           paleta (misma que tailwind.config.js)
services/taxes  services/operations  services/storage  services/toast
stores/operations  stores/rates  stores/shared (profundidad de modales, diálogo de confirmación)
hooks/shared                      useShakeOnError, useScrolled, useNavGuard
constants/defaults.ts  labels.ts  glossary.ts
types/  utils/
```

Reglas:

- La fórmula (`services/taxes`) y los stores no conocen pantallas.
- Ningún color literal en las pantallas: solo clases de la paleta (`bg-fondo`, `text-texto1`…) o `COLORS`/`BRAND` para props que no aceptan clases.
- Un modal es un componente controlado (`visible`, `onClose`); los diálogos de confirmación y los toasts se abren por función (`confirm(...)`, `toast.success(...)`) a través de un store y un host en la raíz.
- Cada componente compartido tiene una sola responsabilidad y props tipadas; nada de archivos barrel.

## Validaciones

- Valor mayor que cero; flete y seguro mayores o iguales a cero.
- Descripción y categoría obligatorias.
- Tasas porcentuales entre 0 y 100.
- Tasa del día mayor que cero.
- Mínimo exento y tasa de trámite mayores o iguales a cero.
- No se puede eliminar una categoría usada por alguna operación.
- No se puede pagar una operación que no esté pendiente, ni liberar una que no esté pagada.

Los errores se muestran junto al campo y bloquean el botón de guardar.

## Pruebas

Pruebas automáticas con Jest sobre `calculateTaxes`, formato, validaciones,
stores, resumen, navegación y los filtros de búsqueda del historial y las
categorías:

- Importación sobre el mínimo exento.
- Importación bajo el mínimo exento.
- Importación con valor en aduana exactamente igual al mínimo exento.
- Categoría con arancel 0 %.
- Exportación.
- Redondeo a dos decimales.
- Conversión a Bs con distintas tasas.

Las pantallas y el flujo completo se verifican a mano en Expo Go.
