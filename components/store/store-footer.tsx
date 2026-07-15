import Link from "next/link";


export default function StoreFooter() {
  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-bold">Netai</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link href="/products" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Shop</Link>
            <Link href="/track" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Track Order</Link>
            <Link href="/account" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Account</Link>
          </nav>
          <p className="text-xs text-muted-foreground">&copy; 2026 Netai Logistics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
