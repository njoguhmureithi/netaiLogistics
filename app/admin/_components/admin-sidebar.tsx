"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, Package, Tags, ShoppingBag, Users, LogOut, X, Store, Tag, BarChart3, Settings, UserCog, Truck, BookOpen, LayoutTemplate, MessageSquare, MapPin } from "lucide-react";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const allLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, adminOnly: false },
  { href: "/admin/products", label: "Products", icon: Package, adminOnly: false },
  { href: "/admin/categories", label: "Categories", icon: Tags, adminOnly: false },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag, adminOnly: false },
  { href: "/admin/pickup-locations", label: "Pickup Locations", icon: MapPin, adminOnly: false },
  { href: "/admin/customers", label: "Customers", icon: Users, adminOnly: false },
  { href: "/admin/coupons", label: "Coupons", icon: Tag, adminOnly: false },
  { href: "/admin/suppliers", label: "Suppliers", icon: Truck, adminOnly: false },
  { href: "/admin/reviews", label: "Reviews", icon: MessageSquare, adminOnly: false },
  { href: "/admin/blog", label: "Blog", icon: BookOpen, adminOnly: false },
  { href: "/admin/content", label: "Content", icon: LayoutTemplate, adminOnly: false },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, adminOnly: false },
  { href: "/admin/users", label: "User Management", icon: UserCog, adminOnly: true },
  { href: "/admin/settings", label: "Settings", icon: Settings, adminOnly: true },
];

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname() ?? "";
  const { data: session } = useSession() || {};
  const userRole = (session?.user as any)?.role;
  const links = allLinks.filter(l => !l.adminOnly || userRole === "admin");
  return (
    <>
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform lg:translate-x-0 lg:static lg:z-auto",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-14 border-b border-border flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg">Netai</span>
          </div>
          <button onClick={onClose} className="lg:hidden p-1 hover:bg-muted rounded"><X className="h-5 w-5" /></button>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {links.map((l) => {
            const active = pathname === l.href || (l.href !== "/admin" && pathname?.startsWith?.(l.href));
            return (
              <Link key={l.href} href={l.href} onClick={onClose}
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}>
                <l.icon className="h-4 w-4" />{l.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-border space-y-1">
          <Link href="/" onClick={onClose} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <Store className="h-4 w-4" /> View Store
          </Link>
          <button onClick={() => signOut({ callbackUrl: "/" })} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
