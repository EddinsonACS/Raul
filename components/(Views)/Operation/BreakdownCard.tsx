import { Text, View } from 'react-native';
import { Card } from '@/components/Shared/Ui/Card';
import { MoneyRow } from '@/components/Shared/Ui/MoneyRow';
import type { OperationType, TaxBreakdown } from '@/types/operation';
import { formatBs } from '@/utils/format';

type BreakdownCardProps = {
    type: OperationType;
    breakdown: TaxBreakdown;
    exchangeRate: number;
};

export function BreakdownCard({ type, breakdown, exchangeRate }: BreakdownCardProps) {
    return (
        <Card>
            <Text className="text-sm font-semibold text-texto2">Desglose</Text>
            <MoneyRow label="Valor en aduana" amount={breakdown.customsValue} />
            {type === 'import' ? (
                <>
                    <MoneyRow
                        label="Arancel"
                        amount={breakdown.tariff}
                        note={breakdown.tariffExempt ? 'Exento por monto mínimo' : undefined}
                    />
                    <MoneyRow label="IVA" amount={breakdown.vat} />
                </>
            ) : (
                <Text className="text-sm text-texto2">Las exportaciones no pagan arancel ni IVA.</Text>
            )}
            <View className="border-t border-borde pt-2">
                <MoneyRow
                    label={type === 'import' ? 'Total a pagar' : 'Tasa de trámite'}
                    amount={breakdown.total}
                    strong
                />
            </View>
            <Text className="text-xs text-texto2">Tasa: {formatBs(exchangeRate)} por $1.00</Text>
        </Card>
    );
}
