import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { Screen } from '@/components/Layout/Screen';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { InfoTooltip } from '@/components/Shared/Buttons/InfoTooltip';
import { FormInput } from '@/components/Shared/Forms/FormInput';
import { Card } from '@/components/Shared/Ui/Card';
import { toast } from '@/services/toast/toast';
import { useRatesStore } from '@/stores/rates/ratesStore';
import type { TaxSettings } from '@/types/rates';
import { parseAmount } from '@/utils/format';
import { goToTab } from '@/utils/navigation';
import { type SettingsErrors, validateSettings } from '@/utils/validation';

type SettingsForm = Record<keyof TaxSettings, string>;

const toForm = (settings: TaxSettings): SettingsForm => ({
    exchangeRate: String(settings.exchangeRate),
    vatRate: String(settings.vatRate),
    exemptMinimum: String(settings.exemptMinimum),
    customsFeeRate: String(settings.customsFeeRate),
    exportFee: String(settings.exportFee),
});

const toSettings = (form: SettingsForm): TaxSettings => ({
    exchangeRate: parseAmount(form.exchangeRate),
    vatRate: parseAmount(form.vatRate),
    exemptMinimum: parseAmount(form.exemptMinimum),
    customsFeeRate: parseAmount(form.customsFeeRate),
    exportFee: parseAmount(form.exportFee),
});

function SectionTitle({ children }: { children: string }) {
    return <Text className="text-xs font-semibold uppercase tracking-wider text-texto2">{children}</Text>;
}

function Step({ number, text }: { number: number; text: string }) {
    return (
        <View className="flex-row gap-3">
            <View className="h-6 w-6 items-center justify-center rounded-full bg-primario/15">
                <Text className="text-xs font-bold text-primario">{number}</Text>
            </View>
            <Text className="flex-1 text-justify text-sm leading-5 text-texto1">{text}</Text>
        </View>
    );
}

function Formula({ children }: { children: string }) {
    return (
        <View className="rounded-xl bg-fondo3 px-3 py-2">
            <Text className="text-xs font-semibold text-texto1">{children}</Text>
        </View>
    );
}

