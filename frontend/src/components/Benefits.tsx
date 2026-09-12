type BenefitCardProps = {
  number: string;
  title: string;
  description: string;
};

const benefits = [
  {
    number: "01",
    title: "Naturally collected",
    description:
      "Our honey begins with bees foraging across naturally flowering landscapes.",
  },
  {
    number: "02",
    title: "Responsibly sourced",
    description:
      "We partner with beekeepers who care for their colonies and surrounding environment.",
  },
  {
    number: "03",
    title: "Carefully packed",
    description:
      "Every batch is handled carefully to preserve its natural aroma, colour and flavour.",
  },
  {
    number: "04",
    title: "Nothing unnecessary",
    description:
      "No artificial flavours, colours or unnecessary additives are added to our honey.",
  },
];

function BenefitCard({
  number,
  title,
  description,
}: BenefitCardProps) {
  return (
    <article className="rounded-3xl border border-[#e9e1d2] bg-white p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fff0c8] font-bold text-[#b66e0d]">
        {number}
      </div>

      <h3 className="mt-6 text-xl font-bold text-[#243b2a]">{title}</h3>

      <p className="mt-3 leading-7 text-[#657168]">{description}</p>
    </article>
  );
}

export default function Benefits() {
  return (
    <section id="benefits" className="bg-[#f6f2e8] px-6 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#d88a16]">
            Why WildHive
          </p>

          <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#243b2a] sm:text-5xl">
            Good honey needs very little interference
          </h2>

          <p className="mt-5 text-lg leading-8 text-[#657168]">
            From responsible hive care to careful packing, every step is
            designed to let the honey retain its natural identity.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <BenefitCard
              key={benefit.number}
              number={benefit.number}
              title={benefit.title}
              description={benefit.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
}