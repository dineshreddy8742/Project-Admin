import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Routes, Route } from "react-router-dom";
import { PlanProvider } from "@/contexts/PlanContext";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import LandingPage from "@/pages/LandingPage";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import { LanguageProvider } from "@/contexts/language-utils";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/contexts/ArtomartAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import MainApp from './MainApp';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <PlanProvider>
          <AuthProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <VoiceAssistant />
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/*" element={<MainApp />} />
                </Routes>
              </TooltipProvider>
            </CartProvider>
          </AuthProvider>
        </PlanProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default App;
