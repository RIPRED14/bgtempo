import React from "react";
import { cn } from "@/lib/utils";
import {
  Home,
  CalendarDays,
  Users,
  AlertTriangle,
  BarChart3,
  Settings,
  Utensils,
  User,
} from "lucide-react";
import { NotificationCenter } from "@/components/ui/notification-center";

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  href?: string;
}

const SidebarItem: React.FC<SidebarItemProps> = ({
  icon,
  label,
  active = false,
  href = "#",
}) => {
  return (
    <a
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all hover:text-primary",
        active
          ? "bg-blue-50 text-blue-600 font-medium"
          : "text-slate-600 hover:bg-slate-100",
      )}
    >
      {icon}
      <span>{label}</span>
    </a>
  );
};

export const Sidebar: React.FC = () => {
  // Get current path to determine active link
  const currentPath = window.location.pathname;

  return (
    <div className="hidden md:flex h-screen w-64 flex-col border-r bg-white p-6">
      <div className="flex items-center justify-between gap-2 mb-8">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded">
            <Utensils className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold">Burger Staff</h1>
        </div>
        <NotificationCenter />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
            A
          </div>
          <div>
            <div className="font-medium">Admin</div>
            <div className="text-xs text-slate-500">Restaurant Manager</div>
          </div>
        </div>
      </div>

      <div className="text-xs font-semibold text-slate-400 mb-2 pl-3 uppercase tracking-wider">
        Menu Principal
      </div>
      <nav className="space-y-1.5">
        <SidebarItem
          icon={<Home className="h-5 w-5" />}
          label="Tableau de Bord"
          active={currentPath === "/" || currentPath === "/admin"}
          href="/"
        />
        <SidebarItem
          icon={<CalendarDays className="h-5 w-5" />}
          label="Planning"
          active={currentPath === "/planning"}
          href="/planning"
        />
        <SidebarItem
          icon={<Users className="h-5 w-5" />}
          label="Employés"
          active={currentPath === "/employees"}
          href="/employees"
        />
        <SidebarItem
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Absences"
          href="/absences"
        />
      </nav>

      <div className="text-xs font-semibold text-slate-400 mt-6 mb-2 pl-3 uppercase tracking-wider">
        Analyse
      </div>
      <nav className="space-y-1.5">
        <SidebarItem
          icon={<BarChart3 className="h-5 w-5" />}
          label="Rapports"
          href="/reports"
        />
      </nav>

      <div className="text-xs font-semibold text-slate-400 mt-6 mb-2 pl-3 uppercase tracking-wider">
        Portail
      </div>
      <nav className="space-y-1.5">
        <SidebarItem
          icon={<User className="h-5 w-5" />}
          label="Espace Employé"
          href="/employee/login"
        />
      </nav>

      <div className="mt-auto pt-4 border-t">
        <SidebarItem
          icon={<Settings className="h-5 w-5" />}
          label="Paramètres"
          href="/settings"
        />
      </div>
    </div>
  );
};
