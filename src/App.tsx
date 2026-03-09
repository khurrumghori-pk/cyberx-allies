import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthPage } from "./pages/AuthPage";
import { AdvisorsDashboardPage } from "./pages/cyberx/AdvisorsDashboardPage";
import { MultiAgentChatPage } from "./pages/cyberx/MultiAgentChatPage";
import { AdvisorBuilderPage } from "./pages/cyberx/AdvisorBuilderPage";
import { MBTITestPage } from "./pages/cyberx/MBTITestPage";
import { PsychometricTestPage } from "./pages/cyberx/PsychometricTestPage";
import { TeamDigitalTwinPage } from "./pages/cyberx/TeamDigitalTwinPage";
import { CollectiveMemoryPage } from "./pages/cyberx/CollectiveMemoryPage";
import { AdvisorMarketplacePage } from "./pages/cyberx/AdvisorMarketplacePage";
import { AdvisorAnalyticsPage } from "./pages/cyberx/AdvisorAnalyticsPage";
import { IntegrationPanelPage } from "./pages/cyberx/IntegrationPanelPage";
import { GovernancePanelPage } from "./pages/cyberx/GovernancePanelPage";
import { ProactiveNotificationsPage } from "./pages/cyberx/ProactiveNotificationsPage";
import { InstallPage } from "./pages/cyberx/InstallPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/advisors/dashboard" element={
              <ProtectedRoute>
                <AdvisorsDashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/advisors/chat" element={
              <ProtectedRoute>
                <MultiAgentChatPage />
              </ProtectedRoute>
            } />
            <Route path="/advisors/builder" element={
              <ProtectedRoute allowedRoles={["admin", "vciso"]}>
                <AdvisorBuilderPage />
              </ProtectedRoute>
            } />
            <Route path="/advisors/builder/mbti" element={
              <ProtectedRoute allowedRoles={["admin", "vciso"]}>
                <MBTITestPage />
              </ProtectedRoute>
            } />
            <Route path="/advisors/builder/psychometric" element={
              <ProtectedRoute allowedRoles={["admin", "vciso"]}>
                <PsychometricTestPage />
              </ProtectedRoute>
            } />
            <Route path="/advisors/team-twin" element={
              <ProtectedRoute>
                <TeamDigitalTwinPage />
              </ProtectedRoute>
            } />
            <Route path="/advisors/memory" element={
              <ProtectedRoute>
                <CollectiveMemoryPage />
              </ProtectedRoute>
            } />
            <Route path="/advisors/marketplace" element={
              <ProtectedRoute>
                <AdvisorMarketplacePage />
              </ProtectedRoute>
            } />
            <Route path="/advisors/analytics" element={
              <ProtectedRoute allowedRoles={["admin", "vciso"]}>
                <AdvisorAnalyticsPage />
              </ProtectedRoute>
            } />
            <Route path="/advisors/integrations" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <IntegrationPanelPage />
              </ProtectedRoute>
            } />
            <Route path="/advisors/governance" element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <GovernancePanelPage />
              </ProtectedRoute>
            } />
            <Route path="/advisors/notifications" element={
              <ProtectedRoute>
                <ProactiveNotificationsPage />
              </ProtectedRoute>
            } />
            <Route path="/install" element={<InstallPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
