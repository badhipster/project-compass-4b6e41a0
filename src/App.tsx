import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing.tsx";
import PracticeHub from "./pages/PracticeHub.tsx";
import Calibrate from "./pages/Calibrate.tsx";
import Drill from "./pages/Drill.tsx";
import Mock from "./pages/Mock.tsx";
import Profile from "./pages/Profile.tsx";
import Method from "./pages/Method.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/practice" element={<PracticeHub />} />
          <Route path="/practice/calibrate" element={<Calibrate />} />
          <Route path="/practice/drill" element={<Drill />} />
          <Route path="/practice/mock" element={<Mock />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/method" element={<Method />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
