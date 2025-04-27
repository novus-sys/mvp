
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Resources from "./pages/Resources";
import QAForum from "./pages/QAForum";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Mentorship from "./pages/Mentorship";
import Opportunities from "./pages/Opportunities";
import Achievements from "./pages/Achievements";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/resources" element={<Resources />} />
          <Route path="/qa-forum" element={<QAForum />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/mentorship" element={<Mentorship />} />
          <Route path="/opportunities" element={<Opportunities />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
