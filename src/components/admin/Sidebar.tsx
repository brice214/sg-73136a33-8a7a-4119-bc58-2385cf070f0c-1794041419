import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Package,
  Newspaper,
  AlertCircle,
  DollarSign,
  Image,
  Bell,
  Video,
  LogOut,
  ChevronRight,
  TrendingUp,
  Crown,
  UserCircle,
  BarChart3,
  Stethoscope,
  ShoppingCart,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { AdminRole } from "@/types/admin";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  roles: AdminRole[];
}

const navItems: NavItem[] = [
  // Dashboard (tous)
  {
    label: "Tableau de bord",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: ["super_admin", "agasa", "aganor", "dgccrf"],
  },

  // Super Admin uniquement
  {
    label: "Actualités",
    href: "/admin/actualites",
    icon: Newspaper,
    roles: ["super_admin"],
  },
  {
    label: "WebTV",
    href: "/admin/webtv",
    icon: Video,
    roles: ["super_admin"],
  },
  {
    label: "Publicité",
    href: "/admin/publicite",
    icon: Image,
    roles: ["super_admin"],
  },
  {
    label: "Métriques globales",
    href: "/admin/metriques",
    icon: TrendingUp,
    roles: ["super_admin"],
  },
  {
    label: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
    roles: ["super_admin"],
  },
  {
    label: "Premium",
    href: "/admin/premium",
    icon: Crown,
    roles: ["super_admin"],
  },
  {
    label: "Administrateurs",
    href: "/admin/administrateurs",
    icon: Users,
    roles: ["super_admin"],
  },
  {
    label: "Citoyens",
    href: "/admin/citoyens",
    icon: UserCircle,
    roles: ["super_admin"],
  },

  // AGASA
  {
    label: "Mes actualités",
    href: "/admin/actualites",
    icon: Newspaper,
    roles: ["agasa"],
  },
  {
    label: "Plaintes AGASA",
    href: "/admin/plaintes-agasa",
    icon: AlertCircle,
    roles: ["agasa"],
  },
  {
    label: "Statistiques",
    href: "/admin/stats-agasa",
    icon: TrendingUp,
    roles: ["agasa"],
  },

  // AGANOR
  {
    label: "Registre produits",
    href: "/admin/produits",
    icon: Package,
    roles: ["aganor"],
  },
  {
    label: "Statistiques scans",
    href: "/admin/scans",
    icon: BarChart3,
    roles: ["aganor"],
  },

  // DGCCRF
  {
    label: "Mercuriale",
    href: "/admin/mercuriale",
    icon: DollarSign,
    roles: ["dgccrf"],
  },
  {
    label: "Plaintes DGCCRF",
    href: "/admin/plaintes-dgccrf",
    icon: AlertCircle,
    roles: ["dgccrf"],
  },

  // Mon compte (tous)
  {
    label: "Mon compte",
    href: "/admin/compte",
    icon: User,
    roles: ["super_admin", "agasa", "aganor", "dgccrf"],
  },
];

export function Sidebar() {
  const { session, signOut } = useAdminAuth();
  const router = useRouter();

  if (!session) return null;

  const allowedItems = navItems.filter((item) =>
    item.roles.includes(session.user.role)
  );

  const roleLabels: Record<AdminRole, string> = {
    super_admin: "Super Admin",
    agasa: "AGASA",
    aganor: "AGANOR",
    dgccrf: "DGCCRF",
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-primary to-primary/90 text-white shadow-xl">
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <h1 className="text-xl font-display font-bold">MISSU BALA</h1>
          <p className="mt-1 text-sm text-white/70">Backoffice Admin</p>
        </div>

        {/* User Info */}
        <div className="border-b border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 font-semibold">
              {session.user.full_name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate text-sm">
                {session.user.full_name || "Administrateur"}
              </p>
              <p className="text-xs text-white/60">
                {roleLabels[session.user.role]}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {allowedItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;

            return (
              <Link key={item.href + item.label} href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start gap-3 text-white hover:bg-white/10 hover:text-white",
                    isActive && "bg-white/20 font-semibold"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-white/10 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-white hover:bg-destructive/90 hover:text-white"
            onClick={() => signOut()}
          >
            <LogOut className="h-5 w-5" />
            Déconnexion
          </Button>
        </div>
      </div>
    </aside>
  );
}