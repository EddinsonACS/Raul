# App de Aduanas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** App móvil escolar que registra importaciones y exportaciones menores, calcula arancel e IVA en USD y Bs, simula el pago y lleva el historial.

**Architecture:** App Expo Router sin servidor. La fórmula es una función pura en `services/taxes`; dos stores de Zustand persistidos en AsyncStorage guardan operaciones y tasas; las pantallas solo leen de los stores y llaman a la fórmula. La navegación es un `Stack` con una barra inferior propia, igual que en Hablax.

**Tech Stack:** Expo (SDK más reciente, para Expo Go), React Native, TypeScript, Expo Router, NativeWind 4 + Tailwind 3, Zustand 5, AsyncStorage, Jest (`jest-expo`).

**Spec:** `docs/superpowers/specs/2026-10-08-aduanas-app-design.md`

## Global Constraints

- Raíz del proyecto: `/Users/eddinsonc/Projects/Raul`. Todos los comandos se corren ahí.
- Debe correr en Expo Go: no agregar librerías con código nativo propio (nada de MMKV, Firebase, dev client).
- Sin servidor, sin login, sin llamadas de red.
- Los montos se ingresan en USD. Todo monto se muestra en USD y en Bs.
- Formato de montos: `$74.12` y `Bs 66.708,00`.
- Todo cálculo se hace en USD; Bs = monto USD ya redondeado × tasa, redondeado a 2 decimales.
- Una operación guarda su desglose y su tasa; cambiar tasas después no la recalcula.
- Estados: `pending` → `paid` → `released`. Solo una pendiente se puede pagar o eliminar; solo una pagada se puede liberar.
- Valores iniciales: IVA 16 %, mínimo exento 200 USD, trámite de exportación 10 USD, tasa 900 Bs/USD. Categorías: Ropa y calzado 20 %, Electrónica 5 %, Libros 0 %, Juguetes 15 %, Cosméticos 15 %, Otros 10 %.
- Número de comprobante: `ADU-000001`, consecutivo, asignado al pagar.
- Textos de la interfaz en español. Identificadores de código en inglés.
- Indentación de 4 espacios, alias de imports `@/`, componentes en PascalCase con export nombrado, sin archivos barrel.
- Rutas: `/Home`, `/NewOperation`, `/Payment?id=`, `/Receipt?id=`, `/History`, `/OperationDetail?id=`, `/Admin`.

## Review Focus

- Decimal con coma (`12,5`), que es lo que escribe un teclado en español: debe leerse como 12.5. Prueba en Task 2.
- Campo numérico vacío o con texto inválido mientras se escribe: no debe aparecer `NaN` en el desglose ni guardarse la operación. Pruebas en Task 2 y Task 4.
- Doble toque en "Pagar": la operación se paga una sola vez y el consecutivo de comprobantes no salta. Prueba en Task 6.
- Cambiar la tasa del día entre registrar y pagar: la operación conserva los montos en Bs con los que se registró. Prueba en Task 6.
- Montos grandes en Bs (millones): separadores de miles correctos. Prueba en Task 2.

## File Structure

```
app/
  _layout.tsx                              raíz: estilos, Stack y Navbar
  index.tsx                                redirige a /Home
  (Views)/_layout.tsx                      Stack sin encabezado
  (Views)/(Home)/Home.tsx
  (Views)/(Operation)/NewOperation.tsx
  (Views)/(Operation)/Payment.tsx
  (Views)/(Operation)/Receipt.tsx
  (Views)/(History)/History.tsx
  (Views)/(History)/OperationDetail.tsx
  (Views)/(Admin)/Admin.tsx
components/
  Layout/Navbar.tsx
  Shared/Screen.tsx  Button.tsx  Field.tsx  Card.tsx  MoneyRow.tsx  StatusBadge.tsx
  (Views)/Operation/BreakdownCard.tsx  OperationMissing.tsx
  (Views)/History/OperationRow.tsx
services/
  taxes/calculateTaxes.ts                  fórmula pura
  operations/summary.ts                    pendientes y total recaudado
  storage/appStorage.ts                    adaptador de AsyncStorage
stores/
  rates/ratesStore.ts                      categorías y configuración
  operations/operationsStore.ts            operaciones y estados
types/operation.ts  types/rates.ts
constants/defaults.ts  constants/labels.ts
utils/format.ts  utils/validation.ts  utils/id.ts
```

---

### Task 1: Proyecto base (Expo Router + NativeWind + Jest)

**Files:**
- Create: `package.json`, `app.json`, `tsconfig.json` (vienen de la plantilla y se ajustan)
- Create: `babel.config.js`, `metro.config.js`, `tailwind.config.js`, `global.css`, `nativewind-env.d.ts`, `jest.config.js`, `jest.setup.js`
- Create: `app/_layout.tsx`, `app/index.tsx`, `app/(Views)/_layout.tsx`, `app/(Views)/(Home)/Home.tsx`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: nada.
- Produces: alias `@/` a la raíz; colores Tailwind `fondo`, `tarjeta`, `primario`, `texto1`, `texto2`, `borde`, `verde`, `amarillo`, `rojo`; `npm test` corre Jest; la ruta `/Home` existe.

- [ ] **Step 1: Crear la rama y generar la plantilla**

```bash
cd /Users/eddinsonc/Projects/Raul
git checkout -b feat/aduanas-app
SCAFFOLD="$(mktemp -d)/aduanas"
npx create-expo-app@latest "$SCAFFOLD" --template blank-typescript --no-install
rsync -a --exclude .git --exclude README.md "$SCAFFOLD/" .
rm -f App.tsx index.ts index.js
npm install
```

- [ ] **Step 2: Instalar dependencias**

```bash
npx expo install expo-router react-native-safe-area-context react-native-screens expo-linking expo-constants expo-status-bar react-native-reanimated react-native-worklets @react-native-async-storage/async-storage @expo/vector-icons
npm install nativewind zustand
npx expo install jest-expo jest @types/jest -- --save-dev
npm install --save-dev tailwindcss@^3.4.17
```

- [ ] **Step 3: Ajustar `package.json` y `app.json`**

```bash
npm pkg set main="expo-router/entry" scripts.test="jest"
node -e "const f='app.json';const j=require('./'+f);Object.assign(j.expo,{name:'Aduanas',slug:'aduanas',scheme:'aduanas',orientation:'portrait',userInterfaceStyle:'light'});j.expo.plugins=Array.from(new Set([...(j.expo.plugins||[]),'expo-router']));require('fs').writeFileSync(f,JSON.stringify(j,null,2)+'\n')"
```

- [ ] **Step 4: Escribir los archivos de configuración**

`babel.config.js`:

```js
module.exports = function (api) {
    api.cache(true);
    return {
        presets: [
            ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
            'nativewind/babel',
        ],
    };
};
```

`metro.config.js`:

```js
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: './global.css' });
```

`tailwind.config.js`:

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './app/**/*.{js,jsx,ts,tsx}',
        './components/**/*.{js,jsx,ts,tsx}',
    ],
    presets: [require('nativewind/preset')],
    theme: {
        extend: {
            colors: {
                fondo: '#F9F8FD',
                tarjeta: '#FFFFFF',
                primario: '#029AFF',
                texto1: '#111827',
                texto2: '#6B7280',
                borde: '#DEDEE2',
                verde: '#0BBE90',
                amarillo: '#F99705',
                rojo: '#FF3B30',
            },
        },
    },
    plugins: [],
};
```

`global.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`nativewind-env.d.ts`:

```ts
/// <reference types="nativewind/types" />
```

`tsconfig.json`:

```json
{
    "extends": "expo/tsconfig.base",
    "compilerOptions": {
        "strict": true,
        "paths": {
            "@/*": ["./*"]
        }
    },
    "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts", "nativewind-env.d.ts"]
}
```

`jest.config.js`:

```js
module.exports = {
    preset: 'jest-expo',
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
    },
};
```

`jest.setup.js`:

```js
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);
```

Agregar al final de `.gitignore`:

```
dist/
```

- [ ] **Step 5: Escribir las rutas iniciales**

`app/_layout.tsx`:

```tsx
import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
    );
}
```

`app/index.tsx`:

```tsx
import { Redirect } from 'expo-router';

export default function Index() {
    return <Redirect href="/Home" />;
}
```

`app/(Views)/_layout.tsx`:

```tsx
import { Stack } from 'expo-router';

export default function ViewsLayout() {
    return <Stack screenOptions={{ headerShown: false, animation: 'none' }} />;
}
```

`app/(Views)/(Home)/Home.tsx`:

```tsx
import { Text, View } from 'react-native';

export default function Home() {
    return (
        <View className="flex-1 items-center justify-center bg-fondo">
            <Text className="text-2xl font-bold text-primario">Aduanas</Text>
        </View>
    );
}
```

- [ ] **Step 6: Verificar que compila, empaqueta y que Jest arranca**

```bash
npx tsc --noEmit
npx expo export --platform android --output-dir dist
npx jest --passWithNoTests
```

Expected: `tsc` sin errores; `expo export` termina con "Exported: dist"; Jest termina con "No tests found, exiting with code 0".

Si `expo export` falla por incompatibilidad de NativeWind con el SDK instalado, correr `npx expo install --fix` y repetir. Si sigue fallando, detenerse y reportar el error exacto: no cambiar de librería de estilos sin consultar.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: proyecto base con Expo Router, NativeWind y Jest"
```

---

### Task 2: Tipos y utilidades de formato

**Files:**
- Create: `types/rates.ts`, `types/operation.ts`, `utils/format.ts`, `utils/id.ts`
- Test: `utils/__tests__/format.test.ts`

**Interfaces:**
- Consumes: nada.
- Produces:
  - Tipos `Category`, `TaxSettings`, `OperationType`, `OperationStatus`, `Money`, `TaxBreakdown`, `OperationInput`, `Operation`.
  - `parseAmount(text: string): number` (NaN si no es un número válido no negativo).
  - `parseOptionalAmount(text: string): number` (vacío = 0).
  - `formatUsd(n: number): string`, `formatBs(n: number): string`, `formatDate(iso: string): string`.
  - `createId(): string`.

- [ ] **Step 1: Escribir los tipos**

`types/rates.ts`:

```ts
export type Category = {
    id: string;
    name: string;
    /** Porcentaje de arancel, de 0 a 100. */
    tariffRate: number;
};

