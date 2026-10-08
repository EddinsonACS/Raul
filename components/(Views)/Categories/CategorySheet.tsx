import { useEffect, useState } from 'react';
import { Switch, Text, View } from 'react-native';
import { COLORS } from '@/Shared/Global/colors';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { InfoTooltip } from '@/components/Shared/Buttons/InfoTooltip';
import { FormInput } from '@/components/Shared/Forms/FormInput';
import { BottomSheetModal } from '@/components/Shared/Modals/BottomSheetModal';
import { TRANSPORT_ICONS, TRANSPORT_LABELS, TRANSPORT_MODES } from '@/constants/labels';
import { hasModeRates } from '@/services/taxes/tariff';
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

type ModeFields = Record<TransportMode, string>;

const emptyModes = (): ModeFields => ({ sea: '', air: '', land: '' });

export function CategorySheet({ visible, onClose, category, onSave, onDelete, onClosed }: CategorySheetProps) {
    const [name, setName] = useState('');
    const [rate, setRate] = useState('');
    const [byMode, setByMode] = useState(false);
    const [modes, setModes] = useState<ModeFields>(emptyModes);
    const [errors, setErrors] = useState<CategoryErrors>({});
    const [deleteError, setDeleteError] = useState('');

    useEffect(() => {
        if (!visible) return;
        setName(category?.name ?? '');
        setRate(category ? String(category.tariffRate) : '');
        setByMode(category ? hasModeRates(category) : false);
        setModes({
            sea: category?.tariffByMode?.sea?.toString() ?? '',
            air: category?.tariffByMode?.air?.toString() ?? '',
            land: category?.tariffByMode?.land?.toString() ?? '',
        });
        setErrors({});
        setDeleteError('');
    }, [visible, category]);

    const buildInput = (): CategoryInput => {
        const tariffByMode = byMode
            ? Object.fromEntries(TRANSPORT_MODES.filter((mode) => modes[mode].trim() !== '').map((mode) => [mode, parseAmount(modes[mode])]))
            : undefined;
        return { name, tariffRate: parseAmount(rate), tariffByMode };
    };

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
                <FormInput
                    label={byMode ? 'Arancel general' : 'Arancel'}
                    placeholder="0"
                    value={rate}
                    onChangeText={setRate}
                    errorMessage={errors.tariffRate}
                    hint={byMode ? 'Se usa para los transportes sin arancel propio.' : 'Porcentaje del valor en aduana que paga esta categoría.'}
                    suffix="%"
                    numeric
                />
                <View className="flex-row items-center justify-between rounded-2xl bg-fondo3 px-4 py-3">
                    <View className="flex-1 flex-row items-center gap-1.5">
                        <Text className="text-sm font-medium text-texto1">Arancel distinto por transporte</Text>
                        <InfoTooltip term="transport" size={14} />
                    </View>
                    <Switch
                        value={byMode}
                        onValueChange={setByMode}
                        trackColor={{ false: COLORS.borde, true: COLORS.primario }}
                        thumbColor={COLORS.fondo2}
                        accessibilityLabel="Arancel distinto por transporte"
                    />
                </View>
                {byMode ? (
                    <View className="flex-row gap-2">
                        {TRANSPORT_MODES.map((mode) => (
                            <View key={mode} className="flex-1">
                                <FormInput
                                    label={TRANSPORT_LABELS[mode]}
                                    icon={TRANSPORT_ICONS[mode]}
                                    placeholder="—"
                                    suffix="%"
                                    numeric
                                    value={modes[mode]}
                                    onChangeText={(text) => setModes((current) => ({ ...current, [mode]: text }))}
                                    errorMessage={errors[mode]}
                                />
                            </View>
                        ))}
                    </View>
                ) : null}
                <ActionButton label={category ? 'Guardar cambios' : 'Agregar categoría'} icon="check" onPress={save} />
                {category ? <ActionButton label="Eliminar categoría" icon="trash" variant="danger" onPress={remove} /> : null}
                {deleteError ? <Text className="text-center text-xs text-rojo">{deleteError}</Text> : null}
            </View>
        </BottomSheetModal>
    );
}
