import StoreHeader from "@/components/store/store-header";
import StoreFooter from "@/components/store/store-footer";
import RecentlyViewed from "@/components/store/recently-viewed";
import PromoPopup from "@/components/store/promo-popup";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <StoreHeader />
      <main className="flex-1">
        {children}
        <RecentlyViewed />
      </main>
      <StoreFooter />
      <PromoPopup />
    </div>
  );
}