export type TaxSettings = {
    /** Porcentaje de IVA, de 0 a 100. */
    vatRate: number;
    /** Valor en aduana (USD) hasta el cual no se paga arancel. */
    exemptMinimum: number;
    /** Tasa fija de trámite de exportación, en USD. */
    exportFee: number;
    /** Bolívares por 1 USD. */
    exchangeRate: number;
};
```

`types/operation.ts`:

```ts
export type OperationType = 'import' | 'export';

export type OperationStatus = 'pending' | 'paid' | 'released';

export type Money = {
    usd: number;
    bs: number;
};

export type TaxBreakdown = {
    customsValue: Money;
    tariff: Money;
    vat: Money;
    total: Money;
    /** true cuando una importación no paga arancel por estar bajo el mínimo exento. */
    tariffExempt: boolean;
};

export type OperationInput = {
    type: OperationType;
    description: string;
    categoryId: string;
    value: number;
    freight: number;
    insurance: number;
};

export type Operation = OperationInput & {
    id: string;
    breakdown: TaxBreakdown;
    exchangeRate: number;
    status: OperationStatus;
    createdAt: string;
    paidAt: string | null;
    receiptNumber: string | null;
};
```

- [ ] **Step 2: Escribir la prueba que falla**

`utils/__tests__/format.test.ts`:

```ts
import { formatBs, formatDate, formatUsd, parseAmount, parseOptionalAmount } from '@/utils/format';

describe('parseAmount', () => {
    it('lee decimales con punto y con coma', () => {
        expect(parseAmount('12.5')).toBe(12.5);
        expect(parseAmount('12,5')).toBe(12.5);
        expect(parseAmount(' 300 ')).toBe(300);
        expect(parseAmount('.5')).toBe(0.5);
        expect(parseAmount('7.')).toBe(7);
    });

    it('devuelve NaN con texto vacío o inválido', () => {
        expect(parseAmount('')).toBeNaN();
        expect(parseAmount('abc')).toBeNaN();
        expect(parseAmount('-5')).toBeNaN();
        expect(parseAmount('1.234,5')).toBeNaN();
        expect(parseAmount('1e3')).toBeNaN();
    });
});

describe('parseOptionalAmount', () => {
    it('trata el campo vacío como cero', () => {
        expect(parseOptionalAmount('')).toBe(0);
        expect(parseOptionalAmount('   ')).toBe(0);
        expect(parseOptionalAmount('20')).toBe(20);
    });

    it('devuelve NaN con texto inválido', () => {
        expect(parseOptionalAmount('abc')).toBeNaN();
    });
});

describe('formatUsd', () => {
    it('usa coma de miles y punto decimal', () => {
        expect(formatUsd(74.12)).toBe('$74.12');
        expect(formatUsd(0)).toBe('$0.00');
        expect(formatUsd(1234567.5)).toBe('$1,234,567.50');
    });
});

describe('formatBs', () => {
    it('usa punto de miles y coma decimal', () => {
        expect(formatBs(66708)).toBe('Bs 66.708,00');
        expect(formatBs(0.5)).toBe('Bs 0,50');
        expect(formatBs(1234567.891)).toBe('Bs 1.234.567,89');
    });
});

describe('formatDate', () => {
    it('muestra día/mes/año y hora local', () => {
        const iso = new Date(2026, 9, 8, 14, 5).toISOString();
        expect(formatDate(iso)).toBe('08/10/2026 14:05');
    });
});
```

- [ ] **Step 3: Correr la prueba y verificar que falla**

Run: `npx jest utils/__tests__/format.test.ts`
Expected: FAIL, "Cannot find module '@/utils/format'".

- [ ] **Step 4: Implementar**

`utils/format.ts`:

```ts
const VALID_AMOUNT = /^(\d+\.?\d*|\.\d+)$/;

export function parseAmount(text: string): number {
    const normalized = text.trim().replace(',', '.');
    return VALID_AMOUNT.test(normalized) ? Number(normalized) : NaN;
}

export function parseOptionalAmount(text: string): number {
    return text.trim() === '' ? 0 : parseAmount(text);
}

function splitAmount(n: number, thousands: string): [string, string] {
    const [integer, decimals] = Math.abs(n).toFixed(2).split('.');
    return [integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousands), decimals];
}

export function formatUsd(n: number): string {
    const [integer, decimals] = splitAmount(n, ',');
    return `${n < 0 ? '-' : ''}$${integer}.${decimals}`;
}

export function formatBs(n: number): string {
    const [integer, decimals] = splitAmount(n, '.');
    return `${n < 0 ? '-' : ''}Bs ${integer},${decimals}`;
}

