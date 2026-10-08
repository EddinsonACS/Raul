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
- NativeWind (Tailwind) para estilos
- Zustand con persistencia en AsyncStorage
- Jest para la lógica de cálculo

## Pantallas

Cinco pestañas inferiores:

| Pestaña | Contenido |
|---|---|
| Inicio | Tablero: tasa del día, recaudado, por cobrar, pendientes, total de operaciones y las tres últimas. |
| Cotizar | Calculadora con desglose en vivo. La cotización solo se guarda al registrarla como operación. |
| Historial | Lista de operaciones con estado; al tocar una se abre su detalle. |
| Categorías | Aranceles por categoría: agregar, editar y eliminar (con confirmación). |
| Ajustes | Tipo de cambio, impuestos de importación (IVA y mínimo exento) y trámite de exportación. |

Pantallas fuera de las pestañas: Pago, Comprobante y Detalle de operación.

### Flujo de una operación

1. El usuario cotiza: tipo, categoría, valor, flete y seguro (montos en USD).
2. El desglose se actualiza mientras escribe, en USD y en Bs. Nada se guarda todavía.
3. Al escribir la descripción y registrar, la operación queda **pendiente**.
4. En Pago confirma el cobro simulado; la operación pasa a **pagada** y recibe número de comprobante.
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
  _layout.tsx
  (Views)/
    _layout.tsx
    (Home)/Home.tsx
    (Operation)/NewOperation.tsx
    (Operation)/Payment.tsx
    (Operation)/Receipt.tsx
    (History)/History.tsx
    (History)/OperationDetail.tsx
    (Admin)/Admin.tsx
components/
  Shared/
  (Views)/
services/
  taxes/calculateTaxes.ts
  storage/
stores/
  operations/
  rates/
types/
constants/
utils/
```

Responsabilidades:

- `services/taxes/calculateTaxes.ts`: función pura. Recibe los datos de la
  operación, la categoría y la configuración; devuelve el desglose. No conoce
  pantallas ni almacenamiento.
- `stores/operations`: lista de operaciones y sus cambios de estado.
- `stores/rates`: categorías y configuración.
- `services/storage`: adaptador de AsyncStorage para la persistencia de Zustand.
- `utils`: formato de USD, Bs y fechas.
- Las pantallas leen de los stores, llaman a `calculateTaxes` y muestran el resultado.

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

Pruebas automáticas con Jest sobre `calculateTaxes`:

- Importación sobre el mínimo exento.
- Importación bajo el mínimo exento.
- Importación con valor en aduana exactamente igual al mínimo exento.
- Categoría con arancel 0 %.
- Exportación.
- Redondeo a dos decimales.
- Conversión a Bs con distintas tasas.

Las pantallas y el flujo completo se verifican a mano en Expo Go.
