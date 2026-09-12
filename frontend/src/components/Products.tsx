const products = [
  {
    name: "Wildflower Honey",
    description:
      "A smooth, floral honey collected from bees foraging across seasonal wildflowers.",
    weight: "500 g",
    price: "₹349",
    background: "bg-[#f6cc72]",
  },
  {
    name: "Forest Honey",
    description:
      "A rich and full-bodied honey sourced from flowering trees in natural forest regions.",
    weight: "500 g",
    price: "₹449",
    background: "bg-[#b9c99b]",
  },
  {
    name: "Jamun Honey",
    description:
      "A distinctive honey with deep colour and a mildly tangy flavour from Jamun blossoms.",
    weight: "500 g",
    price: "₹399",
    background: "bg-[#c6adca]",
  },
];

export default function Products() {
  return (
    <section id="products" className="bg-white px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d88a16]">
              Our collection
            </p>

            <h2 className="mt-3 max-w-2xl text-4xl font-bold tracking-tight text-[#243b2a] sm:text-5xl">
              Honey for every taste
            </h2>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-[#657168]">
              Discover naturally harvested varieties, each shaped by the
              flowers and landscapes surrounding its hive.
            </p>
          </div>

          <a
            href="#"
            className="font-semibold text-[#315c3a] transition hover:text-[#d88a16]"
          >
            View all products →
          </a>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => (
            <article
              key={product.name}
              className="overflow-hidden rounded-3xl border border-[#eee7d8] bg-[#fffdf8] shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              <div
                className={`relative flex h-64 items-center justify-center overflow-hidden ${product.background}`}
              >
                <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-white/20" />

                <div className="relative flex h-44 w-32 flex-col items-center justify-center rounded-[2rem] rounded-t-xl border-4 border-[#fff1c9] bg-gradient-to-b from-[#eeb02f] to-[#b96912] shadow-xl">
                  <div className="absolute -top-4 h-7 w-20 rounded-t-md bg-[#315c3a]" />

                  <div className="rounded-full bg-[#fff8e7] px-4 py-4 text-center text-[#315c3a]">
                    <p className="text-sm font-bold">WildHive</p>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide">
                      Pure Honey
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold text-[#243b2a]">
                      {product.name}
                    </h3>

                    <p className="mt-1 text-sm font-medium text-[#879088]">
                      {product.weight}
                    </p>
                  </div>

                  <p className="text-lg font-bold text-[#d88a16]">
                    {product.price}
                  </p>
                </div>

                <p className="mt-4 leading-7 text-[#657168]">
                  {product.description}
                </p>

                <button
                  type="button"
                  className="mt-6 w-full rounded-full bg-[#315c3a] px-5 py-3 font-semibold text-white transition hover:bg-[#264b2f]"
                >
                  View product
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}