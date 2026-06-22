import Link from "next/link";
import { MakeupCatalog } from "@/components/MakeupCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Makeup — Style My Season",
  description:
    "Discover makeup colors that harmonize with your seasonal palette — lipstick, blush, eyeshadow, and more.",
};

export default function MakeupPage() {
  return (
    <div className="min-h-full bg-[#faf9f7]">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-50" />
        <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
        <div className="absolute -right-16 top-12 h-80 w-80 rounded-full bg-pink-200/35 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-fuchsia-100/50 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.04) 1px, transparent 0)",
            backgroundSize: "24px 24px",
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 pb-28 pt-16 text-center sm:px-6 sm:pb-32 sm:pt-20 lg:px-8 lg:pt-24">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600 shadow-sm backdrop-blur-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
            Makeup color matching
          </div>
          <h1 className="font-serif text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl lg:text-6xl lg:leading-[1.1]">
            Makeup
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
            Find lipstick, blush, eyeshadow, and more in shades that complement
            your seasonal color palette.
          </p>
          <p className="mt-3 text-sm text-gray-500">
            <Link
              href="/"
              className="font-medium text-rose-600 underline underline-offset-2 hover:text-rose-700"
            >
              ← Back to clothing
            </Link>
            {" · "}
            <Link
              href="/seasons"
              className="font-medium text-rose-600 underline underline-offset-2 hover:text-rose-700"
            >
              Learn about the 12 palettes →
            </Link>
          </p>
        </div>
      </header>

      <MakeupCatalog />

      <footer className="border-t border-gray-200/60 px-4 py-8 text-center text-xs text-gray-400 sm:px-6 lg:px-8">
        Style My Season is a participant in the Amazon Services LLC Associates
        Program, an affiliate advertising program designed to provide a means for
        sites to earn advertising fees by advertising and linking to Amazon.com.
      </footer>
    </div>
  );
}