export default function Settings() {
    const router = useRouter();
    const settings = useRatesStore((state) => state.settings);
    const updateSettings = useRatesStore((state) => state.updateSettings);

    const [form, setForm] = useState<SettingsForm>(() => toForm(settings));
    const [errors, setErrors] = useState<SettingsErrors>({});

    const saved = toForm(settings);
    const dirty = (Object.keys(form) as (keyof SettingsForm)[]).some((key) => form[key].trim() !== saved[key]);

    const setField = (key: keyof SettingsForm) => (text: string) => {
        setForm((current) => ({ ...current, [key]: text }));
        if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
    };

    const save = () => {
        const next = toSettings(form);
        const found = validateSettings(next);
        setErrors(found);
        if (Object.keys(found).length > 0) return;
        updateSettings(next);
        setForm(toForm(next));
        toast.success('Ajustes guardados');
    };

    return (
        <Screen
            title="Ajustes"
            onBack={() => (router.canGoBack() ? router.back() : goToTab(router, '/Home'))}
            footer={<ActionButton label="Guardar ajustes" icon="check" onPress={save} disabled={!dirty} />}
        >
            <Card>
                <SectionTitle>Tipo de cambio</SectionTitle>
                <FormInput
                    label="Tasa del día"
                    labelAccessory={<InfoTooltip term="exchangeRate" />}
                    suffix="Bs / $"
                    numeric
                    value={form.exchangeRate}
                    onChangeText={setField('exchangeRate')}
                    errorMessage={errors.exchangeRate}
                    hint="Las operaciones ya registradas conservan su tasa."
                />
            </Card>

            <Card>
                <SectionTitle>Impuestos de importación</SectionTitle>
                <FormInput
                    label="IVA"
                    labelAccessory={<InfoTooltip term="vat" />}
                    suffix="%"
                    numeric
                    value={form.vatRate}
                    onChangeText={setField('vatRate')}
                    errorMessage={errors.vatRate}
                />
                <FormInput
                    label="Tasa por servicios de aduana"
                    labelAccessory={<InfoTooltip term="customsFee" />}
                    suffix="%"
                    numeric
                    value={form.customsFeeRate}
                    onChangeText={setField('customsFeeRate')}
                    errorMessage={errors.customsFeeRate}
                />
                <FormInput
                    label="Mínimo exento (valor del producto)"
                    labelAccessory={<InfoTooltip term="exemptMinimum" />}
                    suffix="USD"
                    numeric
                    value={form.exemptMinimum}
                    onChangeText={setField('exemptMinimum')}
                    errorMessage={errors.exemptMinimum}
                    hint="Envíos hasta este valor no pagan ningún tributo (Res. 3.283/1997: 100 USD)."
                />
            </Card>

            <Card>
                <SectionTitle>Exportación</SectionTitle>
                <FormInput
                    label="Tasa de trámite"
                    labelAccessory={<InfoTooltip term="exportFee" />}
                    suffix="USD"
                    numeric
                    value={form.exportFee}
                    onChangeText={setField('exportFee')}
                    errorMessage={errors.exportFee}
                />
            </Card>

            <Card variant="flat">
                <SectionTitle>Cómo se calcula una importación</SectionTitle>
                <Step number={1} text="Se suma el valor del producto, el flete y el seguro: ese es el valor en aduana (CIF)." />
                <Formula>Valor en aduana = producto + flete + seguro</Formula>
                <Step number={2} text="Si el valor del producto no supera el mínimo exento, el envío no paga ningún tributo y el cálculo termina aquí." />
                <Formula>Producto ≤ mínimo exento → total 0</Formula>
                <Step number={3} text="El arancel es el porcentaje de la categoría (y del transporte, si lo distingue) sobre el valor en aduana." />
                <Formula>Arancel = valor en aduana × tasa de la categoría</Formula>
                <Step number={4} text="La tasa por servicios de aduana es el 1 % del valor en aduana." />
                <Formula>Tasa aduanera = valor en aduana × 1 %</Formula>
                <Step number={5} text="El IVA se cobra sobre el valor en aduana más el arancel y la tasa aduanera." />
                <Formula>IVA = (valor en aduana + arancel + tasa) × 16 %</Formula>
                <Step number={6} text="El total a pagar es la suma del arancel, la tasa aduanera y el IVA." />
                <Formula>Total = arancel + tasa aduanera + IVA</Formula>
            </Card>

            <Card variant="flat">
                <SectionTitle>Cómo se calcula una exportación</SectionTitle>
                <Step number={1} text="No paga arancel y el IVA tiene alícuota 0 %. Solo se cobra la tasa fija de trámite." />
                <Formula>Total = tasa de trámite</Formula>
            </Card>

            <Card variant="flat">
                <SectionTitle>Base legal (Venezuela)</SectionTitle>
                <Text className="text-justify text-sm leading-5 text-texto2">
                    Ley Orgánica de Aduanas (G.O. 6.507, 2020) y Arancel de Aduanas (Decreto 4.944 y reformas): arancel ad valorem de 0 % a 35 % según código arancelario y tasa por servicios de aduana del 1 %. Ley del IVA: 16 % sobre el valor en aduana más los tributos de la importación; exportaciones con alícuota 0 %. Resolución 3.283 (G.O. 36.127, 1997): envíos courier de hasta 100 USD libres de tributos y hasta 2.000 USD por envío. Las exoneraciones del Decreto 5.197 (2026) para códigos específicos no se aplican en esta app.
                </Text>
            </Card>

            <Card variant="flat">
                <SectionTitle>Conversión a bolívares</SectionTitle>
                <Step number={1} text="Cada monto en dólares se multiplica por la tasa del día. La operación guarda la tasa con la que se calculó." />
                <Formula>Monto en Bs = monto en USD × tasa del día</Formula>
            </Card>
        </Screen>
    );
}
