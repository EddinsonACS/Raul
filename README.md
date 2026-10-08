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
npm test
```

## Cómo se calcula

Importación:

1. Valor en aduana = valor + flete + seguro.
2. Si el valor en aduana no supera el mínimo exento, no paga arancel.
3. Arancel = valor en aduana × tasa de la categoría.
4. IVA = (valor en aduana + arancel) × tasa de IVA.
5. Total = arancel + IVA.

Exportación: paga solo una tasa fija de trámite.

Los bolívares se obtienen multiplicando cada monto en dólares por la tasa del
día. Las tasas se editan en la pestaña Admin.
