import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const FAQS = [
  { q: "Does this replace the CISO?", a: "No. It augments leadership — extending capacity and decision speed without removing accountability." },
  { q: "Enterprise only?", a: "Especially valuable where cyber leadership is stretched or distributed across entities." },
  { q: "Where does AI fit?", a: "Signal interpretation, prioritization, compliance mapping, and reporting — with human oversight built in." },
];

const FAQSection = () => (
  <section className="py-20">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="space-y-2 mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">FAQ</p>
          <h2 className="font-display text-2xl md:text-4xl text-foreground leading-tight">
            What CISOs ask first.
          </h2>
        </div>
      </ScrollFadeIn>
      <div className="grid gap-5 md:grid-cols-3">
        {FAQS.map((f, i) => (
          <ScrollFadeIn key={f.q} delay={i * 100}>
            <div className="cyberx-panel p-6 space-y-2 h-full">
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
