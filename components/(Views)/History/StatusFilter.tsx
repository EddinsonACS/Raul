import { ScrollView } from 'react-native';
import { Chip } from '@/components/Shared/Forms/Chip';
import { STATUS_LABELS } from '@/constants/labels';
import type { StatusFilter as StatusFilterValue } from '@/services/operations/filters';

const FILTERS: { key: StatusFilterValue; label: string }[] = [
    { key: 'all', label: 'Todas' },
    { key: 'pending', label: STATUS_LABELS.pending + 's' },
    { key: 'paid', label: STATUS_LABELS.paid + 's' },
    { key: 'released', label: STATUS_LABELS.released + 's' },
];

type StatusFilterProps = {
    value: StatusFilterValue;
    onChange: (value: StatusFilterValue) => void;
};

export function StatusFilter({ value, onChange }: StatusFilterProps) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {FILTERS.map((filter) => (
                <Chip key={filter.key} label={filter.label} selected={filter.key === value} onPress={() => onChange(filter.key)} />
            ))}
        </ScrollView>
    );
}
