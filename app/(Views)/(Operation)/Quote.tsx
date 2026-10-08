import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { BreakdownCard } from '@/components/(Views)/Operation/BreakdownCard';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Ui/Card';
import { Field } from '@/components/Shared/Field';
import { Screen } from '@/components/Layout/Screen';
import { TYPE_LABELS } from '@/constants/labels';
import { calculateTaxes } from '@/services/taxes/calculateTaxes';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import type { OperationType } from '@/types/operation';
import { parseAmount, parseOptionalAmount } from '@/utils/format';
import { validateOperation } from '@/utils/validation';

const TYPES: OperationType[] = ['import', 'export'];

export default function Quote() {
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
    const savedRef = useRef(false);

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
        if (hasErrors || !category || savedRef.current) return;
        savedRef.current = true;
        const operation = addOperation(
            { type, description: description.trim(), categoryId: category.id, ...amounts },
            category.tariffRate,
            settings
        );
        router.replace({ pathname: '/Payment', params: { id: operation.id } });
    };

    return (
        <Screen title="Cotización">
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

            <Card>
                <Text className="text-base font-bold text-texto1">Registrar esta cotización</Text>
                <Text className="text-sm text-texto2">La cotización no se guarda hasta que la registres.</Text>
                <Field
                    label="Descripción"
                    value={description}
                    onChangeText={setDescription}
                    placeholder="Ej. Teléfono celular"
                    error={shown.description}
                />
                <Button label="Registrar operación" onPress={save} disabled={attempted && hasErrors} />
            </Card>
        </Screen>
    );
}
