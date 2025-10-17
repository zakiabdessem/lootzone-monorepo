import { api, HydrateClient } from "~/trpc/server";
import CategoryBar from "./_components/landing/_components/CategoryBar";
import ContactUs from "./_components/landing/_components/ContactUs";
import ProductCategories from "./_components/landing/_components/ProductCategories";
import RecentlyViewed from "./_components/landing/_components/RecentlyViewed";
import RecommendedForYou from "./_components/landing/_components/RecommendedForYou";
import Testimonials from "./_components/landing/_components/Testimonials";
import HeroCardsMobile from "./_components/landing/hero/HeroCardsMobile";
import HeroCarousel from "./_components/landing/hero/HeroCarousel";

export const revalidate = 60;

export default async function Home() {
  // SEO & performance: prefetch recommended products and recently viewed
  await api.product.getRecommended.prefetch({ limit: 16 });
  await api.product.getRecentlyViewed.prefetch({ limit: 16 });
  
  return (
    <HydrateClient>
      <main className="content min-h-screen">
        {/* Mobile hero (<1114px) */}
        <div className="block min-[1114px]:hidden">
          <HeroCardsMobile />
        </div>
        {/* Desktop hero (>=1114px) */}
        <div className="hidden min-[1114px]:block">
          <HeroCarousel />
        </div>
        <CategoryBar />

        <RecentlyViewed />
        <RecommendedForYou />
        <Testimonials />

        <ProductCategories />

        <ContactUs />
      </main>
    </HydrateClient>
  );
}
