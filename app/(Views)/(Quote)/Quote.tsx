import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { COLORS } from '@/Shared/Global/colors';
import { BreakdownCard } from '@/components/(Views)/Quote/BreakdownCard';
import { RegisterSheet } from '@/components/(Views)/Quote/RegisterSheet';
import { Screen } from '@/components/Layout/Screen';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { InfoTooltip } from '@/components/Shared/Buttons/InfoTooltip';
import { FormInput } from '@/components/Shared/Forms/FormInput';
import { OptionSheet } from '@/components/Shared/Forms/OptionSheet';
import { SegmentedControl } from '@/components/Shared/Forms/SegmentedControl';
import { Card } from '@/components/Shared/Ui/Card';
import { Icon } from '@/components/Shared/Ui/Icon';
import { TRANSPORT_ICONS, TRANSPORT_LABELS, TRANSPORT_MODES, TYPE_LABELS } from '@/constants/labels';
import { toast } from '@/services/toast/toast';
import { calculateTaxes } from '@/services/taxes/calculateTaxes';
import { hasModeRates, tariffRateFor } from '@/services/taxes/tariff';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import type { OperationType, TransportMode } from '@/types/operation';
import type { Category } from '@/types/rates';
import { parseAmount, parseOptionalAmount } from '@/utils/format';
import { validateOperation } from '@/utils/validation';

const TYPE_OPTIONS = (['import', 'export'] as OperationType[]).map((key) => ({ key, label: TYPE_LABELS[key] }));
const TRANSPORT_OPTIONS = TRANSPORT_MODES.map((key) => ({ key, label: TRANSPORT_LABELS[key], icon: TRANSPORT_ICONS[key] }));

/** Texto corto con el arancel de una categoria: "20 %" o "20 % · aéreo 25 %". */
function rateSummary(category: Category): string {
    if (!hasModeRates(category)) return `Arancel ${category.tariffRate} %`;
    const modes = TRANSPORT_MODES.filter((mode) => category.tariffByMode?.[mode] !== undefined)
        .map((mode) => `${TRANSPORT_LABELS[mode].toLowerCase()} ${category.tariffByMode?.[mode]} %`)
        .join(' · ');
    return `Arancel ${category.tariffRate} % · ${modes}`;
}

