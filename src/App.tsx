// App - Main application entry point (v1.0.1)
import { Suspense, lazy, ReactNode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AvatarStateProvider } from "@/contexts/AvatarStateContext";
import { Background3DProvider } from "@/contexts/Background3DContext";
import { URLFixer } from "@/components/URLFixer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminRoute } from "./components/AdminRoute";
import { AdminOnlyRoute } from "./components/AdminOnlyRoute";
import { DashboardSkeleton, TrailDetailSkeleton } from "@/components/skeletons";

// Critical pages - loaded immediately
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

// Retry wrapper for lazy imports — handles stale chunk errors after deploys
function lazyRetry(factory: () => Promise<any>) {
  return lazy(() =>
    factory().catch((err) => {
      const key = 'ailiv_chunk_retry';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
        return new Promise(() => {}); // never resolves, page will reload
      }
      sessionStorage.removeItem(key);
      throw err;
    })
  );
}

// Lazy loaded pages - loaded on demand
const Onboarding = lazyRetry(() => import("./pages/Onboarding"));
const Dashboard = lazyRetry(() => import("./pages/Dashboard"));
const TrailDetail = lazyRetry(() => import("./pages/TrailDetail"));
const CourseDetail = lazyRetry(() => import("./pages/CourseDetail"));
const Lesson = lazyRetry(() => import("./pages/Lesson"));
const LessonInteractive = lazyRetry(() => import("./pages/LessonInteractive"));
const Achievements = lazyRetry(() => import("./pages/Achievements"));
const AchievementsPage = lazyRetry(() => import("./pages/AchievementsPage"));
const Leaderboard = lazyRetry(() => import("./pages/Leaderboard"));
const Profile = lazyRetry(() => import("./pages/Profile"));

// Feature pages - lazy loaded
const Guides = lazyRetry(() => import("./pages/Guides"));
const GuideDetail = lazyRetry(() => import("./pages/GuideDetail"));
const AIDirectory = lazyRetry(() => import("./pages/AIDirectory"));
const PromptLibrary = lazyRetry(() => import("./pages/PromptLibrary"));
const PromptCategory = lazyRetry(() => import("./pages/PromptCategory"));
const AIPlayground = lazyRetry(() => import("./pages/AIPlayground"));
const CursoExclusivo = lazyRetry(() => import("./pages/CursoExclusivo"));
const AllTrails = lazyRetry(() => import("./pages/AllTrails"));

// Admin pages - lazy loaded (heavy components)
const Admin = lazyRetry(() => import("./pages/Admin"));
const AdminUpdateTimestamps = lazyRetry(() => import("./pages/AdminUpdateTimestamps"));
const AdminAudioGenerator = lazyRetry(() => import("./pages/AdminAudioGenerator"));
const AdminAudioBatch = lazyRetry(() => import("./pages/AdminAudioBatch"));
const AdminSyncTester = lazyRetry(() => import("./pages/AdminSyncTester"));
const AdminSyncLessons = lazyRetry(() => import("./pages/AdminSyncLessons"));
const AdminDebugTimestamps = lazyRetry(() => import("./pages/AdminDebugTimestamps"));
const AdminLessonTester = lazyRetry(() => import("./pages/AdminLessonTester"));
const AdminBatchLessons = lazyRetry(() => import("./pages/AdminBatchLessons"));
const AdminIntonationTest = lazyRetry(() => import("./pages/AdminIntonationTest"));
const AdminValidationSystem = lazyRetry(() => import("./pages/AdminValidationSystem"));
const AdminPipelineTest = lazyRetry(() => import("./pages/AdminPipelineTest"));
const AdminPipelineHub = lazyRetry(() => import("./pages/AdminPipelineHub"));
const AdminManualHub = lazyRetry(() => import("./pages/AdminManualHub"));
const AdminCreateLessonV3 = lazyRetry(() => import("./pages/AdminCreateLessonV3"));
const AdminTestImageGeneration = lazyRetry(() => import("./pages/AdminTestImageGeneration"));
const AdminPipelineCreateSingle = lazyRetry(() => import("./pages/AdminPipelineCreateSingle"));
const AdminPipelineCreateBatch = lazyRetry(() => import("./pages/AdminPipelineCreateBatch"));
const AdminMicroVisualSandbox = lazyRetry(() => import("./pages/AdminMicroVisualSandbox"));
const AdminPipelineMonitor = lazyRetry(() => import("./pages/AdminPipelineMonitor"));
const AdminManageLessons = lazyRetry(() => import("./pages/AdminManageLessons"));
const AdminLessonDebug = lazyRetry(() => import("./pages/AdminLessonDebug"));
const AdminFixLessonExercises = lazyRetry(() => import("./pages/AdminFixLessonExercises"));
const AdminPlaygroundSessions = lazyRetry(() => import("./pages/AdminPlaygroundSessions"));
const AdminV5CardConfig = lazyRetry(() => import("./pages/AdminV5CardConfig"));
const AdminTestCardSync = lazyRetry(() => import("./pages/AdminTestCardSync"));
const TestCard = lazyRetry(() => import("./pages/TestCard"));
const AdminV7Create = lazyRetry(() => import("./pages/AdminV7Create"));
const AdminV7Preview = lazyRetry(() => import("./pages/AdminV7Preview"));
const AdminV7vv = lazyRetry(() => import("./pages/AdminV7vv"));
const AdminV7Pipeline = lazyRetry(() => import("./pages/AdminV7Pipeline"));
const AdminV7Diagnostic = lazyRetry(() => import("./pages/AdminV7Diagnostic"));
const V7CinematicDemo = lazyRetry(() => import("./pages/V7CinematicDemo"));
const V7CinematicPlayer = lazyRetry(() => import("./pages/V7CinematicPlayer"));
const V7LessonTest = lazyRetry(() => import("./pages/V7LessonTest"));

