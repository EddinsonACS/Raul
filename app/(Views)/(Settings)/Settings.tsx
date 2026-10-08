import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';
import { useTheme } from '@/Context/ThemeContext';
import { Screen } from '@/components/Layout/Screen';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { InfoTooltip } from '@/components/Shared/Buttons/InfoTooltip';
import { Chip } from '@/components/Shared/Forms/Chip';
import { FormInput } from '@/components/Shared/Forms/FormInput';
import { Card } from '@/components/Shared/Ui/Card';
import { toast } from '@/services/toast/toast';
import { useRatesStore } from '@/stores/rates/ratesStore';
import type { ThemePreference } from '@/stores/shared/themeStore';
import { parseAmount } from '@/utils/format';
import { goToTab } from '@/utils/navigation';
import { type SettingsErrors, validateSettings } from '@/utils/validation';

const THEME_OPTIONS: { key: ThemePreference; label: string; icon: 'smartphone' | 'sun' | 'moon' }[] = [
    { key: 'system', label: 'Sistema', icon: 'smartphone' },
    { key: 'light', label: 'Claro', icon: 'sun' },
    { key: 'dark', label: 'Oscuro', icon: 'moon' },
];

function SectionTitle({ children }: { children: string }) {
    return <Text className="text-xs font-semibold uppercase tracking-wider text-texto2">{children}</Text>;
}

export default function Settings() {
    const router = useRouter();
    const { preference, setPreference } = useTheme();
    const settings = useRatesStore((state) => state.settings);
    const updateSettings = useRatesStore((state) => state.updateSettings);

    const [exchangeRate, setExchangeRate] = useState(String(settings.exchangeRate));
    const [vatRate, setVatRate] = useState(String(settings.vatRate));
    const [exemptMinimum, setExemptMinimum] = useState(String(settings.exemptMinimum));
    const [exportFee, setExportFee] = useState(String(settings.exportFee));
    const [errors, setErrors] = useState<SettingsErrors>({});

    const save = () => {
        const next = {
            exchangeRate: parseAmount(exchangeRate),
            vatRate: parseAmount(vatRate),
            exemptMinimum: parseAmount(exemptMinimum),
            exportFee: parseAmount(exportFee),
        };
        const found = validateSettings(next);
        setErrors(found);
        if (Object.keys(found).length > 0) return;
        updateSettings(next);
        toast.success('Ajustes guardados');
    };

    return (
        <Screen
            title="Ajustes"
            onBack={() => (router.canGoBack() ? router.back() : goToTab(router, '/Home'))}
            footer={<ActionButton label="Guardar ajustes" icon="check" onPress={save} />}
        >
            <Card>
                <SectionTitle>Tipo de cambio</SectionTitle>
                <FormInput
                    label="Tasa del día"
                    labelAccessory={<InfoTooltip term="exchangeRate" />}
                    suffix="Bs / $"
                    numeric
                    value={exchangeRate}
                    onChangeText={setExchangeRate}
                    errorMessage={errors.exchangeRate}
                    hint="Las operaciones ya registradas conservan su tasa."
                />
            </Card>

            <Card>
                <SectionTitle>Impuestos de importación</SectionTitle>
                <FormInput label="IVA" labelAccessory={<InfoTooltip term="vat" />} suffix="%" numeric value={vatRate} onChangeText={setVatRate} errorMessage={errors.vatRate} />
                <FormInput
                    label="Mínimo exento de arancel"
                    labelAccessory={<InfoTooltip term="exemptMinimum" />}
                    suffix="USD"
                    numeric
                    value={exemptMinimum}
                    onChangeText={setExemptMinimum}
                    errorMessage={errors.exemptMinimum}
                />
            </Card>

            <Card>
                <SectionTitle>Exportación</SectionTitle>
                <FormInput label="Tasa de trámite" labelAccessory={<InfoTooltip term="exportFee" />} suffix="USD" numeric value={exportFee} onChangeText={setExportFee} errorMessage={errors.exportFee} />
            </Card>

            <Card>
                <SectionTitle>Apariencia</SectionTitle>
                <View className="flex-row gap-2">
                    {THEME_OPTIONS.map((option) => (
                        <Chip key={option.key} label={option.label} icon={option.icon} selected={preference === option.key} onPress={() => setPreference(option.key)} />
                    ))}
                </View>
            </Card>

            <Card variant="flat">
                <SectionTitle>Cómo se calcula</SectionTitle>
                <Text className="text-sm leading-5 text-texto2">
                    Importación: valor en aduana = producto + flete + seguro. Si no supera el mínimo exento, no paga arancel. Arancel = valor en aduana × tasa de la categoría. IVA = (valor en aduana + arancel) × IVA. Total = arancel + IVA.
                    {'\n\n'}Exportación: solo paga la tasa de trámite.
                    {'\n\n'}Cada monto se muestra en dólares y en bolívares según la tasa del día.
                </Text>
            </Card>
        </Screen>
    );
}
