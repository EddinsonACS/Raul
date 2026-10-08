import { useState } from 'react';
import { Text } from 'react-native';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Ui/Card';
import { Field } from '@/components/Shared/Field';
import { Screen } from '@/components/Shared/Screen';
import { useRatesStore } from '@/stores/rates/ratesStore';
import { parseAmount } from '@/utils/format';
import { type SettingsErrors, validateSettings } from '@/utils/validation';

export default function Settings() {
    const settings = useRatesStore((state) => state.settings);
    const updateSettings = useRatesStore((state) => state.updateSettings);

    const [exchangeRate, setExchangeRate] = useState(String(settings.exchangeRate));
    const [vatRate, setVatRate] = useState(String(settings.vatRate));
    const [exemptMinimum, setExemptMinimum] = useState(String(settings.exemptMinimum));
    const [exportFee, setExportFee] = useState(String(settings.exportFee));
    const [errors, setErrors] = useState<SettingsErrors>({});
    const [saved, setSaved] = useState(false);

    const edit = (setter: (text: string) => void) => (text: string) => {
        setter(text);
        setSaved(false);
    };

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
        setSaved(true);
    };

    return (
        <Screen title="Ajustes">
            <Card>
                <Text className="text-base font-bold text-texto1">Tipo de cambio</Text>
                <Text className="text-sm text-texto2">Se usa para mostrar cada monto en bolívares.</Text>
                <Field
                    label="Tasa del día (Bs por $1)"
                    value={exchangeRate}
                    onChangeText={edit(setExchangeRate)}
                    numeric
                    error={errors.exchangeRate}
                />
            </Card>

            <Card>
                <Text className="text-base font-bold text-texto1">Impuestos de importación</Text>
                <Field label="IVA (%)" value={vatRate} onChangeText={edit(setVatRate)} numeric error={errors.vatRate} />
                <Field
                    label="Mínimo exento de arancel (USD)"
                    value={exemptMinimum}
                    onChangeText={edit(setExemptMinimum)}
                    numeric
                    error={errors.exemptMinimum}
                />
            </Card>

            <Card>
                <Text className="text-base font-bold text-texto1">Exportación</Text>
                <Field
                    label="Tasa de trámite (USD)"
                    value={exportFee}
                    onChangeText={edit(setExportFee)}
                    numeric
                    error={errors.exportFee}
                />
            </Card>

            <Button label="Guardar ajustes" onPress={save} />
            {saved ? <Text className="text-sm text-verde">Ajustes guardados.</Text> : null}
            <Text className="text-xs text-texto2">
                Los cambios aplican a las cotizaciones nuevas. Las operaciones ya registradas conservan sus montos.
            </Text>
        </Screen>
    );
}
