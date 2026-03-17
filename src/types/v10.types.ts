// ============================================================
// AILIV V10 — TypeScript Types
// Gerado a partir do schema: 20260315120000_create_v10_tables.sql
// ============================================================

// ------------------------------------------------------------
// Utility / Literal Types
// ------------------------------------------------------------

export type V10ScreenPart = 'A' | 'B' | 'C';

export type V10PipelineStage = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type V10ScoreSemaphore = 'green' | 'yellow' | 'red';

// ------------------------------------------------------------
// V10Element — Discriminated union (15 element types)
// ------------------------------------------------------------

export type V10ElementChromeHeader = {
  type: 'chrome_header';
  url: string;
};

export type V10ElementText = {
  type: 'text';
  content: string;
};

export type V10ElementInput = {
  type: 'input';
  label: string;
  value?: string;
  placeholder?: string;
  highlight?: boolean;
};

export type V10ElementSelect = {
  type: 'select';
  label: string;
  options: string[];
  selected: number;
  highlight?: boolean;
};

export type V10ElementButton = {
  type: 'button';
  label: string;
  primary: boolean;
  icon?: string;
};

export type V10ElementWarning = {
  type: 'warning';
  text: string;
};

export type V10ElementNavBreadcrumb = {
  type: 'nav_breadcrumb';
  from: string;
  to: string;
  how: string;
};

export type V10ElementDependency = {
  type: 'dependency';
  text: string;
};

export type V10ElementCelebration = {
  type: 'celebration';
  text: string;
  next?: string;
};

export type V10ElementTooltipTerm = {
  type: 'tooltip_term';
  term: string;
  tip: string;
};

export type V10ElementImage = {
  type: 'image';
  src: string;
  alt: string;
};

export type V10ElementTable = {
  type: 'table';
  headers: string[];
  rows: string[][];
};

export type V10ElementCodeBlock = {
  type: 'code_block';
  language: string;
  content: string;
};

export type V10ElementDivider = {
  type: 'divider';
};

export type V10ElementShimmer = {
  type: 'shimmer';
  height: number;
};

export type V10Element =
  | V10ElementChromeHeader
  | V10ElementText
  | V10ElementInput
  | V10ElementSelect
  | V10ElementButton
  | V10ElementWarning
  | V10ElementNavBreadcrumb
  | V10ElementDependency
  | V10ElementCelebration
  | V10ElementTooltipTerm
  | V10ElementImage
  | V10ElementTable
  | V10ElementCodeBlock
  | V10ElementDivider
  | V10ElementShimmer;

// ------------------------------------------------------------
// V10Frame — A single frame within a lesson step
// ------------------------------------------------------------

export interface V10Frame {
  bar_text: string;
  bar_sub: string;
  bar_color: string;
  elements: V10Element[];
  tip: { text: string; position: 'top' | 'bottom' } | null;
  action: string | null;
  check: string | null;
}

// ------------------------------------------------------------
// V10Liv — Liv assistant hints per step
// ------------------------------------------------------------

export interface V10Liv {
  tip: string;
  analogy: string;
  sos: string;
}

// ------------------------------------------------------------
// V10Warning — Optional warning block per step
// ------------------------------------------------------------

export interface V10Warning {
  warn: string | null;
  ift: { tag: string; desc: string; act: string } | null;
}

// ------------------------------------------------------------
// V10Lesson — Lesson metadata (v10_lessons table)
// ------------------------------------------------------------

