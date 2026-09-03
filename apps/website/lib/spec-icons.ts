import {
  CheckCircle2,
  Mail,
  Tag,
  Truck,
  ShieldCheck,
  Clock,
  Star,
  Zap,
  Package,
  Headphones,
  Globe,
  Lock,
  RefreshCcw,
  Gift,
  CreditCard,
  Smartphone,
  Wifi,
  Download,
  type LucideIcon,
} from "lucide-react";

// ExiusCart sends each real highlight/spec entry's icon as a kebab-case
// identifier string (e.g. "check-circle", "mail", "tag") — confirmed live
// 2026-09-03. This maps the ones seen so far to an actual icon component;
// an unrecognized name falls back to a plain checkmark instead of
// rendering broken raw text.
const ICON_MAP: Record<string, LucideIcon> = {
  "check-circle": CheckCircle2,
  mail: Mail,
  tag: Tag,
  truck: Truck,
  shield: ShieldCheck,
  "shield-check": ShieldCheck,
  clock: Clock,
  star: Star,
  zap: Zap,
  package: Package,
  headphones: Headphones,
  globe: Globe,
  lock: Lock,
  refresh: RefreshCcw,
  gift: Gift,
  "credit-card": CreditCard,
  smartphone: Smartphone,
  wifi: Wifi,
  download: Download,
};

export function getSpecIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? CheckCircle2;
}
