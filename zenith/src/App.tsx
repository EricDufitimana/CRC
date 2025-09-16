import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import ContentManagement from "./pages/ContentManagement";
import StudentManagement from "./pages/StudentManagement";
import EssayRequests from "./pages/EssayRequests";
import OpportunityTracker from "./pages/OpportunityTracker";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/content-management" element={<ContentManagement />} />
          <Route path="/student-management" element={<StudentManagement />} />
          <Route path="/essay-requests" element={<EssayRequests />} />
          <Route path="/opportunity-tracker" element={<OpportunityTracker />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
