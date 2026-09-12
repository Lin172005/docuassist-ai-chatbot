export default function Hero() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2">
      <div>
        <p className="mb-5 inline-flex rounded-full border border-[#e7b75f] bg-[#fff3d6] px-4 py-2 text-sm font-semibold text-[#9b5d08]">
          Pure honey from trusted hives
        </p>

        <h1 className="max-w-2xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl">
          Pure honey, just as
          <span className="text-[#d88a16]"> nature intended.</span>
        </h1>

        <p className="mt-6 max-w-xl text-lg leading-8 text-[#56695a]">
          Naturally harvested honey with its authentic flavour, aroma and
          goodness carefully preserved from hive to home.
        </p>

        <div className="mt-9 flex flex-col gap-4 sm:flex-row">
          <a
            href="#products"
            className="rounded-full bg-[#d88a16] px-7 py-3.5 text-center font-semibold text-white transition hover:bg-[#bd7410]"
          >
            Discover our honey
          </a>

          <button className="rounded-full border border-[#315c3a] px-7 py-3.5 font-semibold text-[#315c3a] transition hover:bg-[#315c3a] hover:text-white">
            Ask our honey guide
          </button>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium text-[#56695a]">
          <span>100% pure</span>
          <span>Responsibly sourced</span>
          <span>Nothing artificial</span>
        </div>
      </div>

      <div className="relative flex items-center justify-center">
        <div className="absolute h-72 w-72 rounded-full bg-[#f5c96c]/40 blur-3xl sm:h-96 sm:w-96" />

        <div className="relative w-full max-w-md rounded-[2rem] bg-[#315c3a] p-8 text-white shadow-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#f7d88f]">
            WildHive Natural Honey
          </p>

          <div className="my-10 flex justify-center">
            <div className="flex h-64 w-48 flex-col items-center justify-center rounded-[3rem] rounded-t-[1.5rem] border-8 border-[#f3d18a] bg-gradient-to-b from-[#f2b233] to-[#b9630d] shadow-xl">
              <div className="rounded-full bg-[#fff7df] px-6 py-5 text-center text-[#315c3a]">
                <p className="text-xl font-bold">WildHive</p>

                <p className="mt-1 text-xs font-semibold uppercase tracking-wider">
                  Raw Honey
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-white/20 pt-6">
            <div>
              <p className="text-sm text-[#d8e5d9]">From hive to home</p>
              <p className="mt-1 font-semibold">Naturally delicious</p>
            </div>

            <div className="rounded-full bg-white/10 px-4 py-2 text-sm font-semibold">
              500 g
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}