import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import { BRAND } from '@/Shared/Global/colors';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { FormInput } from '@/components/Shared/Forms/FormInput';
import { BottomSheetModal } from '@/components/Shared/Modals/BottomSheetModal';
import { Icon } from '@/components/Shared/Ui/Icon';
import { TRANSPORT_ICONS, TRANSPORT_LABELS, TRANSPORT_MODES } from '@/constants/labels';
import { confirm } from '@/stores/shared/confirmStore';
import type { TransportMode } from '@/types/operation';
import type { Category, CategoryInput } from '@/types/rates';
import { parseAmount } from '@/utils/format';
import { type CategoryErrors, validateCategory } from '@/utils/validation';

type CategorySheetProps = {
    visible: boolean;
    onClose: () => void;
    /** null para crear una categoria nueva. */
    category: Category | null;
    onSave: (input: CategoryInput) => void;
    /** Devuelve false si la categoria no se puede eliminar porque esta en uso. */
    onDelete: (category: Category) => boolean;
    onClosed?: () => void;
};

type RateFields = Record<TransportMode, string>;

const fieldsFrom = (category: Category | null): RateFields => ({
    sea: category?.rates.sea?.toString() ?? '',
    air: category?.rates.air?.toString() ?? '',
    land: category?.rates.land?.toString() ?? '',
});

export function CategorySheet({ visible, onClose, category, onSave, onDelete, onClosed }: CategorySheetProps) {
    const [name, setName] = useState('');
    const [rates, setRates] = useState<RateFields>(() => fieldsFrom(null));
    const [errors, setErrors] = useState<CategoryErrors>({});
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        if (!visible) return;
        setName(category?.name ?? '');
        setRates(fieldsFrom(category));
        setErrors({});
        setDeleteError('');
    }, [visible, category]);

    const buildInput = (): CategoryInput => ({
        name,
        rates: Object.fromEntries(TRANSPORT_MODES.filter((mode) => rates[mode].trim() !== '').map((mode) => [mode, parseAmount(rates[mode])])),
    });

    const save = () => {
        const input = buildInput();
        const found = validateCategory(input);
        setErrors(found);
        if (Object.keys(found).length > 0) return;
        onSave(input);
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

                <View className="gap-2">
                    <Text className="text-sm font-medium text-texto1">Arancel por transporte</Text>
                    <View className="flex-row gap-2">
                        {TRANSPORT_MODES.map((mode) => (
                            <View key={mode} className="flex-1">
                                <FormInput
                                    label={TRANSPORT_LABELS[mode]}
                                    icon={TRANSPORT_ICONS[mode]}
                                    placeholder="—"
                                    suffix="%"
                                    numeric
                                    value={rates[mode]}
                                    onChangeText={(text) => {
                                        setRates((current) => ({ ...current, [mode]: text }));
                                        if (errors.rates) setErrors((current) => ({ ...current, rates: undefined }));
                                    }}
                                    errorMessage={errors[mode]}
                                />
                            </View>
                        ))}
                    </View>
                    {errors.rates ? <Text className="text-xs text-rojo">{errors.rates}</Text> : null}
                    <View className="flex-row items-start gap-2 rounded-xl border border-amarillo/40 bg-amarillo/15 px-3 py-2.5">
                        <Icon name="circle-alert" size={16} color={BRAND.amarillo} />
                        <Text className="flex-1 text-xs leading-4 text-texto1">
                            Si dejas un transporte vacío, la categoría no se ofrecerá al cotizar con ese transporte. Escribe 0 si el arancel es cero.
                        </Text>
                    </View>
                </View>

                <ActionButton label={category ? 'Guardar cambios' : 'Agregar categoría'} icon="check" onPress={save} />
                {category ? <ActionButton label="Eliminar categoría" icon="trash" variant="danger" onPress={remove} /> : null}
                {deleteError ? <Text className="text-center text-xs text-rojo">{deleteError}</Text> : null}
            </View>
        </BottomSheetModal>
    );
}
