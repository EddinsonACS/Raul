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
    Moon,
    PackageCheck,
    Pencil,
    Plus,
    Receipt,
    Search,
    Settings,
    Ship,
    Smartphone,
    Sun,
    Tags,
    Trash2,
    TrendingUp,
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
    moon: Moon,
    'package-check': PackageCheck,
    pencil: Pencil,
    plus: Plus,
    receipt: Receipt,
    search: Search,
    settings: Settings,
    ship: Ship,
    smartphone: Smartphone,
    sun: Sun,
    tags: Tags,
    trash: Trash2,
    'trending-up': TrendingUp,
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
