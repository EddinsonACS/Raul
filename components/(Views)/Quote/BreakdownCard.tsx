import { Text, View } from 'react-native';
import { COLORS } from '@/Shared/Global/colors';
import { InfoTooltip } from '@/components/Shared/Buttons/InfoTooltip';
import { Card } from '@/components/Shared/Ui/Card';
import { Icon } from '@/components/Shared/Ui/Icon';
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
            <Text className="text-xs font-semibold uppercase tracking-wider text-texto2">Desglose</Text>
            <MoneyRow label="Valor en aduana" amount={breakdown.customsValue} accessory={<InfoTooltip term="customsValue" />} />
            {type === 'import' ? (
                <>
                    {breakdown.exempt ? (
                        <View className="flex-row items-center gap-2 rounded-xl bg-verde/15 px-3 py-2">
                            <Icon name="circle-check" size={16} color={COLORS.texto1} />
                            <Text className="flex-1 text-xs text-texto1">
                                Envío exento: el producto no supera el mínimo. No paga arancel, tasa ni IVA.
                            </Text>
                            <InfoTooltip term="exemptMinimum" />
                        </View>
                    ) : null}
                    <MoneyRow label="Arancel" amount={breakdown.tariff} accessory={<InfoTooltip term="tariff" />} />
                    <MoneyRow label="Tasa aduanera" amount={breakdown.customsFee} accessory={<InfoTooltip term="customsFee" />} />
                    <MoneyRow label="IVA" amount={breakdown.vat} accessory={<InfoTooltip term="vat" />} />
                </>
            ) : (
                <Text className="text-sm text-texto2">Las exportaciones no pagan arancel ni IVA; solo la tasa de trámite.</Text>
            )}
            <View className="border-t border-borde pt-3">
                <MoneyRow
                    label={type === 'import' ? 'Total a pagar' : 'Tasa de trámite'}
                    amount={breakdown.total}
                    strong
                    accessory={type === 'export' ? <InfoTooltip term="exportFee" /> : undefined}
                />
            </View>
            <Text className="text-xs text-texto2">Calculado con {formatBs(exchangeRate)} por $1.00</Text>
        </Card>
    );
}
