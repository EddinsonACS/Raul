# Aduanas

App móvil escolar que calcula impuestos y aranceles de importaciones y
exportaciones menores, en dólares y en bolívares. Todo es simulado y los datos
se guardan en el teléfono.

## Cómo correrla

```bash
npm install
npm start
```

Escanea el código QR con la app Expo Go.

## Pruebas

```bash
npm test          # Jest: fórmula, formato, validaciones, stores, filtros
npx tsc --noEmit  # tipos
```

## Pantallas

| Pestaña | Contenido |
|---|---|
| Inicio | Tasa del día, indicadores, accesos rápidos y últimas operaciones. Engranaje → Ajustes. |
| Cotizar | Tipo, transporte (marítimo/aéreo/terrestre), categoría y montos con desglose en vivo y tooltips. "Registrar" abre una hoja que pide la descripción y lleva al pago. |
| Categorías | Buscador y lista con el arancel por transporte. Tocar una abre la hoja para editar o eliminar; **+** para crear. |
| Historial | Buscador, filtros por estado, tipo y transporte, y detalle de cada operación. |

## Cómo se calcula

Importación (normativa venezolana):

1. Valor en aduana (CIF) = producto + flete + seguro.
2. Si el producto no supera el mínimo exento (100 USD, Res. 3.283/1997), no paga nada.
3. Arancel = valor en aduana × arancel de la categoría para el transporte elegido.
4. Tasa por servicios de aduana = valor en aduana × 1 %.
5. IVA = (valor en aduana + arancel + tasa) × 16 %.
6. Total = arancel + tasa + IVA.

Exportación: arancel 0, IVA 0 %; paga solo una tasa fija de trámite.

Los bolívares se obtienen multiplicando cada monto en dólares por la tasa del
día. Las tasas se editan en Ajustes y los aranceles en Categorías.

## Estructura

```
app/(Views)/            pantallas (Expo Router)
components/Layout/      TopHeader, Screen, Navbar
components/Shared/      Buttons, Forms, Modals, Feedback, Ui — reutilizables
components/(Views)/     piezas propias de cada pantalla
Shared/Global/colors    paleta (misma que tailwind.config.js)
services/               fórmula (taxes), resumen y filtros (operations), toast
stores/                 operaciones, tasas y estado de UI (Zustand + AsyncStorage)
constants/              valores iniciales, etiquetas, glosario de tooltips
utils/                  formato, validación, texto, navegación
```

Reglas: la fórmula y los stores no conocen pantallas; ningún color literal en
pantallas (solo clases de la paleta o `COLORS`/`BRAND`); los modales son
componentes controlados y las confirmaciones y toasts se abren por función.
