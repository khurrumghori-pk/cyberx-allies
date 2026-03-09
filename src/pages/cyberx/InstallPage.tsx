import { useState, useEffect } from "react";
import { CyberXLayout } from "@/components/cyberx/CyberXLayout";
import { Button } from "@/components/ui/button";
import { Download, Smartphone, Monitor, Share2, CheckCircle, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Detect iOS
    const ua = navigator.userAgent;
    setIsIOS(/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream);

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => setIsInstalled(true));

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <CyberXLayout title="Install CyberX" breadcrumb={["CyberX", "Install"]}>
      <div className="max-w-lg mx-auto space-y-8 py-8">
        {/* Hero */}
        <div className="text-center space-y-4">
          <div className="h-24 w-24 mx-auto rounded-2xl overflow-hidden border-2 border-primary/40 shadow-lg shadow-primary/20">
            <img src="/pwa-icon-512.png" alt="CyberX" className="h-full w-full object-cover" />
          </div>
          <div>
            <h1 className="font-display text-2xl text-foreground">CyberX Advisors</h1>
            <p className="text-sm text-muted-foreground mt-1">AI-Powered Security Operations Platform</p>
          </div>
        </div>

        {isInstalled ? (
          <div className="cyberx-panel p-6 text-center space-y-3 border-accent/40">
            <CheckCircle className="h-12 w-12 text-accent mx-auto" />
            <h2 className="font-display text-lg text-foreground">App Installed!</h2>
            <p className="text-sm text-muted-foreground">CyberX is installed on your device. You can now launch it from your home screen.</p>
          </div>
        ) : (
          <>
            {/* Install CTA */}
            {deferredPrompt ? (
              <div className="cyberx-panel p-6 text-center space-y-4 border-primary/40">
                <Download className="h-10 w-10 text-primary mx-auto" />
                <h2 className="font-display text-lg text-foreground">Install as Standalone App</h2>
                <p className="text-sm text-muted-foreground">Add CyberX to your device for a native app experience — no app store needed.</p>
                <Button variant="hero" size="lg" onClick={handleInstall} className="w-full">
                  <Download className="h-4 w-4 mr-2" /> Install CyberX
                </Button>
              </div>
            ) : isIOS ? (
              <div className="cyberx-panel p-6 space-y-4">
                <h2 className="font-display text-lg text-foreground text-center">Install on iPhone / iPad</h2>
                <div className="space-y-3">
                  {[
                    { step: 1, icon: Share2, text: 'Tap the Share button in Safari' },
                    { step: 2, icon: ArrowDown, text: 'Scroll down and tap "Add to Home Screen"' },
                    { step: 3, icon: CheckCircle, text: 'Tap "Add" to install CyberX' },
                  ].map(({ step, icon: Icon, text }) => (
                    <div key={step} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border/40">
                      <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold text-primary">{step}</div>
                      <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground">{text}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="cyberx-panel p-6 text-center space-y-4">
                <Smartphone className="h-10 w-10 text-primary mx-auto" />
                <h2 className="font-display text-lg text-foreground">Install CyberX</h2>
                <p className="text-sm text-muted-foreground">
                  Open this page in Chrome or Edge, then use the browser menu → "Install app" or "Add to Home Screen".
                </p>
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: Smartphone, label: "Works Offline", desc: "Access your security dashboard anywhere" },
                { icon: Monitor, label: "Full Screen", desc: "No browser chrome — pure app experience" },
                { icon: Download, label: "Instant Launch", desc: "One tap from your home screen" },
                { icon: CheckCircle, label: "Auto Updates", desc: "Always the latest version" },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="cyberx-panel p-4 space-y-1">
                  <Icon className="h-5 w-5 text-primary" />
                  <p className="text-xs font-semibold text-foreground">{label}</p>
                  <p className="text-[10px] text-muted-foreground">{desc}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </CyberXLayout>
  );
}
