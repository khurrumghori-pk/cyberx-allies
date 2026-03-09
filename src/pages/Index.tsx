import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import architectureImage from "@/assets/cyberx-architecture.png";

const Index = () => {
  return (
    <main className="min-h-screen p-6 md:p-10">
      <section className="cyberx-panel cyberx-signature-glow mx-auto grid max-w-7xl gap-6 overflow-hidden p-6 md:grid-cols-2 md:p-10">
        <div className="space-y-5">
          <p className="cyberx-pill">CyberX™ Agentic Sovereign AI Platform</p>
          <h1 className="cyberx-title">CyberX Advisors — Beyond Assistants. Toward Cybersecurity Counterparts.</h1>
          <p className="text-muted-foreground">
            Enterprise-grade digital twins for SOC leadership, threat operations, and governance with persistent cyber memory and multi-agent decisioning.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="hero">
              <Link to="/advisors/dashboard">Open CyberX Module</Link>
            </Button>
            <Button asChild variant="neon">
              <Link to="/advisors/chat">Open Multi-Agent Chat</Link>
            </Button>
          </div>
        </div>
        <img
          src={architectureImage}
          alt="CyberX Advisors architecture with digital twin layers"
          className="h-full min-h-[320px] w-full rounded-xl border border-border object-cover"
          loading="lazy"
        />
      </section>
    </main>
  );
};

export default Index;
