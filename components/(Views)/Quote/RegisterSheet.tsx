import { useState } from 'react';
import { Text, View } from 'react-native';
import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { FormInput } from '@/components/Shared/Forms/FormInput';
import { BottomSheetModal } from '@/components/Shared/Modals/BottomSheetModal';
import { MoneyRow } from '@/components/Shared/Ui/MoneyRow';
import { TYPE_LABELS } from '@/constants/labels';
import type { Money, OperationType } from '@/types/operation';

type RegisterSheetProps = {
    visible: boolean;
    onClose: () => void;
    type: OperationType;
    categoryName: string;
    total: Money;
    onRegister: (description: string) => void;
    /** Se llama cuando la hoja termino de cerrarse. */
    onClosed?: () => void;
};

export function RegisterSheet({ visible, onClose, type, categoryName, total, onRegister, onClosed }: RegisterSheetProps) {
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | undefined>();

    const submit = () => {
        if (description.trim() === '') {
            setError('Escribe una descripción.');
            return;
        }
        onRegister(description.trim());
    };

    const reset = () => {
        setDescription('');
        setError(undefined);
        onClosed?.();
    };

    return (
        <BottomSheetModal visible={visible} onClose={onClose} title="Registrar operación" onClosed={reset}>
            <View className="gap-4 pb-2">
                <View className="gap-2 rounded-2xl bg-fondo3 p-4">
                    <View className="flex-row justify-between">
                        <Text className="text-sm text-texto2">Tipo</Text>
                        <Text className="text-sm font-medium text-texto1">{TYPE_LABELS[type]}</Text>
                    </View>
                    <View className="flex-row justify-between">
                        <Text className="text-sm text-texto2">Categoría</Text>
                        <Text className="text-sm font-medium text-texto1">{categoryName}</Text>
                    </View>
                    <MoneyRow label="Total a pagar" amount={total} strong />
                </View>
                <FormInput
                    label="Descripción de la mercancía"
                    placeholder="Ej. Teléfono celular"
                    value={description}
                    onChangeText={(text) => {
                        setDescription(text);
                        if (error) setError(undefined);
                    }}
                    errorMessage={error}
                    autoFocus
                    returnKeyType="done"
                    onSubmitEditing={submit}
                />
                <ActionButton label="Registrar y continuar al pago" icon="check" onPress={submit} />
            </View>
        </BottomSheetModal>
    );
}
