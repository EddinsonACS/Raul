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
| Cotizar | Calculadora con desglose en vivo y tooltips. "Registrar" abre una hoja que pide la descripción y lleva al pago. |
| Categorías | Buscador y lista de aranceles. Tocar una abre la hoja para editar o eliminar; **+** para crear. |
| Historial | Buscador, filtros por estado y detalle de cada operación. |

## Cómo se calcula

Importación:

1. Valor en aduana = valor + flete + seguro.
2. Si el valor en aduana no supera el mínimo exento, no paga arancel.
3. Arancel = valor en aduana × tasa de la categoría.
4. IVA = (valor en aduana + arancel) × tasa de IVA.
5. Total = arancel + IVA.

Exportación: paga solo una tasa fija de trámite.

Los bolívares se obtienen multiplicando cada monto en dólares por la tasa del
día. Las tasas se editan en Ajustes y los aranceles en Categorías.

## Estructura

```
app/(Views)/            pantallas (Expo Router)
components/Layout/      TopHeader, Screen, Navbar
components/Shared/      Buttons, Forms, Modals, Feedback, Ui — reutilizables
components/(Views)/     piezas propias de cada pantalla
Context/ThemeContext    tema claro/oscuro con variables (vars())
Shared/Global/colors    paleta
services/               fórmula (taxes), resumen y filtros (operations), toast
stores/                 operaciones, tasas y estado de UI (Zustand + AsyncStorage)
constants/              valores iniciales, etiquetas, glosario de tooltips
utils/                  formato, validación, texto, navegación
```

Reglas: la fórmula y los stores no conocen pantallas; ningún color literal en
pantallas (solo clases del tema o `useTheme().colors`); los modales son
componentes controlados y las confirmaciones y toasts se abren por función.
