import {
  Archive,
  ArrowLeft,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronDown,
  ChevronsLeft,
  ChevronsRight,
  CircleHelp,
  CirclePlus,
  Clock,
  Inbox,
  KeyRound,
  LayoutDashboard,
  LockKeyhole,
  LogIn,
  LogOut,
  Mail,
  NotebookPen,
  Pencil,
  Plus,
  Route,
  Search,
  Settings,
  ScanSearch,
  Save,
  Trash2,
  UserRound,
  UserPlus,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  add: Plus,
  add_circle: CirclePlus,
  analytics: BarChart3,
  archive: Archive,
  arrow_back: ArrowLeft,
  bolt: Zap,
  check_circle: CheckCircle2,
  close: X,
  dashboard: LayoutDashboard,
  delete: Trash2,
  edit: Pencil,
  edit_note: NotebookPen,
  event_upcoming: CalendarClock,
  expand_more: ChevronDown,
  help_outline: CircleHelp,
  inbox: Inbox,
  key: KeyRound,
  keyboard_double_arrow_left: ChevronsLeft,
  keyboard_double_arrow_right: ChevronsRight,
  lock_reset: LockKeyhole,
  login: LogIn,
  logout: LogOut,
  mail: Mail,
  notifications: Bell,
  person: UserRound,
  person_add: UserPlus,
  route: Route,
  radar: ScanSearch,
  schedule: Clock,
  search: Search,
  settings: Settings,
  save: Save,
  sync: Clock,
  work: BriefcaseBusiness,
};

interface IconProps {
  name: string;
  className?: string;
  "aria-hidden"?: boolean;
}

export function Icon({ name, className, "aria-hidden": ariaHidden = true }: IconProps) {
  const LucideIconComponent = ICONS[name] ?? CircleHelp;
  return (
    <LucideIconComponent
      aria-hidden={ariaHidden}
      className={cn("h-[1em] w-[1em] shrink-0", className)}
      strokeWidth={2}
    />
  );
}
