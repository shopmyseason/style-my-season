export function Hero() {
  return (
    <header className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-violet-50 to-amber-50" />
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="absolute -right-16 top-12 h-80 w-80 rounded-full bg-violet-200/35 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-amber-100/50 blur-3xl" />
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
          Personal color styling
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight text-gray-900 sm:text-5xl lg:text-6xl lg:leading-[1.1]">
          Seasonal Color Match
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-gray-600 sm:text-lg">
          Discover clothing that harmonizes with your seasonal palette — scored,
          sorted, and styled for you.
        </p>
        <div className="mx-auto mt-10 flex max-w-lg flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-rose-500 shadow-sm">
              12
            </span>
            <span>Seasonal palettes</span>
          </div>
          <div className="hidden h-4 w-px bg-gray-300 sm:block" />
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/70 text-violet-500 shadow-sm">
              ✓
            </span>
            <span>Smart color scoring</span>
          </div>
        </div>
      </div>
    </header>
  );
}
