import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { FormInput } from '@/components/Shared/Forms/FormInput';
import { BottomSheetModal } from '@/components/Shared/Modals/BottomSheetModal';
import { confirm } from '@/stores/shared/confirmStore';
import type { Category } from '@/types/rates';
import { parseAmount } from '@/utils/format';
import { type CategoryErrors, validateCategory } from '@/utils/validation';

type CategorySheetProps = {
    visible: boolean;
    onClose: () => void;
    /** null para crear una categoria nueva. */
    category: Category | null;
    onSave: (name: string, tariffRate: number) => void;
    /** Devuelve false si la categoria no se puede eliminar porque esta en uso. */
    onDelete: (category: Category) => boolean;
    onClosed?: () => void;
};

export function CategorySheet({ visible, onClose, category, onSave, onDelete, onClosed }: CategorySheetProps) {
    const [name, setName] = useState('');
    const [rate, setRate] = useState('');
    const [errors, setErrors] = useState<CategoryErrors>({});
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        if (!visible) return;
        setName(category?.name ?? '');
        setRate(category ? String(category.tariffRate) : '');
        setErrors({});
        setDeleteError('');
    }, [visible, category]);

    const save = () => {
        const form = { name, tariffRate: parseAmount(rate) };
        const found = validateCategory(form);
        setErrors(found);
        if (Object.keys(found).length > 0) return;
        onSave(form.name.trim(), form.tariffRate);
    };

    const remove = async () => {
        if (!category) return;
        const ok = await confirm({
            title: 'Eliminar categoría',
            message: `"${category.name}" dejará de estar disponible para cotizar.`,
            confirmLabel: 'Eliminar',
            destructive: true,
        });
        if (!ok) return;
        if (!onDelete(category)) setDeleteError('No se puede eliminar: hay operaciones registradas con esta categoría.');
    };

    return (
        <BottomSheetModal visible={visible} onClose={onClose} title={category ? 'Editar categoría' : 'Nueva categoría'} onClosed={onClosed}>
            <View className="gap-4 pb-2">
                <FormInput label="Nombre" placeholder="Ej. Repuestos" value={name} onChangeText={setName} errorMessage={errors.name} autoFocus={!category} />
                <FormInput
                    label="Arancel"
                    placeholder="0"
                    value={rate}
                    onChangeText={setRate}
                    errorMessage={errors.tariffRate}
                    hint="Porcentaje del valor en aduana que paga esta categoría."
                    suffix="%"
                    numeric
                />
                <ActionButton label={category ? 'Guardar cambios' : 'Agregar categoría'} icon="check" onPress={save} />
                {category ? <ActionButton label="Eliminar categoría" icon="trash" variant="danger" onPress={remove} /> : null}
                {deleteError ? <Text className="text-center text-xs text-rojo">{deleteError}</Text> : null}
            </View>
        </BottomSheetModal>
    );
}
