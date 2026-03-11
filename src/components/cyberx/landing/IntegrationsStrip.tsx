import ScrollFadeIn from "@/components/cyberx/ScrollFadeIn";

const TOOLS = [
  "Splunk", "Palo Alto", "CrowdStrike", "SentinelOne",
  "Jira", "Slack", "ServiceNow", "AWS",
  "Microsoft Sentinel", "XSOAR", "VirusTotal", "Qualys",
];

const IntegrationsStrip = () => (
  <section className="py-16 border-y border-border/40">
    <div className="mx-auto max-w-7xl px-6">
      <ScrollFadeIn>
        <div className="text-center mb-8 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">Ecosystem</p>
          <h2 className="font-display text-2xl md:text-3xl text-foreground">Works With 200+ Tools You Already Use</h2>
        </div>
      </ScrollFadeIn>
      <ScrollFadeIn delay={100}>
        <div className="flex flex-wrap justify-center gap-3">
          {TOOLS.map((t) => (
            <span
              key={t}
              className="rounded-full bg-secondary/70 border border-border/60 px-5 py-2 text-sm font-medium text-muted-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-foreground transition-all cursor-default"
            >
              {t}
            </span>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">And many more…</p>
      </ScrollFadeIn>
    </div>
  </section>
);

export default IntegrationsStrip;
