import { useRouter } from 'expo-router';
import { Screen } from '@/components/Layout/Screen';
import { EmptyState } from '@/components/Shared/Feedback/EmptyState';
import { goToTab } from '@/utils/navigation';

export function OperationMissing() {
    const router = useRouter();

    return (
        <Screen title="Operación" onBack={() => (router.canGoBack() ? router.back() : goToTab(router, '/History'))}>
            <EmptyState
                icon="inbox"
                title="Esta operación ya no existe"
                subtitle="Puede que haya sido eliminada."
                action={{ label: 'Ir al historial', icon: 'history', onPress: () => goToTab(router, '/History') }}
            />
        </Screen>
    );
}