export interface V10Lesson {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  trail_id: string | null;
  course_id: string | null;
  order_in_trail: number;
  total_steps: number;
  estimated_minutes: number;
  tools: string[];
  badge_icon: string | null;
  badge_name: string | null;
  xp_reward: number;
  status: 'draft' | 'published' | 'archived';
  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------
// V10LessonStep — Step data (v10_lesson_steps table)
// ------------------------------------------------------------

export interface V10LessonStep {
  id: string;
  lesson_id: string;
  step_number: number;
  slug: string | null;
  title: string;
  description: string | null;
  app_name: string | null;
  app_icon: string | null;
  app_badge_bg: string;
  app_badge_color: string;
  accent_color: string;
  duration_seconds: number;
  progress_percent: number;
  phase: 1 | 2 | 3 | 4 | 5;
  frames: V10Frame[];
  liv: V10Liv;
  warnings: V10Warning | null;
  audio_url: string | null;
  narration_script: string | null;
}

// ------------------------------------------------------------
// V10LessonNarration — Audio for parts A and C
// ------------------------------------------------------------

export interface V10LessonNarration {
  id: string;
  lesson_id: string;
  part: 'A' | 'C';
  audio_url: string | null;
  duration_seconds: number;
  script_text: string | null;
}

// ------------------------------------------------------------
// V10IntroSlide — Slides for part A intro
// ------------------------------------------------------------

export interface V10IntroSlide {
  id: string;
  lesson_id: string;
  slide_order: number;
  icon: string | null;
  tool_name: string | null;
  tool_color: string;
  description: string | null;
  label: string | null;
  title: string;
  subtitle: string | null;
  appear_at_seconds: number;
}

// ------------------------------------------------------------
// V10UserProgress — Per-user lesson progress
// ------------------------------------------------------------

export interface V10UserProgress {
  id: string;
  user_id: string;
  lesson_id: string;
  current_part: V10ScreenPart;
  current_step: number;
  current_frame: number;
  completed: boolean;
  completed_at: string | null;
  started_at: string;
  time_spent_seconds: number;
}

// ------------------------------------------------------------
// V10UserAchievement — Badge / XP earned per lesson
// ------------------------------------------------------------

export interface V10UserAchievement {
  id: string;
  user_id: string;
  lesson_id: string;
  badge_icon: string | null;
  badge_name: string | null;
  xp_earned: number;
  earned_at: string;
}

// ------------------------------------------------------------
// V10UserStreak — Learning streak tracking
// ------------------------------------------------------------

export interface V10UserStreak {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
  streak_start_date: string | null;
}

// ------------------------------------------------------------
// V10UserPlan — Subscription plan
// ------------------------------------------------------------

export interface V10UserPlan {
  id: string;
  user_id: string;
  plan_slug: 'basico' | 'ultra' | 'pro';
  plan_name: string;
  daily_interactions_limit: number;
  price_brl: number;
  started_at: string;
  expires_at: string | null;
  status: 'active' | 'cancelled' | 'expired';
}

// ------------------------------------------------------------
// V10DailyUsage — Daily Claude interaction tracking
// ------------------------------------------------------------

export interface V10DailyUsage {
  id: string;
  user_id: string;
  usage_date: string;
  interactions_used: number;
  interactions_limit: number;
}

// ------------------------------------------------------------
// V10BpaPipeline — Full production pipeline state
// ------------------------------------------------------------

export interface V10BpaPipeline {
  id: string;
  lesson_id: string | null;
  slug: string;
  title: string;
  status: 'draft' | 'in_progress' | 'ready' | 'published';
  current_stage: V10PipelineStage;
  created_by: string | null;

  // Stage 1: Viability score
  score_total: number;
  score_refero: number;
  score_docs: number;
  score_pedagogy: number;
  score_difficulty: number;
  score_relevance: number;
  score_semaphore: V10ScoreSemaphore;
  docs_manual_input: string | null;

  // Stage 2: Step structure
  steps_generated: number;
  steps_audited: number;
  audit_passed: boolean;

  // Stage 3: Images
  images_needed: number;
  images_generated: number;
  images_approved: number;

  // Stage 4: Mockups
  mockups_total: number;
  mockups_from_refero: number;
  mockups_generic: number;
  mockups_approved: number;

  // Stage 5: Narration
  audios_total: number;
  audios_generated: number;
  audios_approved: number;

  // Stage 6: Assembly
  assembly_checklist: Record<string, boolean>;
  assembly_passed: boolean;

  // Stage 7: Publication
  preview_at: string | null;
  approved_at: string | null;
  published_at: string | null;
  approved_by: string | null;

  created_at: string;
  updated_at: string;
}

// ------------------------------------------------------------
// V10BpaPipelineLog — Pipeline audit log entry
// ------------------------------------------------------------

export interface V10BpaPipelineLog {
  id: string;
  pipeline_id: string;
  stage: number;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

// ------------------------------------------------------------
// Anchor Text System — Audio ↔ Visual synchronization
// ------------------------------------------------------------

/** The 4 types of anchor event in V10 */
export type AnchorType =
  | 'pontos_atencao'
  | 'confirmacao'
  | 'troca_frame'
  | 'troca_ferramenta';

/** A single anchor record from v10_lesson_step_anchors */
export interface StepAnchor {
  id: string;
  step_id: string;
  anchor_type: AnchorType;
  timestamp_seconds: number;
  match_phrase: string;
  label: string | null;
}

/** Tag marked in the narration script (before processing) */
export interface AnchorTag {
  type: AnchorType;
  position_in_text: number;
  phrase_after: string;
}

/** Event tracked at runtime by the player */
export interface AnchorEvent {
  type: AnchorType;
  timestamp: number;
  fired: boolean;
}
