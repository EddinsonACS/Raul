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
