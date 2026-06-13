import { Hero } from "@/components/Hero";
import { ProductCatalog } from "@/components/ProductCatalog";

export default function Home() {
  return (
    <div className="min-h-full bg-[#faf9f7]">
      <Hero />
      <ProductCatalog />
    </div>
  );
}
