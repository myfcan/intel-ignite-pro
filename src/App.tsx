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
import Leaderboard from "./pages/Leaderboard";
import AdminUpdateTimestamps from "./pages/AdminUpdateTimestamps";
import Admin from "./pages/Admin";
import AdminAudioGenerator from "./pages/AdminAudioGenerator";
import AdminAudioBatch from "./pages/AdminAudioBatch";
import AdminSyncTester from "./pages/AdminSyncTester";
import AdminSyncLessons from "./pages/AdminSyncLessons";
import AdminDebugTimestamps from "./pages/AdminDebugTimestamps";
import AdminLessonTester from "./pages/AdminLessonTester";
import AdminBatchLessons from "./pages/AdminBatchLessons";
import AdminIntonationTest from "./pages/AdminIntonationTest";
import AdminValidationSystem from "./pages/AdminValidationSystem";
import AdminPipelineTest from "./pages/AdminPipelineTest";
import AdminPipelineHub from "./pages/AdminPipelineHub";
import AdminManualHub from "./pages/AdminManualHub";
import AdminPipelineCreateSingle from "./pages/AdminPipelineCreateSingle";
import AdminPipelineCreateBatch from "./pages/AdminPipelineCreateBatch";
import AdminPipelineMonitor from "./pages/AdminPipelineMonitor";
import AdminManageLessons from "./pages/AdminManageLessons";
import AdminLessonDebug from "./pages/AdminLessonDebug";
import AdminFixLessonExercises from "./pages/AdminFixLessonExercises";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";

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
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/trails/:id" element={<TrailDetail />} />
          <Route path="/lessons/:id" element={<Lesson />} />
          <Route path="/lessons-interactive/:id" element={<LessonInteractive />} />
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
          <Route path="/admin/pipeline" element={<ProtectedRoute><AdminPipelineHub /></ProtectedRoute>} />
          <Route path="/admin/pipeline/create-single" element={<ProtectedRoute><AdminPipelineCreateSingle /></ProtectedRoute>} />
          <Route path="/admin/pipeline/create-batch" element={<ProtectedRoute><AdminPipelineCreateBatch /></ProtectedRoute>} />
          <Route path="/admin/pipeline/manage-lessons" element={<ProtectedRoute><AdminManageLessons /></ProtectedRoute>} />
          <Route path="/admin/pipeline/lesson-debug/:id" element={<ProtectedRoute><AdminLessonDebug /></ProtectedRoute>} />
          <Route path="/admin/pipeline/fix-exercises" element={<ProtectedRoute><AdminFixLessonExercises /></ProtectedRoute>} />
          <Route path="/admin/pipeline/monitor/:executionId?" element={<ProtectedRoute><AdminPipelineMonitor /></ProtectedRoute>} />
          <Route path="/admin/manual" element={<ProtectedRoute><AdminManualHub /></ProtectedRoute>} />
          <Route path="/admin/audio-generator" element={<ProtectedRoute><AdminAudioGenerator /></ProtectedRoute>} />
          <Route path="/admin/audio-batch" element={<ProtectedRoute><AdminAudioBatch /></ProtectedRoute>} />
          <Route path="/admin/sync-tester" element={<ProtectedRoute><AdminSyncTester /></ProtectedRoute>} />
          <Route path="/admin/sync-lessons" element={<ProtectedRoute><AdminSyncLessons /></ProtectedRoute>} />
          <Route path="/admin/update-timestamps" element={<ProtectedRoute><AdminUpdateTimestamps /></ProtectedRoute>} />
          <Route path="/admin/debug-timestamps" element={<ProtectedRoute><AdminDebugTimestamps /></ProtectedRoute>} />
          <Route path="/admin/lesson-tester" element={<ProtectedRoute><AdminLessonTester /></ProtectedRoute>} />
          <Route path="/admin/batch-lessons" element={<ProtectedRoute><AdminBatchLessons /></ProtectedRoute>} />
          <Route path="/admin/intonation-test" element={<ProtectedRoute><AdminIntonationTest /></ProtectedRoute>} />
          <Route path="/admin/validation-system" element={<ProtectedRoute><AdminValidationSystem /></ProtectedRoute>} />
          <Route path="/admin/pipeline-test" element={<ProtectedRoute><AdminPipelineTest /></ProtectedRoute>} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
