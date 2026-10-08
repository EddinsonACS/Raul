import {
    ArrowLeft,
    Banknote,
    Calculator,
    Check,
    ChevronRight,
    CircleAlert,
    CircleCheck,
    CircleHelp,
    FileText,
    History,
    House,
    Inbox,
    Info,
    type LucideIcon,
    PackageCheck,
    Pencil,
    Plane,
    Plus,
    Receipt,
    Search,
    Settings,
    Ship,
    Tags,
    Trash2,
    TrendingUp,
    Truck,
    Wallet,
    X,
} from 'lucide-react-native';

// Registro explicito: solo los iconos que usa la app entran al bundle.
const ICONS = {
    'arrow-left': ArrowLeft,
    banknote: Banknote,
    calculator: Calculator,
    check: Check,
    'chevron-right': ChevronRight,
    'circle-alert': CircleAlert,
    'circle-check': CircleCheck,
    'circle-help': CircleHelp,
    'file-text': FileText,
    history: History,
    house: House,
    inbox: Inbox,
    info: Info,
    'package-check': PackageCheck,
    pencil: Pencil,
    plane: Plane,
    plus: Plus,
    receipt: Receipt,
    search: Search,
    settings: Settings,
    ship: Ship,
    tags: Tags,
    trash: Trash2,
    'trending-up': TrendingUp,
    truck: Truck,
    wallet: Wallet,
    x: X,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

type IconProps = {
    name: IconName;
    size?: number;
    color: string;
    strokeWidth?: number;
};

export function Icon({ name, size = 22, color, strokeWidth = 2 }: IconProps) {
    const LucideIcon = ICONS[name];
    return <LucideIcon size={size} color={color} strokeWidth={strokeWidth} />;
}