export default function Quote() {
    const router = useRouter();
    const categories = useRatesStore((state) => state.categories);
    const settings = useRatesStore((state) => state.settings);
    const addOperation = useOperationsStore((state) => state.addOperation);

    const [type, setType] = useState<OperationType>('import');
    const [transport, setTransport] = useState<TransportMode>('sea');
    const [categoryId, setCategoryId] = useState<string | null>(null);
    const [value, setValue] = useState('');
    const [freight, setFreight] = useState('');
    const [insurance, setInsurance] = useState('');
    const [pickerOpen, setPickerOpen] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const registeredId = useRef<string | null>(null);

    const category = categories.find((item) => item.id === categoryId) ?? null;
    const tariffRate = category ? tariffRateFor(category, transport) : 0;
    const amounts = { value: parseAmount(value), freight: parseOptionalAmount(freight), insurance: parseOptionalAmount(insurance) };
    // La descripcion se pide al registrar; aqui solo se validan montos y categoria.
    const errors = validateOperation({ description: 'x', categoryId: category?.id ?? null, ...amounts });
    const amountsValid = !errors.value && !errors.freight && !errors.insurance;
    const breakdown = amountsValid && category ? calculateTaxes({ type, ...amounts }, tariffRate, settings) : null;
    // Los errores se muestran solo en campos con texto; el boton queda opaco hasta que la cotizacion sea valida.
    const shown = {
        value: value.trim() === '' ? undefined : errors.value,
        freight: freight.trim() === '' ? undefined : errors.freight,
        insurance: insurance.trim() === '' ? undefined : errors.insurance,
    };

    const register = (description: string) => {
        if (!category || registeredId.current) return;
        const operation = addOperation({ type, transport, description, categoryId: category.id, ...amounts }, tariffRate, settings);
        registeredId.current = operation.id;
        setRegisterOpen(false);
    };

    const afterSheetClosed = () => {
        const id = registeredId.current;
        if (!id) return;
        registeredId.current = null;
        setCategoryId(null);
        setValue('');
        setFreight('');
        setInsurance('');
        toast.success('Operación registrada');
        router.push({ pathname: '/Payment', params: { id } });
    };

    return (
        <Screen
            title="Cotizar"
            footer={<ActionButton label="Registrar operación" icon="check" onPress={() => setRegisterOpen(true)} disabled={!breakdown} />}
        >
            <SegmentedControl options={TYPE_OPTIONS} value={type} onChange={setType} />

            <Card>
                <View className="flex-row items-center gap-1.5">
                    <Text className="text-xs font-semibold uppercase tracking-wider text-texto2">Transporte</Text>
                    <InfoTooltip term="transport" size={14} />
                </View>
                <SegmentedControl options={TRANSPORT_OPTIONS} value={transport} onChange={setTransport} />
            </Card>

            <Card>
                <Text className="text-xs font-semibold uppercase tracking-wider text-texto2">Mercancía</Text>
                <View className="gap-1.5">
                    <View className="flex-row items-center gap-1.5">
                        <Text className="text-sm font-medium text-texto1">Categoría</Text>
                        <InfoTooltip term="tariff" />
                    </View>
                    <Pressable
                        onPress={() => setPickerOpen(true)}
                        accessibilityRole="button"
                        accessibilityLabel="Elegir categoría"
                        className="h-12 flex-row items-center justify-between rounded-2xl border border-borde bg-fondo2 px-4"
                    >
                        <Text className={`text-base ${category ? 'text-texto1' : 'text-texto2'}`}>
                            {category ? `${category.name} · ${tariffRate} %` : 'Elegir categoría'}
                        </Text>
                        <Icon name="chevron-right" size={18} color={COLORS.texto2} />
                    </Pressable>
                    {category && hasModeRates(category) ? (
                        <Text className="text-xs text-texto2">Arancel para transporte {TRANSPORT_LABELS[transport].toLowerCase()}.</Text>
                    ) : null}
                </View>
                <FormInput label="Valor del producto" placeholder="0.00" suffix="USD" numeric value={value} onChangeText={setValue} errorMessage={shown.value} />
                <View className="flex-row gap-3">
                    <View className="flex-1">
                        <FormInput label="Flete" labelAccessory={<InfoTooltip term="freight" />} placeholder="0.00" suffix="USD" numeric value={freight} onChangeText={setFreight} errorMessage={shown.freight} />
                    </View>
                    <View className="flex-1">
                        <FormInput label="Seguro" labelAccessory={<InfoTooltip term="insurance" />} placeholder="0.00" suffix="USD" numeric value={insurance} onChangeText={setInsurance} errorMessage={shown.insurance} />
                    </View>
                </View>
            </Card>

            {breakdown ? (
                <BreakdownCard type={type} breakdown={breakdown} exchangeRate={settings.exchangeRate} />
            ) : (
                <Card variant="flat">
                    <Text className="text-sm text-texto2">Elige una categoría y escribe el valor del producto para ver el cálculo al instante.</Text>
                </Card>
            )}

            <OptionSheet
                visible={pickerOpen}
                onClose={() => setPickerOpen(false)}
                title="Categoría"
                searchable
                options={categories.map((item) => ({ key: item.id, label: item.name, sublabel: rateSummary(item) }))}
                selectedKey={categoryId}
                onSelect={setCategoryId}
                emptyText="No hay categorías con ese nombre"
            />
            {breakdown && category ? (
                <RegisterSheet
                    visible={registerOpen}
                    onClose={() => setRegisterOpen(false)}
                    type={type}
                    transport={transport}
                    categoryName={category.name}
                    total={breakdown.total}
                    onRegister={register}
                    onClosed={afterSheetClosed}
                />
            ) : null}
        </Screen>
    );
}
