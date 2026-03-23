import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, Calendar, ArrowRight } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import heroBgVideo from "@/assets/hero-bg-video.mp4.asset.json";

const HERO_STATS = [
  { value: "24/7", desc: "Always‑on risk visibility" },
  { value: "360°", desc: "Threats, compliance & posture" },
  { value: "AI + Human", desc: "Augmented, not autopilot" },
  { value: "Scale", desc: "Across BUs & portfolios" },
];

const SIGNALS = [
  { label: "Threat posture", value: "Supply chain elevated" },
  { label: "Compliance", value: "NIS2 / ISO alignment" },
  { label: "Board insight", value: "Risk → business impact" },
  { label: "Advisor mode", value: "Recommend & escalate" },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.3 } },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] } },
};

const signalVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.7 } },
};

const signalItem: Variants = {
  hidden: { opacity: 0, x: 12 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
};

const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  x: (i * 37 + 13) % 100,
  y: (i * 53 + 7) % 100,
  size: 1.5 + (i % 3),
  duration: 4 + (i % 5) * 1.5,
  delay: (i % 7) * 0.6,
}));

const HeroSection = () => (
  <section className="relative pt-28 pb-12 overflow-hidden">
    {/* Background video */}
    <div className="absolute inset-0 z-0">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        src={heroBgVideo.url}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background" />
    </div>

    {/* Particle grid overlay */}
    <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
      <div className="absolute inset-0 cyberx-grid-bg opacity-20" />
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-primary/40"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -20, 0],
            opacity: [0.2, 0.7, 0.2],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: p.delay,
          }}
        />
      ))}
    </div>

    {/* Animated background orbs */}
    <div className="absolute inset-0 z-[1] bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
    <motion.div
      className="absolute top-20 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] z-[1]"
      animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-40 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px] z-[1]"
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
    />
    <motion.div
      className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-primary/3 blur-[140px] z-[1]"
      animate={{ opacity: [0.15, 0.3, 0.15] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
    />

    <div className="relative z-10 mx-auto max-w-7xl px-6">
      <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
        {/* Left */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <motion.div
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary backdrop-blur-sm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Zap className="h-3.5 w-3.5" />
            Cybersecurity Leadership‑as‑a‑Platform
          </motion.div>

          <motion.h1
            className="font-display text-4xl md:text-5xl lg:text-6xl leading-[0.96] tracking-tight text-foreground"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Your AI co‑pilot for{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              cyber strategy.
            </span>
          </motion.h1>

          <motion.p
            className="text-lg text-muted-foreground max-w-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.35 }}
          >
            AI advisors that work alongside CISOs — delivering continuous risk intelligence, compliance guidance, and board‑ready insight at platform scale.
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
          >
            <Button asChild variant="hero" size="lg" className="text-base px-7">
              <Link to="/auth">
                <Calendar className="mr-2 h-4 w-4" /> Book a Briefing
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base px-7"
              onClick={() => document.getElementById("platform")?.scrollIntoView({ behavior: "smooth" })}
            >
              See How It Works <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </motion.div>
        </motion.div>

        {/* Right - Card */}
        <motion.aside
          className="relative rounded-2xl border border-border/40 bg-gradient-to-b from-card/95 to-background/98 shadow-2xl overflow-hidden p-6 lg:p-7"
          initial={{ opacity: 0, y: 24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <div className="absolute -top-10 -right-8 w-44 h-44 rounded-full bg-primary/15 blur-[50px]" />
          <div className="absolute -bottom-14 -left-8 w-40 h-40 rounded-full bg-accent/15 blur-[50px]" />

          <div className="relative z-10 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-display text-lg tracking-tight text-foreground">Cyber Advisory Tower</p>
              <motion.span
                className="inline-flex items-center gap-2 rounded-full bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs text-accent"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_hsl(var(--accent)/0.4)]" />
                Live
              </motion.span>
            </div>

            <motion.div
              className="grid grid-cols-2 gap-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {HERO_STATS.map((s) => (
                <motion.div
                  key={s.value}
                  className="rounded-xl border border-border/30 bg-secondary/40 backdrop-blur-sm p-3"
                  variants={itemVariants}
                  whileHover={{ scale: 1.03, borderColor: "hsl(var(--primary) / 0.4)" }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="font-display text-lg text-foreground">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground leading-snug">{s.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-sm p-4 space-y-1"
              variants={signalVariants}
              initial="hidden"
              animate="visible"
            >
              {SIGNALS.map((s, i) => (
                <motion.div
                  key={s.label}
                  className={`flex justify-between gap-4 py-2 text-xs ${i < SIGNALS.length - 1 ? "border-b border-dashed border-border/30" : ""}`}
                  variants={signalItem}
                >
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-semibold text-foreground text-right">{s.value}</span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.aside>
      </div>
    </div>
  </section>
);

export default HeroSection;
