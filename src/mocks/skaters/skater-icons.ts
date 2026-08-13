import {
  ArrowDownIcon,
  ArrowRightIcon,
  ArrowUpIcon,
  CheckCircle2,
  Circle,
  CircleCheck,
  CircleHelp,
  type LucideIcon,
  Timer,
} from "lucide-react";

import type { SkaterStance, SkaterStatus, SkaterStyle } from "./skater.types";

const statusIcons: Record<SkaterStatus, LucideIcon> = {
  amateur: Circle,
  sponsored: Timer,
  pro: CheckCircle2,
  legend: CircleCheck,
};

const stanceIcons: Record<SkaterStance, LucideIcon> = {
  regular: ArrowRightIcon,
  goofy: ArrowDownIcon,
};

const styleIcons: Record<SkaterStyle, LucideIcon> = {
  street: CircleCheck,
  vert: ArrowUpIcon,
  park: Circle,
  freestyle: CircleHelp,
  "all-around": CheckCircle2,
};

export function getSkaterStatusIcon(status: SkaterStatus | null) {
  return status ? statusIcons[status] : undefined;
}

export function getStanceIcon(stance: SkaterStance | null) {
  return stance ? stanceIcons[stance] : undefined;
}

export function getStyleIcon(style: SkaterStyle | null) {
  return style ? styleIcons[style] : undefined;
}
