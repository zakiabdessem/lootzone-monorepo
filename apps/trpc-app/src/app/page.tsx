import { api, HydrateClient } from "~/trpc/server";
import HeroCardsMobile from "./_components/landing/hero/HeroCardsMobile";
import CategoryBar from "./_components/landing/_components/CategoryBar";
import HeroCarousel from "./_components/landing/hero/HeroCarousel";
import RecentlyViewed from "./_components/landing/_components/RecentlyViewed";
import RecommendedForYou from "./_components/landing/_components/RecommendedForYou";
import Testimonials from "./_components/landing/_components/Testimonials";
import ProductCategories from "./_components/landing/_components/ProductCategories";
import ContactUs from "./_components/landing/_components/ContactUs";

export default async function Home() {
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