export function formatDate(iso: string): string {
    const date = new Date(iso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
```

`utils/id.ts`:

```ts
export function createId(): string {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}
```

- [ ] **Step 5: Correr la prueba y verificar que pasa**

Run: `npx jest utils/__tests__/format.test.ts`
Expected: PASS, 7 pruebas.

- [ ] **Step 6: Commit**

```bash
git add types utils
git commit -m "feat: tipos del dominio y utilidades de formato"
```

---

### Task 3: Fórmula de impuestos

**Files:**
- Create: `services/taxes/calculateTaxes.ts`
- Test: `services/taxes/__tests__/calculateTaxes.test.ts`

**Interfaces:**
- Consumes: `OperationInput`, `TaxBreakdown`, `Money` de `@/types/operation`; `TaxSettings` de `@/types/rates`.
- Produces:
  - `roundMoney(n: number): number`
  - `calculateTaxes(amounts: TaxableAmounts, tariffRate: number, settings: TaxSettings): TaxBreakdown`, con `TaxableAmounts = Pick<OperationInput, 'type' | 'value' | 'freight' | 'insurance'>`. `tariffRate` es el porcentaje de la categoría.

- [ ] **Step 1: Escribir la prueba que falla**

`services/taxes/__tests__/calculateTaxes.test.ts`:

```ts
import { calculateTaxes, roundMoney } from '@/services/taxes/calculateTaxes';
import type { TaxSettings } from '@/types/rates';

const SETTINGS: TaxSettings = { vatRate: 16, exemptMinimum: 200, exportFee: 10, exchangeRate: 900 };

describe('calculateTaxes: importación', () => {
    it('cobra arancel e IVA sobre el mínimo exento', () => {
        const result = calculateTaxes({ type: 'import', value: 300, freight: 30, insurance: 10 }, 5, SETTINGS);
        expect(result).toEqual({
            customsValue: { usd: 340, bs: 306000 },
            tariff: { usd: 17, bs: 15300 },
            vat: { usd: 57.12, bs: 51408 },
            total: { usd: 74.12, bs: 66708 },
            tariffExempt: false,
        });
    });

    it('no cobra arancel bajo el mínimo exento, pero sí IVA', () => {
        const result = calculateTaxes({ type: 'import', value: 100, freight: 20, insurance: 5 }, 20, SETTINGS);
        expect(result).toEqual({
            customsValue: { usd: 125, bs: 112500 },
            tariff: { usd: 0, bs: 0 },
            vat: { usd: 20, bs: 18000 },
            total: { usd: 20, bs: 18000 },
            tariffExempt: true,
        });
    });

    it('exime el arancel cuando el valor en aduana es igual al mínimo', () => {
        const result = calculateTaxes({ type: 'import', value: 150, freight: 30, insurance: 20 }, 20, SETTINGS);
        expect(result.customsValue.usd).toBe(200);
        expect(result.tariffExempt).toBe(true);
        expect(result.total).toEqual({ usd: 32, bs: 28800 });
    });

    it('cobra arancel un centavo por encima del mínimo', () => {
        const result = calculateTaxes({ type: 'import', value: 150.01, freight: 30, insurance: 20 }, 20, SETTINGS);
        expect(result.tariffExempt).toBe(false);
        expect(result.tariff.usd).toBe(40);
        expect(result.total).toEqual({ usd: 78.4, bs: 70560 });
    });

    it('con categoría de 0 % cobra solo IVA y no la marca como exenta', () => {
        const result = calculateTaxes({ type: 'import', value: 500, freight: 0, insurance: 0 }, 0, SETTINGS);
        expect(result.tariff.usd).toBe(0);
        expect(result.tariffExempt).toBe(false);
        expect(result.total).toEqual({ usd: 80, bs: 72000 });
    });

    it('redondea cada monto a dos decimales', () => {
        const settings = { ...SETTINGS, exemptMinimum: 0, exchangeRate: 40.25 };
        const result = calculateTaxes({ type: 'import', value: 33.33, freight: 0, insurance: 0 }, 15, settings);
        expect(result).toEqual({
            customsValue: { usd: 33.33, bs: 1341.53 },
            tariff: { usd: 5, bs: 201.25 },
            vat: { usd: 6.13, bs: 246.73 },
            total: { usd: 11.13, bs: 447.98 },
            tariffExempt: false,
        });
    });

    it('no arrastra errores de coma flotante al sumar', () => {
        const settings = { ...SETTINGS, exemptMinimum: 0 };
        const result = calculateTaxes({ type: 'import', value: 0.1, freight: 0.2, insurance: 0 }, 10, settings);
        expect(result.customsValue.usd).toBe(0.3);
    });

    it('convierte a Bs con la tasa recibida', () => {
        const settings = { ...SETTINGS, exchangeRate: 950 };
        const result = calculateTaxes({ type: 'import', value: 300, freight: 30, insurance: 10 }, 5, settings);
        expect(result.total).toEqual({ usd: 74.12, bs: 70414 });
    });
});

describe('calculateTaxes: exportación', () => {
    it('cobra solo la tasa de trámite', () => {
        const result = calculateTaxes({ type: 'export', value: 1000, freight: 50, insurance: 0 }, 20, SETTINGS);
        expect(result).toEqual({
            customsValue: { usd: 1050, bs: 945000 },
            tariff: { usd: 0, bs: 0 },
            vat: { usd: 0, bs: 0 },
            total: { usd: 10, bs: 9000 },
            tariffExempt: false,
        });
    });
});

describe('roundMoney', () => {
    it('redondea a dos decimales', () => {
        expect(roundMoney(4.9995)).toBe(5);
        expect(roundMoney(6.1328)).toBe(6.13);
    });
});
```

- [ ] **Step 2: Correr la prueba y verificar que falla**

Run: `npx jest services/taxes`
Expected: FAIL, "Cannot find module '@/services/taxes/calculateTaxes'".

- [ ] **Step 3: Implementar**

`services/taxes/calculateTaxes.ts`:

```ts
import type { Money, OperationInput, TaxBreakdown } from '@/types/operation';
import type { TaxSettings } from '@/types/rates';

export type TaxableAmounts = Pick<OperationInput, 'type' | 'value' | 'freight' | 'insurance'>;

export function roundMoney(n: number): number {
    return Math.round((n + Number.EPSILON) * 100) / 100;
}

function toMoney(usd: number, exchangeRate: number): Money {
    const rounded = roundMoney(usd);
    return { usd: rounded, bs: roundMoney(rounded * exchangeRate) };
}

export function calculateTaxes(amounts: TaxableAmounts, tariffRate: number, settings: TaxSettings): TaxBreakdown {
    const { exchangeRate } = settings;
    const customsUsd = roundMoney(amounts.value + amounts.freight + amounts.insurance);

    if (amounts.type === 'export') {
        return {
            customsValue: toMoney(customsUsd, exchangeRate),
            tariff: toMoney(0, exchangeRate),
            vat: toMoney(0, exchangeRate),
            total: toMoney(settings.exportFee, exchangeRate),
            tariffExempt: false,
        };
    }

    const tariffExempt = customsUsd <= settings.exemptMinimum;
    const tariffUsd = tariffExempt ? 0 : roundMoney((customsUsd * tariffRate) / 100);
    const vatUsd = roundMoney(((customsUsd + tariffUsd) * settings.vatRate) / 100);

    return {
        customsValue: toMoney(customsUsd, exchangeRate),
        tariff: toMoney(tariffUsd, exchangeRate),
        vat: toMoney(vatUsd, exchangeRate),
        total: toMoney(tariffUsd + vatUsd, exchangeRate),
        tariffExempt,
    };
}
```

- [ ] **Step 4: Correr la prueba y verificar que pasa**

Run: `npx jest services/taxes`
Expected: PASS, 10 pruebas.

- [ ] **Step 5: Commit**

```bash
git add services/taxes
git commit -m "feat: formula de arancel, IVA y conversion a bolivares"
```

---

### Task 4: Validaciones

**Files:**
- Create: `utils/validation.ts`
- Test: `utils/__tests__/validation.test.ts`

**Interfaces:**
- Consumes: `TaxSettings` de `@/types/rates`.
- Produces:
  - `validateOperation(form: OperationForm): OperationErrors`, con `OperationForm = { description: string; categoryId: string | null; value: number; freight: number; insurance: number }` y `OperationErrors = Partial<Record<'description' | 'categoryId' | 'value' | 'freight' | 'insurance', string>>`.
  - `validateSettings(settings: TaxSettings): SettingsErrors`, con `SettingsErrors = Partial<Record<keyof TaxSettings, string>>`.
  - `validateCategory(form: { name: string; tariffRate: number }): CategoryErrors`, con `CategoryErrors = Partial<Record<'name' | 'tariffRate', string>>`.
  - Un objeto vacío significa que no hay errores. Los números inválidos llegan como `NaN`.

- [ ] **Step 1: Escribir la prueba que falla**

`utils/__tests__/validation.test.ts`:

```ts
import { validateCategory, validateOperation, validateSettings } from '@/utils/validation';

const VALID_FORM = { description: 'Teléfono', categoryId: 'cat-1', value: 300, freight: 30, insurance: 0 };

describe('validateOperation', () => {
    it('acepta un formulario completo', () => {
        expect(validateOperation(VALID_FORM)).toEqual({});
    });

    it('exige descripción y categoría', () => {
        const errors = validateOperation({ ...VALID_FORM, description: '   ', categoryId: null });
        expect(errors.description).toBe('Escribe una descripción.');
        expect(errors.categoryId).toBe('Elige una categoría.');
    });

    it('exige un valor mayor que cero', () => {
        expect(validateOperation({ ...VALID_FORM, value: 0 }).value).toBe('El valor debe ser mayor que cero.');
        expect(validateOperation({ ...VALID_FORM, value: NaN }).value).toBe('El valor debe ser mayor que cero.');
    });

    it('rechaza flete y seguro inválidos pero acepta cero', () => {
        const errors = validateOperation({ ...VALID_FORM, freight: NaN, insurance: NaN });
        expect(errors.freight).toBe('Escribe un monto válido.');
        expect(errors.insurance).toBe('Escribe un monto válido.');
        expect(validateOperation({ ...VALID_FORM, freight: 0, insurance: 0 })).toEqual({});
    });
});

describe('validateSettings', () => {
    const VALID = { vatRate: 16, exemptMinimum: 200, exportFee: 10, exchangeRate: 900 };

    it('acepta la configuración inicial y los ceros permitidos', () => {
        expect(validateSettings(VALID)).toEqual({});
        expect(validateSettings({ vatRate: 0, exemptMinimum: 0, exportFee: 0, exchangeRate: 1 })).toEqual({});
    });

    it('exige IVA entre 0 y 100', () => {
        expect(validateSettings({ ...VALID, vatRate: 101 }).vatRate).toBe('Debe estar entre 0 y 100.');
        expect(validateSettings({ ...VALID, vatRate: NaN }).vatRate).toBe('Debe estar entre 0 y 100.');
    });

    it('exige tasa del día mayor que cero', () => {
        expect(validateSettings({ ...VALID, exchangeRate: 0 }).exchangeRate).toBe('Debe ser mayor que cero.');
        expect(validateSettings({ ...VALID, exchangeRate: NaN }).exchangeRate).toBe('Debe ser mayor que cero.');
    });

    it('rechaza mínimo exento y trámite inválidos', () => {
        const errors = validateSettings({ ...VALID, exemptMinimum: NaN, exportFee: NaN });
        expect(errors.exemptMinimum).toBe('Escribe un monto válido.');
        expect(errors.exportFee).toBe('Escribe un monto válido.');
    });
});

describe('validateCategory', () => {
    it('acepta nombre y tasa válidos, incluido 0 y 100', () => {
        expect(validateCategory({ name: 'Libros', tariffRate: 0 })).toEqual({});
        expect(validateCategory({ name: 'Lujo', tariffRate: 100 })).toEqual({});
    });

    it('exige nombre y tasa entre 0 y 100', () => {
        const errors = validateCategory({ name: ' ', tariffRate: 150 });
        expect(errors.name).toBe('Escribe un nombre.');
        expect(errors.tariffRate).toBe('Debe estar entre 0 y 100.');
        expect(validateCategory({ name: 'X', tariffRate: NaN }).tariffRate).toBe('Debe estar entre 0 y 100.');
    });
});
```

- [ ] **Step 2: Correr la prueba y verificar que falla**

Run: `npx jest utils/__tests__/validation.test.ts`
Expected: FAIL, "Cannot find module '@/utils/validation'".

- [ ] **Step 3: Implementar**

`utils/validation.ts`:

```ts
import type { TaxSettings } from '@/types/rates';

export type OperationForm = {
    description: string;
    categoryId: string | null;
    value: number;
    freight: number;
    insurance: number;
};

export type OperationErrors = Partial<Record<'description' | 'categoryId' | 'value' | 'freight' | 'insurance', string>>;
export type SettingsErrors = Partial<Record<keyof TaxSettings, string>>;
export type CategoryErrors = Partial<Record<'name' | 'tariffRate', string>>;

const INVALID_AMOUNT = 'Escribe un monto válido.';
const INVALID_PERCENT = 'Debe estar entre 0 y 100.';

const isAmount = (n: number) => Number.isFinite(n) && n >= 0;
const isPercent = (n: number) => Number.isFinite(n) && n >= 0 && n <= 100;

export function validateOperation(form: OperationForm): OperationErrors {
    const errors: OperationErrors = {};
    if (form.description.trim() === '') errors.description = 'Escribe una descripción.';
    if (!form.categoryId) errors.categoryId = 'Elige una categoría.';
    if (!(Number.isFinite(form.value) && form.value > 0)) errors.value = 'El valor debe ser mayor que cero.';
    if (!isAmount(form.freight)) errors.freight = INVALID_AMOUNT;
    if (!isAmount(form.insurance)) errors.insurance = INVALID_AMOUNT;
    return errors;
}

export function validateSettings(settings: TaxSettings): SettingsErrors {
    const errors: SettingsErrors = {};
    if (!isPercent(settings.vatRate)) errors.vatRate = INVALID_PERCENT;
    if (!isAmount(settings.exemptMinimum)) errors.exemptMinimum = INVALID_AMOUNT;
    if (!isAmount(settings.exportFee)) errors.exportFee = INVALID_AMOUNT;
    if (!(Number.isFinite(settings.exchangeRate) && settings.exchangeRate > 0)) {
        errors.exchangeRate = 'Debe ser mayor que cero.';
    }
    return errors;
}

export function validateCategory(form: { name: string; tariffRate: number }): CategoryErrors {
    const errors: CategoryErrors = {};
    if (form.name.trim() === '') errors.name = 'Escribe un nombre.';
    if (!isPercent(form.tariffRate)) errors.tariffRate = INVALID_PERCENT;
    return errors;
}
```

- [ ] **Step 4: Correr la prueba y verificar que pasa**

Run: `npx jest utils/__tests__/validation.test.ts`
Expected: PASS, 10 pruebas.

- [ ] **Step 5: Commit**

```bash
git add utils
git commit -m "feat: validaciones de operacion, tasas y categorias"
```

---

### Task 5: Store de tasas y categorías

**Files:**
- Create: `constants/defaults.ts`, `services/storage/appStorage.ts`, `stores/rates/ratesStore.ts`
- Test: `stores/rates/__tests__/ratesStore.test.ts`

**Interfaces:**
- Consumes: `Category`, `TaxSettings` de `@/types/rates`; `Operation` de `@/types/operation`; `createId` de `@/utils/id`.
- Produces:
  - `DEFAULT_SETTINGS: TaxSettings`, `DEFAULT_CATEGORIES: Category[]`.
  - `appStorage`: almacenamiento JSON de Zustand sobre AsyncStorage.
  - `useRatesStore` con estado `{ categories: Category[]; settings: TaxSettings }` y acciones:
    - `updateSettings(settings: TaxSettings): void`
    - `addCategory(name: string, tariffRate: number): void`
    - `updateCategory(id: string, name: string, tariffRate: number): void`
    - `removeCategory(id: string, operations: Pick<Operation, 'categoryId'>[]): boolean` (false y no borra si alguna operación la usa).

- [ ] **Step 1: Escribir la prueba que falla**

`stores/rates/__tests__/ratesStore.test.ts`:

```ts
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/constants/defaults';
import { useRatesStore } from '@/stores/rates/ratesStore';

beforeEach(() => {
    useRatesStore.setState(useRatesStore.getInitialState(), true);
});

describe('ratesStore', () => {
    it('arranca con las tasas y categorías de ejemplo', () => {
        const { settings, categories } = useRatesStore.getState();
        expect(settings).toEqual({ vatRate: 16, exemptMinimum: 200, exportFee: 10, exchangeRate: 900 });
        expect(settings).toEqual(DEFAULT_SETTINGS);
        expect(categories).toEqual(DEFAULT_CATEGORIES);
        expect(categories.map((c) => [c.name, c.tariffRate])).toEqual([
            ['Ropa y calzado', 20],
            ['Electrónica', 5],
            ['Libros', 0],
            ['Juguetes', 15],
            ['Cosméticos', 15],
            ['Otros', 10],
        ]);
    });

    it('actualiza la configuración', () => {
        useRatesStore.getState().updateSettings({ ...DEFAULT_SETTINGS, exchangeRate: 950 });
        expect(useRatesStore.getState().settings.exchangeRate).toBe(950);
    });

    it('agrega una categoría con el nombre sin espacios sobrantes', () => {
        useRatesStore.getState().addCategory('  Repuestos ', 12);
        const added = useRatesStore.getState().categories.at(-1);
        expect(added?.name).toBe('Repuestos');
        expect(added?.tariffRate).toBe(12);
        expect(added?.id).toBeTruthy();
        expect(useRatesStore.getState().categories).toHaveLength(7);
    });

    it('edita una categoría existente', () => {
        const target = useRatesStore.getState().categories[0];
        useRatesStore.getState().updateCategory(target.id, 'Ropa', 25);
        expect(useRatesStore.getState().categories[0]).toEqual({ id: target.id, name: 'Ropa', tariffRate: 25 });
    });

    it('elimina una categoría que nadie usa', () => {
        const target = useRatesStore.getState().categories[0];
        expect(useRatesStore.getState().removeCategory(target.id, [])).toBe(true);
        expect(useRatesStore.getState().categories.find((c) => c.id === target.id)).toBeUndefined();
    });

    it('no elimina una categoría usada por una operación', () => {
        const target = useRatesStore.getState().categories[0];
        expect(useRatesStore.getState().removeCategory(target.id, [{ categoryId: target.id }])).toBe(false);
        expect(useRatesStore.getState().categories).toHaveLength(6);
    });
});
```

- [ ] **Step 2: Correr la prueba y verificar que falla**

Run: `npx jest stores/rates`
Expected: FAIL, "Cannot find module '@/constants/defaults'".

- [ ] **Step 3: Implementar**

`constants/defaults.ts`:

```ts
import type { Category, TaxSettings } from '@/types/rates';

export const DEFAULT_SETTINGS: TaxSettings = {
    vatRate: 16,
    exemptMinimum: 200,
    exportFee: 10,
    exchangeRate: 900,
};

export const DEFAULT_CATEGORIES: Category[] = [
    { id: 'cat-ropa', name: 'Ropa y calzado', tariffRate: 20 },
    { id: 'cat-electronica', name: 'Electrónica', tariffRate: 5 },
    { id: 'cat-libros', name: 'Libros', tariffRate: 0 },
    { id: 'cat-juguetes', name: 'Juguetes', tariffRate: 15 },
    { id: 'cat-cosmeticos', name: 'Cosméticos', tariffRate: 15 },
    { id: 'cat-otros', name: 'Otros', tariffRate: 10 },
];
```

`services/storage/appStorage.ts`:

```ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage } from 'zustand/middleware';

export const appStorage = createJSONStorage(() => AsyncStorage);
```

`stores/rates/ratesStore.ts`:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { DEFAULT_CATEGORIES, DEFAULT_SETTINGS } from '@/constants/defaults';
import { appStorage } from '@/services/storage/appStorage';
import type { Operation } from '@/types/operation';
import type { Category, TaxSettings } from '@/types/rates';
import { createId } from '@/utils/id';

type RatesState = {
    categories: Category[];
    settings: TaxSettings;
    updateSettings: (settings: TaxSettings) => void;
    addCategory: (name: string, tariffRate: number) => void;
    updateCategory: (id: string, name: string, tariffRate: number) => void;
    removeCategory: (id: string, operations: Pick<Operation, 'categoryId'>[]) => boolean;
};

export const useRatesStore = create<RatesState>()(
    persist(
        (set) => ({
            categories: DEFAULT_CATEGORIES,
            settings: DEFAULT_SETTINGS,
            updateSettings: (settings) => set({ settings }),
            addCategory: (name, tariffRate) =>
                set((state) => ({
                    categories: [...state.categories, { id: createId(), name: name.trim(), tariffRate }],
                })),
            updateCategory: (id, name, tariffRate) =>
                set((state) => ({
                    categories: state.categories.map((category) =>
                        category.id === id ? { id, name: name.trim(), tariffRate } : category
                    ),
                })),
            removeCategory: (id, operations) => {
                if (operations.some((operation) => operation.categoryId === id)) return false;
                set((state) => ({ categories: state.categories.filter((category) => category.id !== id) }));
                return true;
            },
        }),
        { name: 'aduanas-rates', storage: appStorage }
    )
);
```

- [ ] **Step 4: Correr la prueba y verificar que pasa**

Run: `npx jest stores/rates`
Expected: PASS, 6 pruebas.

- [ ] **Step 5: Commit**

```bash
git add constants services/storage stores/rates
git commit -m "feat: store persistente de tasas y categorias"
```

---

### Task 6: Store de operaciones y resumen

**Files:**
- Create: `stores/operations/operationsStore.ts`, `services/operations/summary.ts`
- Test: `stores/operations/__tests__/operationsStore.test.ts`, `services/operations/__tests__/summary.test.ts`

**Interfaces:**
- Consumes: `calculateTaxes`, `roundMoney` de `@/services/taxes/calculateTaxes`; `appStorage`; `createId`; tipos de `@/types/operation` y `@/types/rates`.
- Produces:
  - `useOperationsStore` con estado `{ operations: Operation[]; receiptCounter: number }` (las más nuevas primero) y acciones:
    - `addOperation(input: OperationInput, tariffRate: number, settings: TaxSettings): Operation`
    - `payOperation(id: string): boolean` (true solo si estaba pendiente)
    - `releaseOperation(id: string): boolean` (true solo si estaba pagada)
    - `removeOperation(id: string): boolean` (true solo si estaba pendiente)
  - `summarizeOperations(operations: Operation[]): { pendingCount: number; collected: Money }`, donde `collected` suma los totales de las operaciones pagadas y liberadas.

- [ ] **Step 1: Escribir las pruebas que fallan**

`stores/operations/__tests__/operationsStore.test.ts`:

```ts
import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import type { OperationInput } from '@/types/operation';

const INPUT: OperationInput = {
    type: 'import',
    description: 'Teléfono',
    categoryId: 'cat-electronica',
    value: 300,
    freight: 30,
    insurance: 10,
};

const store = () => useOperationsStore.getState();
const add = () => store().addOperation(INPUT, 5, DEFAULT_SETTINGS);

beforeEach(() => {
    useOperationsStore.setState(useOperationsStore.getInitialState(), true);
});

describe('operationsStore', () => {
    it('registra una operación pendiente con su desglose y su tasa', () => {
        const operation = add();
        expect(operation.status).toBe('pending');
        expect(operation.receiptNumber).toBeNull();
        expect(operation.paidAt).toBeNull();
        expect(operation.exchangeRate).toBe(900);
        expect(operation.breakdown.total).toEqual({ usd: 74.12, bs: 66708 });
        expect(store().operations).toEqual([operation]);
    });

    it('pone las operaciones nuevas primero', () => {
        const first = add();
        const second = add();
        expect(store().operations.map((o) => o.id)).toEqual([second.id, first.id]);
    });

    it('paga una operación pendiente y le asigna comprobante', () => {
        const { id } = add();
        expect(store().payOperation(id)).toBe(true);
        const paid = store().operations[0];
        expect(paid.status).toBe('paid');
        expect(paid.receiptNumber).toBe('ADU-000001');
        expect(paid.paidAt).not.toBeNull();
    });

    it('no paga dos veces ni salta el consecutivo', () => {
        const first = add();
        expect(store().payOperation(first.id)).toBe(true);
        expect(store().payOperation(first.id)).toBe(false);
        expect(store().receiptCounter).toBe(1);

        const second = add();
        store().payOperation(second.id);
        expect(store().operations.find((o) => o.id === second.id)?.receiptNumber).toBe('ADU-000002');
    });

    it('libera solo una operación pagada', () => {
        const { id } = add();
        expect(store().releaseOperation(id)).toBe(false);
        store().payOperation(id);
        expect(store().releaseOperation(id)).toBe(true);
        expect(store().operations[0].status).toBe('released');
        expect(store().releaseOperation(id)).toBe(false);
    });

    it('elimina solo una operación pendiente', () => {
        const pending = add();
        const paid = add();
        store().payOperation(paid.id);
        expect(store().removeOperation(paid.id)).toBe(false);
        expect(store().removeOperation(pending.id)).toBe(true);
        expect(store().operations.map((o) => o.id)).toEqual([paid.id]);
    });

    it('devuelve false con un id que no existe', () => {
        expect(store().payOperation('nope')).toBe(false);
        expect(store().releaseOperation('nope')).toBe(false);
        expect(store().removeOperation('nope')).toBe(false);
    });

    it('conserva los montos aunque la tasa cambie antes de pagar', () => {
        const first = add();
        const second = store().addOperation(INPUT, 5, { ...DEFAULT_SETTINGS, exchangeRate: 950 });
        store().payOperation(first.id);
        const stored = store().operations.find((o) => o.id === first.id);
        expect(stored?.exchangeRate).toBe(900);
        expect(stored?.breakdown.total.bs).toBe(66708);
        expect(second.breakdown.total.bs).toBe(70414);
    });
});
```

`services/operations/__tests__/summary.test.ts`:

```ts
import { DEFAULT_SETTINGS } from '@/constants/defaults';
import { summarizeOperations } from '@/services/operations/summary';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import type { OperationInput } from '@/types/operation';

const INPUT: OperationInput = {
    type: 'import',
    description: 'Teléfono',
    categoryId: 'cat-electronica',
    value: 300,
    freight: 30,
    insurance: 10,
};

beforeEach(() => {
    useOperationsStore.setState(useOperationsStore.getInitialState(), true);
});

describe('summarizeOperations', () => {
    it('devuelve ceros sin operaciones', () => {
        expect(summarizeOperations([])).toEqual({ pendingCount: 0, collected: { usd: 0, bs: 0 } });
    });

    it('cuenta pendientes y suma lo pagado y lo liberado', () => {
        const store = useOperationsStore.getState();
        store.addOperation(INPUT, 5, DEFAULT_SETTINGS);
        const paid = store.addOperation(INPUT, 5, DEFAULT_SETTINGS);
        const released = store.addOperation(INPUT, 5, DEFAULT_SETTINGS);
        store.payOperation(paid.id);
        store.payOperation(released.id);
        store.releaseOperation(released.id);

        expect(summarizeOperations(useOperationsStore.getState().operations)).toEqual({
            pendingCount: 1,
            collected: { usd: 148.24, bs: 133416 },
        });
    });
});
```

- [ ] **Step 2: Correr las pruebas y verificar que fallan**

Run: `npx jest stores/operations services/operations`
Expected: FAIL, "Cannot find module '@/stores/operations/operationsStore'".

- [ ] **Step 3: Implementar**

`stores/operations/operationsStore.ts`:

```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { appStorage } from '@/services/storage/appStorage';
import { calculateTaxes } from '@/services/taxes/calculateTaxes';
import type { Operation, OperationInput, OperationStatus } from '@/types/operation';
import type { TaxSettings } from '@/types/rates';
import { createId } from '@/utils/id';

type OperationsState = {
    operations: Operation[];
    receiptCounter: number;
    addOperation: (input: OperationInput, tariffRate: number, settings: TaxSettings) => Operation;
    payOperation: (id: string) => boolean;
    releaseOperation: (id: string) => boolean;
    removeOperation: (id: string) => boolean;
};

const formatReceipt = (n: number) => `ADU-${String(n).padStart(6, '0')}`;

export const useOperationsStore = create<OperationsState>()(
    persist(
        (set, get) => {
            const hasStatus = (id: string, status: OperationStatus) =>
                get().operations.some((operation) => operation.id === id && operation.status === status);

            return {
                operations: [],
                receiptCounter: 0,
                addOperation: (input, tariffRate, settings) => {
                    const operation: Operation = {
                        ...input,
                        id: createId(),
                        breakdown: calculateTaxes(input, tariffRate, settings),
                        exchangeRate: settings.exchangeRate,
                        status: 'pending',
                        createdAt: new Date().toISOString(),
                        paidAt: null,
                        receiptNumber: null,
                    };
                    set((state) => ({ operations: [operation, ...state.operations] }));
                    return operation;
                },
                payOperation: (id) => {
                    if (!hasStatus(id, 'pending')) return false;
                    set((state) => {
                        const receiptCounter = state.receiptCounter + 1;
                        return {
                            receiptCounter,
                            operations: state.operations.map((operation) =>
                                operation.id === id
                                    ? {
                                          ...operation,
                                          status: 'paid',
                                          paidAt: new Date().toISOString(),
                                          receiptNumber: formatReceipt(receiptCounter),
                                      }
                                    : operation
                            ),
                        };
                    });
                    return true;
                },
                releaseOperation: (id) => {
                    if (!hasStatus(id, 'paid')) return false;
                    set((state) => ({
                        operations: state.operations.map((operation) =>
                            operation.id === id ? { ...operation, status: 'released' } : operation
                        ),
                    }));
                    return true;
                },
                removeOperation: (id) => {
                    if (!hasStatus(id, 'pending')) return false;
                    set((state) => ({ operations: state.operations.filter((operation) => operation.id !== id) }));
                    return true;
                },
            };
        },
        { name: 'aduanas-operations', storage: appStorage }
    )
);
```

`services/operations/summary.ts`:

```ts
import { roundMoney } from '@/services/taxes/calculateTaxes';
import type { Money, Operation } from '@/types/operation';

export type OperationsSummary = {
    pendingCount: number;
    collected: Money;
};

export function summarizeOperations(operations: Operation[]): OperationsSummary {
    let pendingCount = 0;
    let usd = 0;
    let bs = 0;
    for (const operation of operations) {
        if (operation.status === 'pending') {
            pendingCount += 1;
        } else {
            usd += operation.breakdown.total.usd;
            bs += operation.breakdown.total.bs;
        }
    }
    return { pendingCount, collected: { usd: roundMoney(usd), bs: roundMoney(bs) } };
}
```

- [ ] **Step 4: Correr las pruebas y verificar que pasan**

Run: `npx jest stores/operations services/operations`
Expected: PASS, 10 pruebas.

- [ ] **Step 5: Correr toda la suite**

Run: `npx jest`
Expected: PASS, 43 pruebas en 6 archivos.

- [ ] **Step 6: Commit**

```bash
git add stores/operations services/operations
git commit -m "feat: store de operaciones con pago, liberacion y resumen"
```

---

### Task 7: Componentes compartidos y barra de navegación

**Files:**
- Create: `constants/labels.ts`
- Create: `components/Shared/Screen.tsx`, `components/Shared/Button.tsx`, `components/Shared/Field.tsx`, `components/Shared/Card.tsx`, `components/Shared/MoneyRow.tsx`, `components/Shared/StatusBadge.tsx`
- Create: `components/(Views)/Operation/BreakdownCard.tsx`, `components/(Views)/Operation/OperationMissing.tsx`, `components/(Views)/History/OperationRow.tsx`
- Create: `components/Layout/Navbar.tsx`
- Modify: `app/_layout.tsx`

**Interfaces:**
- Consumes: tipos de `@/types/operation`; `formatUsd`, `formatBs`, `formatDate` de `@/utils/format`.
- Produces:
  - `TYPE_LABELS: Record<OperationType, string>`, `STATUS_LABELS: Record<OperationStatus, string>`.
  - `<Screen title onBack?>`: encabezado y contenido con scroll.
  - `<Button label onPress variant? disabled?>`, con `variant: 'primary' | 'secondary' | 'danger'`.
  - `<Field label value onChangeText error? placeholder? numeric?>`.
  - `<Card>`.
  - `<MoneyRow label amount strong? note?>`, con `amount: Money`.
  - `<StatusBadge status>`.
  - `<BreakdownCard type breakdown exchangeRate>`.
  - `<OperationMissing />`.
  - `<OperationRow operation categoryName onPress>`.
  - `<Navbar />`.

- [ ] **Step 1: Escribir las etiquetas**

`constants/labels.ts`:

```ts
import type { OperationStatus, OperationType } from '@/types/operation';

export const TYPE_LABELS: Record<OperationType, string> = {
    import: 'Importación',
    export: 'Exportación',
};

export const STATUS_LABELS: Record<OperationStatus, string> = {
    pending: 'Pendiente',
    paid: 'Pagada',
    released: 'Liberada',
};
```

- [ ] **Step 2: Escribir los componentes compartidos**

`components/Shared/Screen.tsx`:

```tsx
import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ScreenProps = {
    title: string;
    children: ReactNode;
    onBack?: () => void;
};

export function Screen({ title, children, onBack }: ScreenProps) {
    const insets = useSafeAreaInsets();

    return (
        <KeyboardAvoidingView
            className="flex-1 bg-fondo"
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View
                style={{ paddingTop: insets.top + 8 }}
                className="flex-row items-center gap-2 border-b border-borde bg-tarjeta px-4 pb-3"
            >
                {onBack && (
                    <Pressable onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Volver">
                        <Ionicons name="chevron-back" size={24} color="#111827" />
                    </Pressable>
                )}
                <Text className="text-xl font-bold text-texto1">{title}</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} keyboardShouldPersistTaps="handled">
                {children}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
```

`components/Shared/Button.tsx`:

```tsx
import { Pressable, Text } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'danger';

type ButtonProps = {
    label: string;
    onPress: () => void;
    variant?: ButtonVariant;
    disabled?: boolean;
};

const CONTAINER: Record<ButtonVariant, string> = {
    primary: 'bg-primario',
    secondary: 'border border-borde bg-tarjeta',
    danger: 'border border-rojo bg-tarjeta',
};

const LABEL: Record<ButtonVariant, string> = {
    primary: 'text-white',
    secondary: 'text-texto1',
    danger: 'text-rojo',
};

export function Button({ label, onPress, variant = 'primary', disabled = false }: ButtonProps) {
    return (
        <Pressable
            onPress={onPress}
            disabled={disabled}
            accessibilityRole="button"
            className={`items-center rounded-xl px-4 py-3 ${CONTAINER[variant]} ${disabled ? 'opacity-40' : ''}`}
        >
            <Text className={`text-base font-semibold ${LABEL[variant]}`}>{label}</Text>
        </Pressable>
    );
}
```

`components/Shared/Field.tsx`:

```tsx
import { Text, TextInput, View } from 'react-native';

type FieldProps = {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    error?: string;
    placeholder?: string;
    numeric?: boolean;
};

export function Field({ label, value, onChangeText, error, placeholder, numeric = false }: FieldProps) {
    return (
        <View className="gap-1">
            <Text className="text-sm font-medium text-texto1">{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChangeText}
                placeholder={placeholder}
                placeholderTextColor="#9CA3AF"
                keyboardType={numeric ? 'decimal-pad' : 'default'}
                accessibilityLabel={label}
                className={`rounded-xl border bg-tarjeta px-3 py-3 text-base text-texto1 ${error ? 'border-rojo' : 'border-borde'}`}
            />
            {error ? <Text className="text-sm text-rojo">{error}</Text> : null}
        </View>
    );
}
```

`components/Shared/Card.tsx`:

```tsx
import type { ReactNode } from 'react';
import { View } from 'react-native';

export function Card({ children }: { children: ReactNode }) {
    return <View className="gap-2 rounded-2xl border border-borde bg-tarjeta p-4">{children}</View>;
}
```

`components/Shared/MoneyRow.tsx`:

```tsx
import { Text, View } from 'react-native';
import type { Money } from '@/types/operation';
import { formatBs, formatUsd } from '@/utils/format';

type MoneyRowProps = {
    label: string;
    amount: Money;
    strong?: boolean;
    note?: string;
};

export function MoneyRow({ label, amount, strong = false, note }: MoneyRowProps) {
    return (
        <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1">
                <Text className={`text-base text-texto1 ${strong ? 'font-bold' : ''}`}>{label}</Text>
                {note ? <Text className="text-sm text-verde">{note}</Text> : null}
            </View>
            <View className="items-end">
                <Text className={`text-base text-texto1 ${strong ? 'font-bold' : ''}`}>{formatUsd(amount.usd)}</Text>
                <Text className="text-sm text-texto2">{formatBs(amount.bs)}</Text>
            </View>
        </View>
    );
}
```

`components/Shared/StatusBadge.tsx`:

```tsx
import { Text, View } from 'react-native';
import { STATUS_LABELS } from '@/constants/labels';
import type { OperationStatus } from '@/types/operation';

const BACKGROUND: Record<OperationStatus, string> = {
    pending: 'bg-amarillo',
    paid: 'bg-primario',
    released: 'bg-verde',
};

export function StatusBadge({ status }: { status: OperationStatus }) {
    return (
        <View className={`self-start rounded-full px-3 py-1 ${BACKGROUND[status]}`}>
            <Text className="text-xs font-semibold text-white">{STATUS_LABELS[status]}</Text>
        </View>
    );
}
```

- [ ] **Step 3: Escribir los componentes de las vistas**

`components/(Views)/Operation/BreakdownCard.tsx`:

```tsx
import { Text, View } from 'react-native';
import { Card } from '@/components/Shared/Card';
import { MoneyRow } from '@/components/Shared/MoneyRow';
import type { OperationType, TaxBreakdown } from '@/types/operation';
import { formatBs } from '@/utils/format';

type BreakdownCardProps = {
    type: OperationType;
    breakdown: TaxBreakdown;
    exchangeRate: number;
};

export function BreakdownCard({ type, breakdown, exchangeRate }: BreakdownCardProps) {
    return (
        <Card>
            <Text className="text-sm font-semibold text-texto2">Desglose</Text>
            <MoneyRow label="Valor en aduana" amount={breakdown.customsValue} />
            {type === 'import' ? (
                <>
                    <MoneyRow
                        label="Arancel"
                        amount={breakdown.tariff}
                        note={breakdown.tariffExempt ? 'Exento por monto mínimo' : undefined}
                    />
                    <MoneyRow label="IVA" amount={breakdown.vat} />
                </>
            ) : (
                <Text className="text-sm text-texto2">Las exportaciones no pagan arancel ni IVA.</Text>
            )}
            <View className="border-t border-borde pt-2">
                <MoneyRow
                    label={type === 'import' ? 'Total a pagar' : 'Tasa de trámite'}
                    amount={breakdown.total}
                    strong
                />
            </View>
            <Text className="text-xs text-texto2">Tasa: {formatBs(exchangeRate)} por $1.00</Text>
        </Card>
    );
}
```

`components/(Views)/Operation/OperationMissing.tsx`:

```tsx
import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Button } from '@/components/Shared/Button';
import { Screen } from '@/components/Shared/Screen';

export function OperationMissing() {
    const router = useRouter();

    return (
        <Screen title="Operación">
            <Text className="text-base text-texto2">Esta operación ya no existe.</Text>
            <Button label="Ir al historial" onPress={() => router.replace('/History')} />
        </Screen>
    );
}
```

`components/(Views)/History/OperationRow.tsx`:

```tsx
import { Pressable, Text, View } from 'react-native';
import { StatusBadge } from '@/components/Shared/StatusBadge';
import { TYPE_LABELS } from '@/constants/labels';
import type { Operation } from '@/types/operation';
import { formatBs, formatDate, formatUsd } from '@/utils/format';

type OperationRowProps = {
    operation: Operation;
    categoryName: string;
    onPress: () => void;
};

export function OperationRow({ operation, categoryName, onPress }: OperationRowProps) {
    return (
        <Pressable
            onPress={onPress}
            accessibilityRole="button"
            className="gap-2 rounded-2xl border border-borde bg-tarjeta p-4"
        >
            <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1">
                    <Text className="text-base font-semibold text-texto1" numberOfLines={1}>
                        {operation.description}
                    </Text>
                    <Text className="text-sm text-texto2">
                        {TYPE_LABELS[operation.type]} · {categoryName}
                    </Text>
                </View>
                <View className="items-end">
                    <Text className="text-base font-bold text-texto1">{formatUsd(operation.breakdown.total.usd)}</Text>
                    <Text className="text-sm text-texto2">{formatBs(operation.breakdown.total.bs)}</Text>
                </View>
            </View>
            <View className="flex-row items-center justify-between">
                <StatusBadge status={operation.status} />
                <Text className="text-xs text-texto2">{formatDate(operation.createdAt)}</Text>
            </View>
        </Pressable>
    );
}
```

- [ ] **Step 4: Escribir la barra de navegación y conectarla en la raíz**

`components/Layout/Navbar.tsx`:

```tsx
import { Ionicons } from '@expo/vector-icons';
import { usePathname, useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = {
    href: string;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    routes: string[];
};

const TABS: Tab[] = [
    { href: '/Home', label: 'Inicio', icon: 'home-outline', routes: ['/Home'] },
    { href: '/NewOperation', label: 'Nueva', icon: 'add-circle-outline', routes: ['/NewOperation', '/Payment', '/Receipt'] },
    { href: '/History', label: 'Historial', icon: 'list-outline', routes: ['/History', '/OperationDetail'] },
    { href: '/Admin', label: 'Admin', icon: 'settings-outline', routes: ['/Admin'] },
];

export function Navbar() {
    const router = useRouter();
    const pathname = usePathname();
    const insets = useSafeAreaInsets();

    const goTo = (href: string) => {
        if (router.canDismiss()) router.dismissAll();
        router.replace(href);
    };

    return (
        <View
            style={{ paddingBottom: Math.max(insets.bottom, 8) }}
            className="flex-row border-t border-borde bg-tarjeta pt-2"
        >
            {TABS.map((tab) => {
                const active = tab.routes.includes(pathname);
                const color = active ? '#029AFF' : '#6B7280';
                return (
                    <Pressable
                        key={tab.href}
                        onPress={() => goTo(tab.href)}
                        accessibilityRole="button"
                        accessibilityLabel={tab.label}
                        className="flex-1 items-center gap-1"
                    >
                        <Ionicons name={tab.icon} size={24} color={color} />
                        <Text style={{ color }} className="text-xs font-medium">
                            {tab.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}
```

Reemplazar todo `app/_layout.tsx` por:

```tsx
import '../global.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Navbar } from '@/components/Layout/Navbar';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <StatusBar style="dark" />
            <View className="flex-1 bg-fondo">
                <View className="flex-1">
                    <Stack screenOptions={{ headerShown: false }} />
                </View>
                <Navbar />
            </View>
        </SafeAreaProvider>
    );
}
```

- [ ] **Step 5: Verificar tipos y empaquetado**

```bash
npx tsc --noEmit
npx expo export --platform android --output-dir dist
```

Expected: ambos sin errores. Si `tsc` rechaza `router.replace(href)` por el tipo de la ruta, cambiar la línea a `router.replace(href as Href)` e importar `type Href` desde `expo-router`.

- [ ] **Step 6: Commit**

```bash
git add constants components app/_layout.tsx
git commit -m "feat: componentes compartidos y barra de navegacion"
```

---

### Task 8: Registrar, pagar y comprobante

**Files:**
- Create: `app/(Views)/(Operation)/NewOperation.tsx`, `app/(Views)/(Operation)/Payment.tsx`, `app/(Views)/(Operation)/Receipt.tsx`

**Interfaces:**
- Consumes: `useRatesStore`, `useOperationsStore`, `calculateTaxes`, `validateOperation`, `parseAmount`, `parseOptionalAmount`, `formatUsd`, `formatBs`, `formatDate`, `TYPE_LABELS`, y los componentes de Task 7.
- Produces: rutas `/NewOperation`, `/Payment?id=<id>`, `/Receipt?id=<id>`.

- [ ] **Step 1: Escribir la pantalla de nueva operación**

`app/(Views)/(Operation)/NewOperation.tsx`:

```tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BreakdownCard } from '@/components/(Views)/Operation/BreakdownCard';
import { Button } from '@/components/Shared/Button';
import { Field } from '@/components/Shared/Field';
import { Screen } from '@/components/Shared/Screen';
import { TYPE_LABELS } from '@/constants/labels';
import { calculateTaxes } from '@/services/taxes/calculateTaxes';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import type { OperationType } from '@/types/operation';
import { parseAmount, parseOptionalAmount } from '@/utils/format';
import { validateOperation } from '@/utils/validation';

const TYPES: OperationType[] = ['import', 'export'];

export default function NewOperation() {
    const router = useRouter();
    const categories = useRatesStore((state) => state.categories);
    const settings = useRatesStore((state) => state.settings);
    const addOperation = useOperationsStore((state) => state.addOperation);

    const [type, setType] = useState<OperationType>('import');
    const [description, setDescription] = useState('');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [value, setValue] = useState('');
    const [freight, setFreight] = useState('');
    const [insurance, setInsurance] = useState('');
    const [attempted, setAttempted] = useState(false);

    const category = categories.find((item) => item.id === categoryId) ?? null;
    const amounts = {
        value: parseAmount(value),
        freight: parseOptionalAmount(freight),
        insurance: parseOptionalAmount(insurance),
    };
    const errors = validateOperation({ description, categoryId: category?.id ?? null, ...amounts });
    const hasErrors = Object.keys(errors).length > 0;
    const amountsValid = !errors.value && !errors.freight && !errors.insurance;
    const breakdown = amountsValid && category ? calculateTaxes({ type, ...amounts }, category.tariffRate, settings) : null;
    const shown = attempted ? errors : {};

    const save = () => {
        setAttempted(true);
        if (hasErrors || !category) return;
        const operation = addOperation(
            { type, description: description.trim(), categoryId: category.id, ...amounts },
            category.tariffRate,
            settings
        );
        router.push({ pathname: '/Payment', params: { id: operation.id } });
    };

    return (
        <Screen title="Nueva operación">
            <View className="flex-row gap-2">
                {TYPES.map((option) => {
                    const active = option === type;
                    return (
                        <Pressable
                            key={option}
                            onPress={() => setType(option)}
                            accessibilityRole="button"
                            accessibilityState={{ selected: active }}
                            className={`flex-1 items-center rounded-xl border py-3 ${active ? 'border-primario bg-primario' : 'border-borde bg-tarjeta'}`}
                        >
                            <Text className={`text-base font-semibold ${active ? 'text-white' : 'text-texto1'}`}>
                                {TYPE_LABELS[option]}
                            </Text>
                        </Pressable>
                    );
                })}
            </View>

            <Field
                label="Descripción"
                value={description}
                onChangeText={setDescription}
                placeholder="Ej. Teléfono celular"
                error={shown.description}
            />

            <View className="gap-1">
                <Text className="text-sm font-medium text-texto1">Categoría</Text>
                <View className="flex-row flex-wrap gap-2">
                    {categories.map((item) => {
                        const active = item.id === categoryId;
                        return (
                            <Pressable
                                key={item.id}
                                onPress={() => setCategoryId(item.id)}
                                accessibilityRole="button"
                                accessibilityState={{ selected: active }}
                                className={`rounded-full border px-3 py-2 ${active ? 'border-primario bg-primario' : 'border-borde bg-tarjeta'}`}
                            >
                                <Text className={`text-sm ${active ? 'font-semibold text-white' : 'text-texto1'}`}>
                                    {item.name} · {item.tariffRate}%
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>
                {shown.categoryId ? <Text className="text-sm text-rojo">{shown.categoryId}</Text> : null}
            </View>

            <Field label="Valor del producto (USD)" value={value} onChangeText={setValue} placeholder="0.00" numeric error={shown.value} />
            <Field label="Flete (USD)" value={freight} onChangeText={setFreight} placeholder="0.00" numeric error={shown.freight} />
            <Field label="Seguro (USD)" value={insurance} onChangeText={setInsurance} placeholder="0.00" numeric error={shown.insurance} />

            {breakdown ? (
                <BreakdownCard type={type} breakdown={breakdown} exchangeRate={settings.exchangeRate} />
            ) : (
                <Text className="text-sm text-texto2">Elige una categoría y escribe el valor para ver el cálculo.</Text>
            )}

            <Button label="Guardar y continuar al pago" onPress={save} disabled={attempted && hasErrors} />
        </Screen>
    );
}
```

- [ ] **Step 2: Escribir la pantalla de pago**

`app/(Views)/(Operation)/Payment.tsx`:

```tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text } from 'react-native';
import { BreakdownCard } from '@/components/(Views)/Operation/BreakdownCard';
import { OperationMissing } from '@/components/(Views)/Operation/OperationMissing';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Card';
import { Screen } from '@/components/Shared/Screen';
import { TYPE_LABELS } from '@/constants/labels';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { formatBs, formatUsd } from '@/utils/format';

export default function Payment() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const operation = useOperationsStore((state) => state.operations.find((item) => item.id === id));
    const payOperation = useOperationsStore((state) => state.payOperation);

    if (!operation) return <OperationMissing />;

    const pay = () => {
        payOperation(operation.id);
        router.replace({ pathname: '/Receipt', params: { id: operation.id } });
    };

    return (
        <Screen title="Pago" onBack={() => router.back()}>
            <Card>
                <Text className="text-sm text-texto2">{TYPE_LABELS[operation.type]}</Text>
                <Text className="text-lg font-bold text-texto1">{operation.description}</Text>
            </Card>

            <BreakdownCard type={operation.type} breakdown={operation.breakdown} exchangeRate={operation.exchangeRate} />

            {operation.status === 'pending' ? (
                <>
                    <Text className="text-sm text-texto2">Pago simulado: no se mueve dinero real.</Text>
                    <Button
                        label={`Pagar ${formatUsd(operation.breakdown.total.usd)} · ${formatBs(operation.breakdown.total.bs)}`}
                        onPress={pay}
                    />
                    <Button label="Pagar después" variant="secondary" onPress={() => router.replace('/History')} />
                </>
            ) : (
                <>
                    <Text className="text-sm text-texto2">Esta operación ya fue pagada.</Text>
                    <Button
                        label="Ver comprobante"
                        onPress={() => router.replace({ pathname: '/Receipt', params: { id: operation.id } })}
                    />
                </>
            )}
        </Screen>
    );
}
```

- [ ] **Step 3: Escribir la pantalla de comprobante**

`app/(Views)/(Operation)/Receipt.tsx`:

```tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { BreakdownCard } from '@/components/(Views)/Operation/BreakdownCard';
import { OperationMissing } from '@/components/(Views)/Operation/OperationMissing';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Card';
import { Screen } from '@/components/Shared/Screen';
import { StatusBadge } from '@/components/Shared/StatusBadge';
import { TYPE_LABELS } from '@/constants/labels';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { formatDate } from '@/utils/format';

function Line({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row justify-between gap-3">
            <Text className="text-sm text-texto2">{label}</Text>
            <Text className="flex-1 text-right text-sm text-texto1">{value}</Text>
        </View>
    );
}

export default function Receipt() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const operation = useOperationsStore((state) => state.operations.find((item) => item.id === id));
    const categories = useRatesStore((state) => state.categories);

    if (!operation || !operation.receiptNumber || !operation.paidAt) return <OperationMissing />;

    const categoryName = categories.find((item) => item.id === operation.categoryId)?.name ?? 'Sin categoría';

    return (
        <Screen title="Comprobante">
            <Card>
                <Text className="text-sm text-texto2">Comprobante de pago</Text>
                <Text className="text-2xl font-bold text-texto1">{operation.receiptNumber}</Text>
                <StatusBadge status={operation.status} />
                <Line label="Fecha de pago" value={formatDate(operation.paidAt)} />
                <Line label="Tipo" value={TYPE_LABELS[operation.type]} />
                <Line label="Descripción" value={operation.description} />
                <Line label="Categoría" value={categoryName} />
            </Card>

            <BreakdownCard type={operation.type} breakdown={operation.breakdown} exchangeRate={operation.exchangeRate} />

            <Button label="Ir al historial" onPress={() => router.replace('/History')} />
            <Button label="Nueva operación" variant="secondary" onPress={() => router.replace('/NewOperation')} />
        </Screen>
    );
}
```

- [ ] **Step 4: Verificar tipos, pruebas y empaquetado**

```bash
npx tsc --noEmit
npx jest
npx expo export --platform android --output-dir dist
```

Expected: `tsc` sin errores; Jest PASS con 43 pruebas; `expo export` sin errores.

- [ ] **Step 5: Commit**

```bash
git add "app/(Views)/(Operation)"
git commit -m "feat: registro de operacion, pago simulado y comprobante"
```

---

### Task 9: Historial y detalle

**Files:**
- Create: `app/(Views)/(History)/History.tsx`, `app/(Views)/(History)/OperationDetail.tsx`

**Interfaces:**
- Consumes: `useOperationsStore`, `useRatesStore`, `OperationRow`, `BreakdownCard`, `OperationMissing`, componentes compartidos, `formatUsd`, `formatDate`, `TYPE_LABELS`.
- Produces: rutas `/History` y `/OperationDetail?id=<id>`.

- [ ] **Step 1: Escribir el historial**

`app/(Views)/(History)/History.tsx`:

```tsx
import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { OperationRow } from '@/components/(Views)/History/OperationRow';
import { Button } from '@/components/Shared/Button';
import { Screen } from '@/components/Shared/Screen';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';

export default function History() {
    const router = useRouter();
    const operations = useOperationsStore((state) => state.operations);
    const categories = useRatesStore((state) => state.categories);

    const categoryName = (id: string) => categories.find((item) => item.id === id)?.name ?? 'Sin categoría';

    return (
        <Screen title="Historial">
            {operations.length === 0 ? (
                <>
                    <Text className="text-base text-texto2">Todavía no hay operaciones registradas.</Text>
                    <Button label="Nueva operación" onPress={() => router.replace('/NewOperation')} />
                </>
            ) : (
                operations.map((operation) => (
                    <OperationRow
                        key={operation.id}
                        operation={operation}
                        categoryName={categoryName(operation.categoryId)}
                        onPress={() => router.push({ pathname: '/OperationDetail', params: { id: operation.id } })}
                    />
                ))
            )}
        </Screen>
    );
}
```

- [ ] **Step 2: Escribir el detalle**

`app/(Views)/(History)/OperationDetail.tsx`:

```tsx
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Text, View } from 'react-native';
import { BreakdownCard } from '@/components/(Views)/Operation/BreakdownCard';
import { OperationMissing } from '@/components/(Views)/Operation/OperationMissing';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Card';
import { Screen } from '@/components/Shared/Screen';
import { StatusBadge } from '@/components/Shared/StatusBadge';
import { TYPE_LABELS } from '@/constants/labels';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { formatDate, formatUsd } from '@/utils/format';

function Line({ label, value }: { label: string; value: string }) {
    return (
        <View className="flex-row justify-between gap-3">
            <Text className="text-sm text-texto2">{label}</Text>
            <Text className="flex-1 text-right text-sm text-texto1">{value}</Text>
        </View>
    );
}

export default function OperationDetail() {
    const router = useRouter();
    const { id } = useLocalSearchParams<{ id: string }>();
    const operation = useOperationsStore((state) => state.operations.find((item) => item.id === id));
    const releaseOperation = useOperationsStore((state) => state.releaseOperation);
    const removeOperation = useOperationsStore((state) => state.removeOperation);
    const categories = useRatesStore((state) => state.categories);

    if (!operation) return <OperationMissing />;

    const categoryName = categories.find((item) => item.id === operation.categoryId)?.name ?? 'Sin categoría';

    const confirmRemove = () => {
        Alert.alert('Eliminar operación', 'Esta acción no se puede deshacer.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Eliminar',
                style: 'destructive',
                onPress: () => {
                    router.back();
                    removeOperation(operation.id);
                },
            },
        ]);
    };

    return (
        <Screen title="Detalle" onBack={() => router.back()}>
            <Card>
                <Text className="text-lg font-bold text-texto1">{operation.description}</Text>
                <StatusBadge status={operation.status} />
                <Line label="Tipo" value={TYPE_LABELS[operation.type]} />
                <Line label="Categoría" value={categoryName} />
                <Line label="Registrada" value={formatDate(operation.createdAt)} />
                <Line label="Valor" value={formatUsd(operation.value)} />
                <Line label="Flete" value={formatUsd(operation.freight)} />
                <Line label="Seguro" value={formatUsd(operation.insurance)} />
                {operation.receiptNumber ? <Line label="Comprobante" value={operation.receiptNumber} /> : null}
            </Card>

            <BreakdownCard type={operation.type} breakdown={operation.breakdown} exchangeRate={operation.exchangeRate} />

            {operation.status === 'pending' ? (
                <>
                    <Button
                        label="Pagar"
                        onPress={() => router.push({ pathname: '/Payment', params: { id: operation.id } })}
                    />
                    <Button label="Eliminar" variant="danger" onPress={confirmRemove} />
                </>
            ) : (
                <Button
                    label="Ver comprobante"
                    variant="secondary"
                    onPress={() => router.push({ pathname: '/Receipt', params: { id: operation.id } })}
                />
            )}

            {operation.status === 'paid' ? (
                <Button label="Liberar mercancía" onPress={() => releaseOperation(operation.id)} />
            ) : null}
        </Screen>
    );
}
```

- [ ] **Step 3: Verificar tipos y empaquetado**

```bash
npx tsc --noEmit
npx expo export --platform android --output-dir dist
```

Expected: ambos sin errores.

- [ ] **Step 4: Commit**

```bash
git add "app/(Views)/(History)"
git commit -m "feat: historial y detalle de operaciones"
```

---

### Task 10: Inicio, administración y documentación

**Files:**
- Modify: `app/(Views)/(Home)/Home.tsx` (reemplazo completo)
- Create: `app/(Views)/(Admin)/Admin.tsx`
- Modify: `README.md` (reemplazo completo)

**Interfaces:**
- Consumes: `useOperationsStore`, `useRatesStore`, `summarizeOperations`, `validateSettings`, `validateCategory`, `parseAmount`, `formatUsd`, `formatBs`, componentes compartidos.
- Produces: rutas `/Home` y `/Admin` terminadas.

- [ ] **Step 1: Escribir la pantalla de inicio**

Reemplazar todo `app/(Views)/(Home)/Home.tsx` por:

```tsx
import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Card';
import { MoneyRow } from '@/components/Shared/MoneyRow';
import { Screen } from '@/components/Shared/Screen';
import { summarizeOperations } from '@/services/operations/summary';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { formatBs } from '@/utils/format';

export default function Home() {
    const router = useRouter();
    const operations = useOperationsStore((state) => state.operations);
    const exchangeRate = useRatesStore((state) => state.settings.exchangeRate);
    const { pendingCount, collected } = summarizeOperations(operations);

    return (
        <Screen title="Aduanas">
            <Card>
                <Text className="text-sm text-texto2">Tasa del día</Text>
                <Text className="text-2xl font-bold text-texto1">{formatBs(exchangeRate)}</Text>
                <Text className="text-sm text-texto2">por $1.00</Text>
            </Card>

            <Card>
                <Text className="text-sm text-texto2">Operaciones pendientes de pago</Text>
                <Text className="text-2xl font-bold text-texto1">{pendingCount}</Text>
            </Card>

            <Card>
                <MoneyRow label="Total pagado" amount={collected} strong />
            </Card>

            <Button label="Nueva operación" onPress={() => router.replace('/NewOperation')} />
            <Button label="Ver historial" variant="secondary" onPress={() => router.replace('/History')} />
        </Screen>
    );
}
```

- [ ] **Step 2: Escribir la pantalla de administración**

`app/(Views)/(Admin)/Admin.tsx`:

```tsx
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Card';
import { Field } from '@/components/Shared/Field';
import { MoneyRow } from '@/components/Shared/MoneyRow';
import { Screen } from '@/components/Shared/Screen';
import { summarizeOperations } from '@/services/operations/summary';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import type { Category } from '@/types/rates';
import { parseAmount } from '@/utils/format';
import { type CategoryErrors, type SettingsErrors, validateCategory, validateSettings } from '@/utils/validation';

export default function Admin() {
    const operations = useOperationsStore((state) => state.operations);
    const { categories, settings, updateSettings, addCategory, updateCategory, removeCategory } = useRatesStore();
    const { collected } = summarizeOperations(operations);

    const [exchangeRate, setExchangeRate] = useState(String(settings.exchangeRate));
    const [vatRate, setVatRate] = useState(String(settings.vatRate));
    const [exemptMinimum, setExemptMinimum] = useState(String(settings.exemptMinimum));
    const [exportFee, setExportFee] = useState(String(settings.exportFee));
    const [settingsErrors, setSettingsErrors] = useState<SettingsErrors>({});
    const [settingsSaved, setSettingsSaved] = useState(false);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [categoryName, setCategoryName] = useState('');
    const [categoryRate, setCategoryRate] = useState('');
    const [categoryErrors, setCategoryErrors] = useState<CategoryErrors>({});
    const [categoryMessage, setCategoryMessage] = useState('');

    const editSetting = (setter: (text: string) => void) => (text: string) => {
        setter(text);
        setSettingsSaved(false);
    };

    const saveSettings = () => {
        const next = {
            exchangeRate: parseAmount(exchangeRate),
            vatRate: parseAmount(vatRate),
            exemptMinimum: parseAmount(exemptMinimum),
            exportFee: parseAmount(exportFee),
        };
        const errors = validateSettings(next);
        setSettingsErrors(errors);
        if (Object.keys(errors).length > 0) return;
        updateSettings(next);
        setSettingsSaved(true);
    };

    const resetCategoryForm = () => {
        setEditingId(null);
        setCategoryName('');
        setCategoryRate('');
        setCategoryErrors({});
    };

    const startEditing = (category: Category) => {
        setEditingId(category.id);
        setCategoryName(category.name);
        setCategoryRate(String(category.tariffRate));
        setCategoryErrors({});
        setCategoryMessage('');
    };

    const saveCategory = () => {
        const form = { name: categoryName, tariffRate: parseAmount(categoryRate) };
        const errors = validateCategory(form);
        setCategoryErrors(errors);
        if (Object.keys(errors).length > 0) return;
        if (editingId) updateCategory(editingId, form.name, form.tariffRate);
        else addCategory(form.name, form.tariffRate);
        setCategoryMessage('');
        resetCategoryForm();
    };

    const deleteCategory = (category: Category) => {
        const removed = removeCategory(category.id, operations);
        setCategoryMessage(removed ? '' : `No se puede eliminar "${category.name}": hay operaciones que la usan.`);
        if (removed && editingId === category.id) resetCategoryForm();
    };

    return (
        <Screen title="Administración">
            <Card>
                <MoneyRow label="Total recaudado" amount={collected} strong />
            </Card>

            <Card>
                <Text className="text-base font-bold text-texto1">Tasas</Text>
                <Field label="Tasa del día (Bs por $1)" value={exchangeRate} onChangeText={editSetting(setExchangeRate)} numeric error={settingsErrors.exchangeRate} />
                <Field label="IVA (%)" value={vatRate} onChangeText={editSetting(setVatRate)} numeric error={settingsErrors.vatRate} />
                <Field label="Mínimo exento de arancel (USD)" value={exemptMinimum} onChangeText={editSetting(setExemptMinimum)} numeric error={settingsErrors.exemptMinimum} />
                <Field label="Trámite de exportación (USD)" value={exportFee} onChangeText={editSetting(setExportFee)} numeric error={settingsErrors.exportFee} />
                <Button label="Guardar tasas" onPress={saveSettings} />
                {settingsSaved ? <Text className="text-sm text-verde">Tasas guardadas.</Text> : null}
            </Card>

            <Card>
                <Text className="text-base font-bold text-texto1">Categorías</Text>
                {categories.map((category) => (
                    <View key={category.id} className="flex-row items-center justify-between gap-3 border-b border-borde py-2">
                        <Pressable className="flex-1" onPress={() => startEditing(category)} accessibilityRole="button">
                            <Text className="text-base text-texto1">{category.name}</Text>
                            <Text className="text-sm text-texto2">Arancel {category.tariffRate}% · toca para editar</Text>
                        </Pressable>
                        <Pressable onPress={() => deleteCategory(category)} hitSlop={8} accessibilityRole="button">
                            <Text className="text-sm font-semibold text-rojo">Eliminar</Text>
                        </Pressable>
                    </View>
                ))}
                {categoryMessage ? <Text className="text-sm text-rojo">{categoryMessage}</Text> : null}

                <Text className="pt-2 text-sm font-semibold text-texto2">
                    {editingId ? 'Editar categoría' : 'Agregar categoría'}
                </Text>
                <Field label="Nombre" value={categoryName} onChangeText={setCategoryName} error={categoryErrors.name} />
                <Field label="Arancel (%)" value={categoryRate} onChangeText={setCategoryRate} numeric error={categoryErrors.tariffRate} />
                <Button label={editingId ? 'Guardar cambios' : 'Agregar'} onPress={saveCategory} />
                {editingId ? <Button label="Cancelar" variant="secondary" onPress={resetCategoryForm} /> : null}
            </Card>
        </Screen>
    );
}
```

- [ ] **Step 3: Escribir el README**

Reemplazar todo `README.md` por:

````markdown
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
````

- [ ] **Step 4: Verificar tipos, pruebas y empaquetado**

```bash
npx tsc --noEmit
npx jest
npx expo export --platform android --output-dir dist
```

Expected: `tsc` sin errores; Jest PASS con 43 pruebas; `expo export` sin errores.

- [ ] **Step 5: Verificación manual en Expo Go**

Run: `npm start`, abrir en Expo Go y recorrer:

1. Inicio muestra tasa `Bs 900,00`, 0 pendientes y total `$0.00`.
2. Nueva: Importación, "Teléfono", Electrónica, valor `300`, flete `30`, seguro `10`. El desglose muestra arancel `$17.00`, IVA `$57.12`, total `$74.12` / `Bs 66.708,00`.
3. Cambiar el valor a `100` y borrar flete y seguro: el arancel pasa a `$0.00` con la nota "Exento por monto mínimo".
4. Escribir el valor con coma (`300,5`): el desglose se calcula sin mostrar `NaN`.
5. Tocar "Guardar" con la descripción vacía: aparece el error y no se guarda.
6. Guardar una operación válida, pagarla: el comprobante muestra `ADU-000001`.
7. Historial muestra la operación como "Pagada". En el detalle, "Liberar mercancía" la pasa a "Liberada".
8. Admin: cambiar la tasa del día a `950` y guardar. La operación anterior conserva sus Bs; una nueva usa 950.
9. Admin: intentar eliminar la categoría usada muestra el aviso; eliminar una sin uso funciona.
10. Registrar una exportación: total `$10.00` como tasa de trámite.
11. Cerrar la app por completo y abrirla: las operaciones y las tasas siguen ahí.

- [ ] **Step 6: Commit**

```bash
git add "app/(Views)/(Home)" "app/(Views)/(Admin)" README.md
git commit -m "feat: inicio, administracion de tasas y documentacion"
```
