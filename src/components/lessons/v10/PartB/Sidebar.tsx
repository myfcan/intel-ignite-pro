import React from 'react';
import type { V10LessonStep } from '../../../../types/v10.types';

interface SidebarProps {
  steps: V10LessonStep[];
  currentStepIndex: number;
  onStepClick: (index: number) => void;
  lessonTitle: string;
}

/** Group steps by their phase number */
function groupByPhase(steps: V10LessonStep[]): Map<number, V10LessonStep[]> {
  const map = new Map<number, V10LessonStep[]>();
  for (const step of steps) {
    const group = map.get(step.phase) || [];
    group.push(step);
    map.set(step.phase, group);
  }
  return map;
}

const PHASE_LABELS: Record<number, string> = {
  1: 'Preparação',
  2: 'Configuração',
  3: 'Execução',
  4: 'Validação',
  5: 'Conclusão',
};

const Sidebar: React.FC<SidebarProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  lessonTitle,
}) => {
  const grouped = groupByPhase(steps);

  // Unique tool badges
  const tools = new Map<string, { icon: string | null; bg: string; color: string }>();
  for (const step of steps) {
    if (step.app_name && !tools.has(step.app_name)) {
      tools.set(step.app_name, {
        icon: step.app_icon,
        bg: step.app_badge_bg,
        color: step.app_badge_color,
      });
    }
  }

  return (
    <aside
      className="shrink-0 flex flex-col h-full border-l border-gray-200 bg-[#F5F6F8] overflow-y-auto"
      style={{
        width: 280,
        minWidth: 260,
        maxWidth: 320,
      }}
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-gray-200">
        <h3 className="text-sm font-bold text-gray-800 mb-2">{lessonTitle}</h3>

        {/* Tool badges */}
        {tools.size > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {Array.from(tools.entries()).map(([name, t]) => (
              <span
                key={name}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
                style={{ backgroundColor: t.bg, color: t.color }}
              >
                {t.icon && <span>{t.icon}</span>}
                <span>{name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Steps grouped by phase */}
      <div className="flex-1 px-3 py-3 flex flex-col gap-4">
        {Array.from(grouped.entries()).map(([phase, phaseSteps]) => (
          <div key={phase}>
            <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1">
              {PHASE_LABELS[phase] || `Fase ${phase}`}
            </span>
            <div className="flex flex-col gap-0.5">
              {phaseSteps.map((step) => {
                const stepIdx = steps.indexOf(step);
                const isActive = stepIdx === currentStepIndex;
                const isDone = stepIdx < currentStepIndex;
                const isLocked = stepIdx > currentStepIndex;

                return (
                  <button
                    key={step.id}
                    type="button"
                    onClick={() => {
                      if (!isLocked) onStepClick(stepIdx);
                    }}
                    disabled={isLocked}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-colors ${
                      isActive
                        ? 'bg-white shadow-sm'
                        : isDone
                          ? 'hover:bg-white/60'
                          : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    {/* Number badge */}
                    <span
                      className={`shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${
                        isActive
                          ? 'text-white'
                          : isDone
                            ? 'bg-emerald-100 text-emerald-600'
                            : 'bg-gray-200 text-gray-400'
                      }`}
                      style={
                        isActive
                          ? { background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }
                          : undefined
                      }
                    >
                      {isDone ? (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      ) : (
                        step.step_number
                      )}
                    </span>

                    {/* Title */}
                    <span
                      className={`text-xs leading-tight ${
                        isActive
                          ? 'font-semibold text-gray-900'
                          : isDone
                            ? 'text-gray-600'
                            : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
