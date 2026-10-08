import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import { Button } from '@/components/Shared/Button';
import { Card } from '@/components/Shared/Card';
import { Field } from '@/components/Shared/Field';
import { Screen } from '@/components/Shared/Screen';
import { useOperationsStore } from '@/stores/operations/operationsStore';
import { useRatesStore } from '@/stores/rates/ratesStore';
import type { Category } from '@/types/rates';
import { parseAmount } from '@/utils/format';
import { type CategoryErrors, validateCategory } from '@/utils/validation';

export default function Categories() {
    const operations = useOperationsStore((state) => state.operations);
    const categories = useRatesStore((state) => state.categories);
    const addCategory = useRatesStore((state) => state.addCategory);
    const updateCategory = useRatesStore((state) => state.updateCategory);
    const removeCategory = useRatesStore((state) => state.removeCategory);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [rate, setRate] = useState('');
    const [errors, setErrors] = useState<CategoryErrors>({});
    const [message, setMessage] = useState('');

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setRate('');
        setErrors({});
    };

    const startEditing = (category: Category) => {
        setEditingId(category.id);
        setName(category.name);
        setRate(String(category.tariffRate));
        setErrors({});
        setMessage('');
    };

    const save = () => {
        const form = { name, tariffRate: parseAmount(rate) };
        const found = validateCategory(form);
        setErrors(found);
        if (Object.keys(found).length > 0) return;
        if (editingId) updateCategory(editingId, form.name, form.tariffRate);
        else addCategory(form.name, form.tariffRate);
        setMessage('');
        resetForm();
    };

    const remove = (category: Category) => {
        const removed = removeCategory(category.id, operations);
        setMessage(removed ? '' : `No se puede eliminar "${category.name}": hay operaciones que la usan.`);
        if (removed && editingId === category.id) resetForm();
    };

    const confirmRemove = (category: Category) => {
        Alert.alert('Eliminar categoría', `¿Eliminar "${category.name}"?`, [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Eliminar', style: 'destructive', onPress: () => remove(category) },
        ]);
    };

    return (
        <Screen title="Categorías">
            <Card>
                <Text className="text-base font-bold text-texto1">Aranceles por categoría</Text>
                {categories.length === 0 ? (
                    <Text className="text-sm text-texto2">No hay categorías. Agrega una para poder cotizar.</Text>
                ) : null}
                {categories.map((category) => (
                    <View
                        key={category.id}
                        className="flex-row items-center justify-between gap-3 border-b border-borde py-2"
                    >
                        <Pressable className="flex-1" onPress={() => startEditing(category)} accessibilityRole="button">
                            <Text className="text-base text-texto1">{category.name}</Text>
                            <Text className="text-sm text-texto2">Toca para editar</Text>
                        </Pressable>
                        <Text className="text-base font-bold text-texto1">{category.tariffRate}%</Text>
                        <Pressable onPress={() => confirmRemove(category)} hitSlop={8} accessibilityRole="button">
                            <Text className="text-sm font-semibold text-rojo">Eliminar</Text>
                        </Pressable>
                    </View>
                ))}
                {message ? <Text className="text-sm text-rojo">{message}</Text> : null}
            </Card>

            <Card>
                <Text className="text-base font-bold text-texto1">
                    {editingId ? 'Editar categoría' : 'Agregar categoría'}
                </Text>
                <Field label="Nombre" value={name} onChangeText={setName} error={errors.name} />
                <Field label="Arancel (%)" value={rate} onChangeText={setRate} numeric error={errors.tariffRate} />
                <Button label={editingId ? 'Guardar cambios' : 'Agregar'} onPress={save} />
                {editingId ? <Button label="Cancelar" variant="secondary" onPress={resetForm} /> : null}
            </Card>
        </Screen>
    );
}
