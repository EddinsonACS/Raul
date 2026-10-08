import { useRouter } from 'expo-router';
import { Text } from 'react-native';
import { Button } from '@/components/Shared/Button';
import { Screen } from '@/components/Shared/Screen';
import { goToTab } from '@/utils/navigation';

export function OperationMissing() {
    const router = useRouter();

    return (
        <Screen title="Operación">
            <Text className="text-base text-texto2">Esta operación ya no existe.</Text>
            <Button label="Ir al historial" onPress={() => goToTab(router, '/History')} />
        </Screen>
    );
}
