import { Suspense, lazy, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AvatarStateProvider } from "@/contexts/AvatarStateContext";
import { URLFixer } from "@/components/URLFixer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { DashboardSkeleton, TrailDetailSkeleton } from "@/components/skeletons";

// Critical pages - loaded immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Lazy loaded pages - loaded on demand
const Onboarding = lazy(() => import("./pages/Onboarding"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const TrailDetail = lazy(() => import("./pages/TrailDetail"));
const Lesson = lazy(() => import("./pages/Lesson"));
const LessonInteractive = lazy(() => import("./pages/LessonInteractive"));
const Achievements = lazy(() => import("./pages/Achievements"));
const AchievementsPage = lazy(() => import("./pages/AchievementsPage"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const Profile = lazy(() => import("./pages/Profile"));

// Feature pages - lazy loaded
const Guides = lazy(() => import("./pages/Guides"));
const GuideDetail = lazy(() => import("./pages/GuideDetail"));
const AIDirectory = lazy(() => import("./pages/AIDirectory"));
const PromptLibrary = lazy(() => import("./pages/PromptLibrary"));
const PromptCategory = lazy(() => import("./pages/PromptCategory"));
const AIPlayground = lazy(() => import("./pages/AIPlayground"));
const CursoExclusivo = lazy(() => import("./pages/CursoExclusivo"));

// Admin pages - lazy loaded (heavy components)
const Admin = lazy(() => import("./pages/Admin"));
const AdminUpdateTimestamps = lazy(() => import("./pages/AdminUpdateTimestamps"));
const AdminAudioGenerator = lazy(() => import("./pages/AdminAudioGenerator"));
const AdminAudioBatch = lazy(() => import("./pages/AdminAudioBatch"));
const AdminSyncTester = lazy(() => import("./pages/AdminSyncTester"));
const AdminSyncLessons = lazy(() => import("./pages/AdminSyncLessons"));
const AdminDebugTimestamps = lazy(() => import("./pages/AdminDebugTimestamps"));
const AdminLessonTester = lazy(() => import("./pages/AdminLessonTester"));
const AdminBatchLessons = lazy(() => import("./pages/AdminBatchLessons"));
const AdminIntonationTest = lazy(() => import("./pages/AdminIntonationTest"));
const AdminValidationSystem = lazy(() => import("./pages/AdminValidationSystem"));
const AdminPipelineTest = lazy(() => import("./pages/AdminPipelineTest"));
const AdminPipelineHub = lazy(() => import("./pages/AdminPipelineHub"));
const AdminManualHub = lazy(() => import("./pages/AdminManualHub"));
const AdminCreateLessonV3 = lazy(() => import("./pages/AdminCreateLessonV3"));
const AdminTestImageGeneration = lazy(() => import("./pages/AdminTestImageGeneration"));
const AdminPipelineCreateSingle = lazy(() => import("./pages/AdminPipelineCreateSingle"));
const AdminPipelineCreateBatch = lazy(() => import("./pages/AdminPipelineCreateBatch"));
const AdminPipelineMonitor = lazy(() => import("./pages/AdminPipelineMonitor"));
const AdminManageLessons = lazy(() => import("./pages/AdminManageLessons"));
const AdminLessonDebug = lazy(() => import("./pages/AdminLessonDebug"));
const AdminFixLessonExercises = lazy(() => import("./pages/AdminFixLessonExercises"));
const AdminPlaygroundSessions = lazy(() => import("./pages/AdminPlaygroundSessions"));
const AdminV5CardConfig = lazy(() => import("./pages/AdminV5CardConfig"));
const AdminTestCardSync = lazy(() => import("./pages/AdminTestCardSync"));
const TestCard = lazy(() => import("./pages/TestCard"));
const AdminV7Create = lazy(() => import("./pages/AdminV7Create"));
const AdminV7Preview = lazy(() => import("./pages/AdminV7Preview"));
const V7CinematicDemo = lazy(() => import("./pages/V7CinematicDemo"));
const V7CinematicPlayer = lazy(() => import("./pages/V7CinematicPlayer"));

const queryClient = new QueryClient();

// Loading fallback component with elegant animations
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
    {/* Subtle gradient background animation */}
    <div className="absolute inset-0 opacity-30">
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0.5s' }} />
    </div>
    
    <div className="flex flex-col items-center gap-6 animate-fade-in relative z-10">
      {/* Elegant spinner with multiple rings */}
      <div className="relative w-16 h-16">
        {/* Outer ring */}
        <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
        {/* Spinning ring */}
        <div className="absolute inset-0 border-4 border-transparent border-t-primary rounded-full animate-spin" />
        {/* Inner pulse dot */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
      
      {/* Loading text with shimmer effect */}
      <div className="flex flex-col items-center gap-2">
        <p className="text-foreground font-medium text-sm">Carregando</p>
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      </div>
    </div>
  </div>
);

// Wrapper for Suspense with custom fallback
const SuspenseWithFallback = ({ children, fallback }: { children: ReactNode; fallback: ReactNode }) => (
  <Suspense fallback={fallback}>{children}</Suspense>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AvatarStateProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <URLFixer />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/dashboard" element={
                <SuspenseWithFallback fallback={<DashboardSkeleton />}>
                  <Dashboard />
                </SuspenseWithFallback>
              } />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/gamification" element={<AchievementsPage />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/trail/:id" element={
                <SuspenseWithFallback fallback={<TrailDetailSkeleton />}>
                  <TrailDetail />
                </SuspenseWithFallback>
              } />
              <Route path="/trails/:id" element={
                <SuspenseWithFallback fallback={<TrailDetailSkeleton />}>
                  <TrailDetail />
                </SuspenseWithFallback>
              } />
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
              <Route path="/admin/create-lesson-v3" element={<ProtectedRoute><AdminCreateLessonV3 /></ProtectedRoute>} />
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
              <Route path="/admin/test-images" element={<ProtectedRoute><AdminTestImageGeneration /></ProtectedRoute>} />
              <Route path="/admin/playground-sessions" element={<ProtectedRoute><AdminPlaygroundSessions /></ProtectedRoute>} />
              <Route path="/admin/v5-card-config" element={<ProtectedRoute><AdminV5CardConfig /></ProtectedRoute>} />
              <Route path="/admin/test-card" element={<ProtectedRoute><TestCard /></ProtectedRoute>} />
              <Route path="/admin/test-card-sync" element={<ProtectedRoute><AdminTestCardSync /></ProtectedRoute>} />
              {/* V7 CINEMATIC ROUTES */}
              <Route path="/admin/v7/create" element={<ProtectedRoute><AdminV7Create /></ProtectedRoute>} />
              <Route path="/admin/v7/preview/:lessonId?" element={<ProtectedRoute><AdminV7Preview /></ProtectedRoute>} />
              <Route path="/admin/v7/demo" element={<ProtectedRoute><V7CinematicDemo /></ProtectedRoute>} />
              <Route path="/admin/v7/play/:lessonId" element={<ProtectedRoute><V7CinematicPlayer /></ProtectedRoute>} />
              {/* NEW FEATURES ROUTES */}
              <Route path="/guides" element={<Guides />} />
              <Route path="/guides/:guideId" element={<GuideDetail />} />
              <Route path="/ai-directory" element={<AIDirectory />} />
              <Route path="/prompt-library" element={<PromptLibrary />} />
              <Route path="/prompt-library/:categoryId" element={<PromptCategory />} />
              <Route path="/ai-playground" element={<AIPlayground />} />
              <Route path="/curso-exclusivo" element={<CursoExclusivo />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </AvatarStateProvider>
  </QueryClientProvider>
);

export default App;
