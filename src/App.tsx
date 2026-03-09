import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AdvisorsDashboardPage } from "./pages/cyberx/AdvisorsDashboardPage";
import { MultiAgentChatPage } from "./pages/cyberx/MultiAgentChatPage";
import { AdvisorBuilderPage } from "./pages/cyberx/AdvisorBuilderPage";
import { TeamDigitalTwinPage } from "./pages/cyberx/TeamDigitalTwinPage";
import { CollectiveMemoryPage } from "./pages/cyberx/CollectiveMemoryPage";
import { AdvisorMarketplacePage } from "./pages/cyberx/AdvisorMarketplacePage";
import { AdvisorAnalyticsPage } from "./pages/cyberx/AdvisorAnalyticsPage";
import { IntegrationPanelPage } from "./pages/cyberx/IntegrationPanelPage";
import { GovernancePanelPage } from "./pages/cyberx/GovernancePanelPage";
import { ProactiveNotificationsPage } from "./pages/cyberx/ProactiveNotificationsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/advisors/dashboard" element={<AdvisorsDashboardPage />} />
          <Route path="/advisors/chat" element={<MultiAgentChatPage />} />
          <Route path="/advisors/builder" element={<AdvisorBuilderPage />} />
          <Route path="/advisors/team-twin" element={<TeamDigitalTwinPage />} />
          <Route path="/advisors/memory" element={<CollectiveMemoryPage />} />
          <Route path="/advisors/marketplace" element={<AdvisorMarketplacePage />} />
          <Route path="/advisors/analytics" element={<AdvisorAnalyticsPage />} />
          <Route path="/advisors/integrations" element={<IntegrationPanelPage />} />
          <Route path="/advisors/governance" element={<GovernancePanelPage />} />
          <Route path="/advisors/notifications" element={<ProactiveNotificationsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
