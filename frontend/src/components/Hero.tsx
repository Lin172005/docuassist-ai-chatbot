"use client";

export default function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="/bg.png"
          alt=""
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6 py-16">
        <div className="max-w-2xl">
          <p className="mb-5 inline-flex rounded-full border border-white/30 bg-white/15 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm">
            Pure honey from trusted hives
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight text-white sm:text-6xl">
            Pure honey, just as
            <span className="text-[#f6cc72]"> nature intended.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-white/90">
            Naturally harvested honey with its authentic flavour, aroma and
            goodness carefully preserved from hive to home.
          </p>

          <div className="mt-9 flex flex-col gap-4 sm:flex-row">
            <a
              href="/products"
              className="rounded-full bg-[#d88a16] px-7 py-3.5 text-center font-semibold text-white transition hover:bg-[#bd7410]"
            >
              Discover our honey
            </a>

            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent("open-chat"));
              }}
              className="rounded-full border border-white/60 px-7 py-3.5 text-center font-semibold text-white transition hover:bg-white hover:text-[#243b2a]"
            >
              Ask our honey guide
            </button>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-white/80">
            <span>100% pure</span>
            <span>Responsibly sourced</span>
            <span>Nothing artificial</span>
          </div>
        </div>
      </div>
    </section>
  );
}
