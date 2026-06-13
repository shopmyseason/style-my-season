import { Hero } from "@/components/Hero";
import { ProductCatalog } from "@/components/ProductCatalog";

export default function Home() {
  return (
    <div className="min-h-full bg-[#faf9f7]">
      <Hero />
      <ProductCatalog />
      <footer className="border-t border-gray-200/60 px-4 py-8 text-center text-xs text-gray-400 sm:px-6 lg:px-8">
        Style My Season is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.com.
      </footer>
    </div>
  );
}
