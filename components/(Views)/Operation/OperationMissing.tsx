import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Button } from '@/components/Shared/Button';
import { Screen } from '@/components/Shared/Screen';

export function OperationMissing() {
    const router = useRouter();

    return (
        <Screen title="Operación">
            <Text className="text-base text-texto2">Esta operación ya no existe.</Text>
            <Button label="Ir al historial" onPress={() => router.replace('/History')} />
        </Screen>
    );
}