// V8 Read & Listen Premium
const V8TrailDetail = lazyRetry(() => import("./pages/V8TrailDetail"));
const V8Lesson = lazyRetry(() => import("./pages/V8Lesson"));
const AdminV8Create = lazyRetry(() => import("./pages/AdminV8Create"));
const ChatDesignDemo = lazyRetry(() => import("./pages/ChatDesignDemo"));
const V7Documentation = lazyRetry(() => import("./pages/V7Documentation"));
const Admin3DDemos = lazyRetry(() => import("./pages/Admin3DDemos"));
const AdminDebugs = lazyRetry(() => import("./pages/AdminDebugs"));
const AdminTimedQuizDemo = lazyRetry(() => import("./pages/AdminTimedQuizDemo"));
const AdminFlipCardQuizDemo = lazyRetry(() => import("./pages/AdminFlipCardQuizDemo"));
const AdminExerciseLibrary = lazyRetry(() => import("./pages/AdminExerciseLibrary"));
const AdminModelos = lazyRetry(() => import("./pages/AdminModelos"));
const AdminContracts = lazyRetry(() => import("./pages/AdminContracts"));
const C10Report = lazyRetry(() => import("./pages/admin/C10Report"));
const AdminUserManagement = lazyRetry(() => import("./pages/AdminUserManagement"));
const AdminImageLab = lazyRetry(() => import("./pages/AdminImageLab"));
const AdminAudioPreview = lazyRetry(() => import("./pages/AdminAudioPreview"));

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
    <Background3DProvider>
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
                <Route path="/all-trails/:type" element={<AllTrails />} />
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
                <Route path="/course/:id" element={
                  <SuspenseWithFallback fallback={<TrailDetailSkeleton />}>
                    <CourseDetail />
                  </SuspenseWithFallback>
                } />
                <Route path="/lessons/:id" element={<Lesson />} />
                <Route path="/lessons-interactive/:id" element={<LessonInteractive />} />
                <Route path="/v7/:lessonId" element={<V7CinematicPlayer />} />
                <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
                <Route path="/admin/users" element={<AdminOnlyRoute><AdminUserManagement /></AdminOnlyRoute>} />
                <Route path="/admin/pipeline" element={<AdminRoute><AdminPipelineHub /></AdminRoute>} />
                <Route path="/admin/pipeline/create-single" element={<AdminRoute><AdminPipelineCreateSingle /></AdminRoute>} />
                <Route path="/admin/pipeline/create-batch" element={<AdminRoute><AdminPipelineCreateBatch /></AdminRoute>} />
                <Route path="/admin/pipeline/manage-lessons" element={<AdminRoute><AdminManageLessons /></AdminRoute>} />
                <Route path="/admin/pipeline/lesson-debug/:id" element={<AdminRoute><AdminLessonDebug /></AdminRoute>} />
                <Route path="/admin/pipeline/fix-exercises" element={<AdminRoute><AdminFixLessonExercises /></AdminRoute>} />
                <Route path="/admin/pipeline/monitor/:executionId?" element={<AdminRoute><AdminPipelineMonitor /></AdminRoute>} />
                <Route path="/admin/manual" element={<AdminRoute><AdminManualHub /></AdminRoute>} />
                <Route path="/admin/create-lesson-v3" element={<AdminRoute><AdminCreateLessonV3 /></AdminRoute>} />
                <Route path="/admin/audio-generator" element={<AdminRoute><AdminAudioGenerator /></AdminRoute>} />
                <Route path="/admin/audio-batch" element={<AdminRoute><AdminAudioBatch /></AdminRoute>} />
                <Route path="/admin/sync-tester" element={<AdminRoute><AdminSyncTester /></AdminRoute>} />
                <Route path="/admin/sync-lessons" element={<AdminRoute><AdminSyncLessons /></AdminRoute>} />
                <Route path="/admin/update-timestamps" element={<AdminRoute><AdminUpdateTimestamps /></AdminRoute>} />
                <Route path="/admin/debug-timestamps" element={<AdminRoute><AdminDebugTimestamps /></AdminRoute>} />
                <Route path="/admin/lesson-tester" element={<AdminRoute><AdminLessonTester /></AdminRoute>} />
                <Route path="/admin/batch-lessons" element={<AdminRoute><AdminBatchLessons /></AdminRoute>} />
                <Route path="/admin/intonation-test" element={<AdminRoute><AdminIntonationTest /></AdminRoute>} />
                <Route path="/admin/validation-system" element={<AdminRoute><AdminValidationSystem /></AdminRoute>} />
                <Route path="/admin/pipeline-test" element={<AdminRoute><AdminPipelineTest /></AdminRoute>} />
                <Route path="/admin/test-images" element={<AdminRoute><AdminTestImageGeneration /></AdminRoute>} />
                <Route path="/admin/playground-sessions" element={<AdminRoute><AdminPlaygroundSessions /></AdminRoute>} />
                <Route path="/admin/v5-card-config" element={<AdminRoute><AdminV5CardConfig /></AdminRoute>} />
                <Route path="/admin/test-card" element={<AdminRoute><TestCard /></AdminRoute>} />
                <Route path="/admin/test-card-sync" element={<AdminRoute><AdminTestCardSync /></AdminRoute>} />
                {/* V7 CINEMATIC ROUTES */}
                <Route path="/admin/v7/create" element={<AdminRoute><AdminV7Create /></AdminRoute>} />
                <Route path="/admin/v7/preview/:lessonId?" element={<AdminRoute><AdminV7Preview /></AdminRoute>} />
                <Route path="/admin/v7/demo" element={<AdminRoute><V7CinematicDemo /></AdminRoute>} />
                {/* V7-vv Pipeline - Versão Definitiva */}
                <Route path="/admin/v7-vv" element={<AdminRoute><AdminV7vv /></AdminRoute>} />
                <Route path="/admin/v7/diagnostic" element={<AdminRoute><AdminV7Diagnostic /></AdminRoute>} />
                <Route path="/admin/v7/pipeline" element={<AdminRoute><AdminV7Pipeline /></AdminRoute>} />
                {/* Redirect old route to new consolidated page */}
                <Route path="/admin/v7/pipeline-test" element={<AdminRoute><AdminV7Pipeline /></AdminRoute>} />
                <Route path="/v7-lesson/:lessonId" element={<V7CinematicPlayer />} />
                <Route path="/admin/v7/play/:lessonId" element={<AdminRoute><V7CinematicPlayer /></AdminRoute>} />
                {/* PUBLIC V7 DEMO FOR TESTING */}
                <Route path="/v7-demo" element={<V7CinematicDemo />} />
                {/* V7 LESSON TEST/DEBUG */}
                <Route path="/v7-test" element={<V7LessonTest />} />
                <Route path="/admin/v7/test" element={<AdminRoute><V7LessonTest /></AdminRoute>} />
                <Route path="/admin/v7/docs" element={<AdminRoute><V7Documentation /></AdminRoute>} />
                <Route path="/admin/3d-demos" element={<AdminRoute><Admin3DDemos /></AdminRoute>} />
                <Route path="/admin/debugs" element={<AdminRoute><AdminDebugs /></AdminRoute>} />
                <Route path="/admin/debugs/timed-quiz" element={<AdminRoute><AdminTimedQuizDemo /></AdminRoute>} />
                <Route path="/admin/debugs/flipcard-quiz" element={<AdminRoute><AdminFlipCardQuizDemo /></AdminRoute>} />
                <Route path="/admin/exercise-library" element={<AdminRoute><AdminExerciseLibrary /></AdminRoute>} />
                <Route path="/admin/modelos" element={<AdminRoute><AdminModelos /></AdminRoute>} />
                <Route path="/admin/contracts" element={<AdminRoute><AdminContracts /></AdminRoute>} />
                <Route path="/admin/c10-report" element={<AdminRoute><C10Report /></AdminRoute>} />
                <Route path="/admin/image-lab" element={<AdminRoute><AdminImageLab /></AdminRoute>} />
                <Route path="/admin/micro-visual" element={<AdminRoute><AdminMicroVisualSandbox /></AdminRoute>} />
                <Route path="/admin/audio-preview" element={<AdminRoute><AdminAudioPreview /></AdminRoute>} />
                {/* NEW FEATURES ROUTES */}
                <Route path="/guides" element={<Guides />} />
                <Route path="/guides/:guideId" element={<GuideDetail />} />
                <Route path="/ai-directory" element={<AIDirectory />} />
                <Route path="/prompt-library" element={<PromptLibrary />} />
                <Route path="/prompt-library/:categoryId" element={<PromptCategory />} />
                <Route path="/ai-playground" element={<AIPlayground />} />
                <Route path="/curso-exclusivo" element={<CursoExclusivo />} />
                <Route path="/chat-design-demo" element={<ChatDesignDemo />} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                {/* V8 READ & LISTEN PREMIUM ROUTES */}
                <Route path="/v8-trail/:trailId" element={<ProtectedRoute><V8TrailDetail /></ProtectedRoute>} />
                <Route path="/v8/:lessonId" element={<ProtectedRoute><V8Lesson /></ProtectedRoute>} />
                <Route path="/admin/v8/create" element={<AdminRoute><AdminV8Create /></AdminRoute>} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </AvatarStateProvider>
    </Background3DProvider>
  </QueryClientProvider>
);

export default App;
