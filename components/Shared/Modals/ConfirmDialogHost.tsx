import { ActionButton } from '@/components/Shared/Buttons/ActionButton';
import { CenteredModal } from '@/components/Shared/Modals/CenteredModal';
import { useConfirmStore } from '@/stores/shared/confirmStore';
import { useModalDepthStore } from '@/stores/shared/modalDepthStore';

type ConfirmDialogHostProps = {
    /** true cuando se monta dentro de otro modal; el host de la raiz se oculta mientras haya modales abiertos. */
    layer?: boolean;
};

export function ConfirmDialogHost({ layer = false }: ConfirmDialogHostProps) {
    const visible = useConfirmStore((state) => state.visible);
    const options = useConfirmStore((state) => state.options);
    const settle = useConfirmStore((state) => state.settle);
    const depth = useModalDepthStore((state) => state.depth);

    if (!layer && depth > 0 && !visible) return null;
    if (!options) return null;

    return (
        <CenteredModal visible={visible} onClose={() => settle(false)} contentKey="confirm">
            <CenteredModal.Icon name={options.destructive ? 'trash' : 'circle-help'} tone={options.destructive ? 'danger' : 'primary'} />
            <CenteredModal.Title>{options.title}</CenteredModal.Title>
            <CenteredModal.Subtitle>{options.message}</CenteredModal.Subtitle>
            <CenteredModal.Actions>
                <ActionButton
                    label={options.confirmLabel ?? 'Confirmar'}
                    variant={options.destructive ? 'danger' : 'primary'}
                    onPress={() => settle(true)}
                />
                <ActionButton label={options.cancelLabel ?? 'Cancelar'} variant="secondary" onPress={() => settle(false)} />
            </CenteredModal.Actions>
        </CenteredModal>
    );
}
