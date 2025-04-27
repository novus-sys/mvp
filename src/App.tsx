
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "./contexts/SupabaseAuthContext";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Profile from "./pages/Profile";
import Resources from "./pages/Resources";
import QAForum from "./pages/QAForum";
import QuestionDetail from "./pages/QuestionDetail";
import SupabaseTest from "./pages/SupabaseTest";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Projects from "./pages/Projects";
import Mentorship from "./pages/Mentorship";
import Opportunities from "./pages/Opportunities";
import Achievements from "./pages/Achievements";
import MentorTest from "./pages/MentorTest";
import StorageTest from "./pages/StorageTest";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SupabaseAuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/qa" element={<QAForum />} />
              <Route path="/qa/question/:id" element={<QuestionDetail />} />
              <Route path="/test" element={<SupabaseTest />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/mentorship" element={<Mentorship />} />
              <Route path="/opportunities" element={<Opportunities />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/mentor-test" element={<MentorTest />} />
              <Route path="/storage-test" element={<StorageTest />} />
            </Route>
            
            {/* Redirect old routes to new auth page */}
            <Route path="/login" element={<Auth />} />
            <Route path="/register" element={<Auth />} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </SupabaseAuthProvider>
  </QueryClientProvider>
);

export default App;
