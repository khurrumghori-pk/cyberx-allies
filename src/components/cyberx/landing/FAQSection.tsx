import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const FAQS = [
  {
    q: "Is this replacing the CISO?",
    a: "No. The model is designed to augment human leadership, extend strategic capacity, and improve decision velocity without removing accountability.",
  },
  {
    q: "Is it only for large enterprises?",
    a: "Not at all. It is especially valuable where cyber leadership is stretched, distributed, or difficult to scale across multiple entities.",
  },
  {
    q: "Where does AI fit in practice?",
    a: "In signal interpretation, prioritization, recommendation drafting, compliance mapping, and reporting acceleration — with human oversight built in.",
  },
];

const FAQSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="space-y-3 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Common questions</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight max-w-[16ch]">
            What leaders usually ask first.
          </h2>
        </div>
      </ScrollFadeIn>
      <div className="grid gap-5 md:grid-cols-3">
        {FAQS.map((f, i) => (
          <ScrollFadeIn key={f.q} delay={i * 100}>
            <div className="cyberx-panel p-6 space-y-3 h-full">
              <h3 className="font-display text-lg text-foreground">{f.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.a}</p>
            </div>
          </ScrollFadeIn>
        ))}
      </div>
    </div>
  </section>
);

export default FAQSection;
