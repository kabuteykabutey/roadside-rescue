import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Mechanics from "./pages/Mechanics";
import MechanicProfile from "./pages/MechanicProfile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import RegisterMechanic from "./pages/RegisterMechanic";
import UserAccount from "./pages/UserAccount";
import HowItWorksPage from "./pages/HowItWorksPage";
import NotFound from "./pages/NotFound";

import UserRequestListener from "./components/UserRequestListener";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        basename="/roadside-rescue"
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <UserRequestListener />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/mechanics" element={<Mechanics />} />
          <Route path="/mechanic/:id" element={<MechanicProfile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register-mechanic" element={<RegisterMechanic />} />
          <Route path="/account" element={<UserAccount />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
