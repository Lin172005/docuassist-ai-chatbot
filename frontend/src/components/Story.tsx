const journeySteps = [
  {
    number: "01",
    title: "Natural bloom",
    description: "Bees forage across naturally flowering landscapes.",
  },
  {
    number: "02",
    title: "Healthy hives",
    description: "Our partner beekeepers care for every hive responsibly.",
  },
  {
    number: "03",
    title: "Gentle harvest",
    description: "Honey is collected in small batches to preserve its character.",
  },
];

export default function Story() {
  return (
    <section id="story" className="bg-[#fffaf0] px-6 py-24">
      <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-[#315c3a] p-8 text-white sm:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#f2c86b]">
            From bloom to bottle
          </p>

          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            A simple journey guided by nature
          </h2>

          <ol className="mt-10 space-y-8">
            {journeySteps.map((step) => (
              <li key={step.number} className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#f2c86b] font-bold text-[#315c3a]">
                  {step.number}
                </div>

                <div>
                  <h3 className="text-lg font-bold">{step.title}</h3>

                  <p className="mt-2 leading-7 text-[#d8e5d9]">
                    {step.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d88a16]">
            Our story
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#243b2a] sm:text-5xl">
            Honest honey starts with respect for the hive
          </h2>

          <p className="mt-6 text-lg leading-8 text-[#657168]">
            WildHive began with a simple belief: honey should remain close to
            the way nature created it. We work with responsible beekeepers who
            understand their landscapes and care deeply for their colonies.
          </p>

          <p className="mt-5 text-lg leading-8 text-[#657168]">
            Every batch is carefully collected and packed without unnecessary
            additives, allowing its natural colour, aroma and flavour to remain
            at the centre of the experience.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-6">
            <div className="border-l-4 border-[#d88a16] pl-5">
              <p className="text-3xl font-bold text-[#243b2a]">100%</p>
              <p className="mt-1 text-sm font-medium text-[#657168]">
                Pure honey
              </p>
            </div>

            <div className="border-l-4 border-[#315c3a] pl-5">
              <p className="text-3xl font-bold text-[#243b2a]">0</p>
              <p className="mt-1 text-sm font-medium text-[#657168]">
                Artificial additives
              </p>
            </div>
          </div>

          <a
            href="#benefits"
            className="mt-10 inline-flex rounded-full border border-[#315c3a] px-7 py-3.5 font-semibold text-[#315c3a] transition hover:bg-[#315c3a] hover:text-white"
          >
            Learn why WildHive
          </a>
        </div>
      </div>
    </section>
  );
}