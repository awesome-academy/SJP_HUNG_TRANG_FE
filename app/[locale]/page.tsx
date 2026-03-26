import Hero from "@/components/homepage/Hero";
import FeaturedCategories from "@/components/homepage/FeaturedCategories";
import NewArrivals from "@/components/homepage/NewArrivals";
import BrandValues from "@/components/homepage/BrandValues";
import Lookbook from "@/components/homepage/Lookbook";
import Newsletter from "@/components/homepage/Newsletter";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedCategories />
      <NewArrivals />
      <BrandValues />
      <Lookbook />
      <Newsletter />
    </main>
  );
}

