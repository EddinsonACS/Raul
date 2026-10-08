import { ScrollView } from 'react-native';
import { Chip } from '@/components/Shared/Forms/Chip';
import type { IconName } from '@/components/Shared/Ui/Icon';

export type FilterOption<T extends string> = {
    key: T;
    label: string;
    icon?: IconName;
};

type FilterChipsProps<T extends string> = {
    options: FilterOption<T>[];
    value: T;
    onChange: (value: T) => void;
};

/** Fila horizontal de chips con una sola opcion activa. */
export function FilterChips<T extends string>({ options, value, onChange }: FilterChipsProps<T>) {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {options.map((option) => (
                <Chip key={option.key} label={option.label} icon={option.icon} selected={option.key === value} onPress={() => onChange(option.key)} />
            ))}
        </ScrollView>
    );
}
