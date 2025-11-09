import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import TrailDetail from "./pages/TrailDetail";
import Lesson from "./pages/Lesson";
import LessonInteractive from "./pages/LessonInteractive";
import Achievements from "./pages/Achievements";
import AchievementsPage from "./pages/AchievementsPage";
import AdminUpdateTimestamps from "./pages/AdminUpdateTimestamps";
import Admin from "./pages/Admin";
import AdminAudioGenerator from "./pages/AdminAudioGenerator";
import AdminAudioBatch from "./pages/AdminAudioBatch";
import AdminSyncTester from "./pages/AdminSyncTester";
import AdminSyncLessons from "./pages/AdminSyncLessons";
import AdminDebugTimestamps from "./pages/AdminDebugTimestamps";
import AdminLessonTester from "./pages/AdminLessonTester";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/gamification" element={<AchievementsPage />} />
          <Route path="/trails/:id" element={<TrailDetail />} />
          <Route path="/lessons/:id" element={<Lesson />} />
          <Route path="/lessons-interactive/:id" element={<LessonInteractive />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/audio-generator" element={<AdminAudioGenerator />} />
          <Route path="/admin/audio-batch" element={<AdminAudioBatch />} />
          <Route path="/admin/sync-tester" element={<AdminSyncTester />} />
          <Route path="/admin/sync-lessons" element={<AdminSyncLessons />} />
          <Route path="/admin/update-timestamps" element={<AdminUpdateTimestamps />} />
          <Route path="/admin/debug-timestamps" element={<AdminDebugTimestamps />} />
          <Route path="/admin/lesson-tester" element={<AdminLessonTester />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
