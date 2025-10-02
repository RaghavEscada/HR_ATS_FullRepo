import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import LandingPage from "@/components/LandingPage";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Applied from "@/pages/Applied";
import Reviewing from "@/pages/Reviewing";
import Interviewed from "@/pages/Interviewed";
import Rejected from "@/pages/Rejected";
import Hired from "@/pages/Hired";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return user ? <>{children}</> : <Navigate to="/auth" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/dashboard" element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>} />
            <Route path="/analytics" element={<ProtectedRoute><Layout><Analytics /></Layout></ProtectedRoute>} />
            <Route path="/applied" element={<ProtectedRoute><Layout><Applied /></Layout></ProtectedRoute>} />
            <Route path="/reviewing" element={<ProtectedRoute><Layout><Reviewing /></Layout></ProtectedRoute>} />
            <Route path="/interviewed" element={<ProtectedRoute><Layout><Interviewed /></Layout></ProtectedRoute>} />
            <Route path="/rejected" element={<ProtectedRoute><Layout><Rejected /></Layout></ProtectedRoute>} />
            <Route path="/hired" element={<ProtectedRoute><Layout><Hired /></Layout></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
