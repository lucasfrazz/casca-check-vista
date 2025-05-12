
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "./context/AuthContext";
import { ChecklistProvider } from "./context/checklist";
import { PrivateRoute } from "./components/PrivateRoute";

// Pages
import LoginPage from "./pages/LoginPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ChecklistPage from "./pages/ChecklistPage";
import ActionPlansPage from "./pages/ActionPlansPage";
import AdminPage from "./pages/AdminPage";
import LessonsPage from "./pages/LessonsPage";
import NotAuthorizedPage from "./pages/NotAuthorizedPage";
import Index from "./pages/Index";

// Create a new client with retry configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
      retryDelay: attempt => Math.min(attempt > 1 ? 2000 : 1000, 30000),
      refetchOnWindowFocus: false,
    }
  }
});

const App = () => {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <ChecklistProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  
                  {/* Protected routes for all authenticated users */}
                  <Route path="/dashboard" element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/checklist/:id" element={
                    <PrivateRoute>
                      <ChecklistPage />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/action-plans" element={
                    <PrivateRoute>
                      <ActionPlansPage />
                    </PrivateRoute>
                  } />
                  
                  {/* Admin-only routes */}
                  <Route path="/admin" element={
                    <PrivateRoute roles={["admin"]}>
                      <AdminPage />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/manage-users" element={
                    <PrivateRoute roles={["admin"]}>
                      <AdminPage />
                    </PrivateRoute>
                  } />
                  
                  <Route path="/lessons" element={
                    <PrivateRoute roles={["admin"]}>
                      <LessonsPage />
                    </PrivateRoute>
                  } />
                  
                  {/* Error pages */}
                  <Route path="/not-authorized" element={<NotAuthorizedPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ChecklistProvider>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
};

export default App;
