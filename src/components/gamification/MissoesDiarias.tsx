import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { CheckCircle2, Gift, Sparkles, BookOpen, Target, Check, Coins } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { MissionCompletionAnimation } from "./MissionCompletionAnimation";

export function MissoesDiarias() {
  const { 
    missions, 
    rewards, 
    loading, 
    claimReward 
  } = useDailyMissions();

  const [claimingMission, setClaimingMission] = useState<string | null>(null);
  const [completedMission, setCompletedMission] = useState<{ title: string; reward: number } | null>(null);
  const [previousMissions, setPreviousMissions] = useState<typeof missions>([]);

  useEffect(() => {
    if (missions.length > 0 && previousMissions.length > 0) {
      missions.forEach((mission) => {
        const previousMission = previousMissions.find(pm => pm.id === mission.id);
        if (previousMission && !previousMission.completed && mission.completed) {
          const template = mission.missions_daily_templates;
          setCompletedMission({
            title: template.title,
            reward: template.reward_value
          });
        }
      });
    }
    setPreviousMissions(missions);
  }, [missions]);

  const handleCollectReward = async (missionId: string) => {
    setClaimingMission(missionId);
    await claimReward(missionId);
    setClaimingMission(null);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const getMissionIcon = (requirementType: string) => {
    switch (requirementType) {
      case "complete_lessons":
        return <BookOpen className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "correct_exercises":
        return <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />;
      case "daily_streak":
        return <Target className="w-5 h-5 sm:w-6 sm:h-6" />;
      default:
        return <Target className="w-5 h-5 sm:w-6 sm:h-6" />;
    }
  };

  const missionGradients = [
    'linear-gradient(90deg, #EC4899 0%, #DB2777 100%)',
    'linear-gradient(90deg, #8B5CF6 0%, #6366F1 100%)',
    'linear-gradient(90deg, #10B981 0%, #06B6D4 100%)',
  ];

  return (
    <>
      {completedMission && (
        <MissionCompletionAnimation
          missionTitle={completedMission.title}
          rewardValue={completedMission.reward}
          onComplete={() => setCompletedMission(null)}
        />
      )}

      <div className="w-full max-w-7xl mx-auto px-2 xs:px-3 sm:px-4">
        {loading ? (
          <div className="flex items-center justify-center py-12 xs:py-16">
            <div className="animate-spin rounded-full h-10 w-10 xs:h-12 xs:w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-2 xs:space-y-3 sm:space-y-4">
            {missions.map((mission, index) => {
              const template = mission.missions_daily_templates;
              const progressPercentage = Math.min(
                (mission.progress_value / template.requirement_value) * 100,
                100
              );
              const isCompleted = mission.completed;
              const hasReward = rewards.some(r => r.mission_id === mission.id && !r.collected);
              
              const gradient = missionGradients[index % missionGradients.length];

              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="rounded-lg xs:rounded-xl transition-all relative overflow-hidden border"
                  style={{
                    background: 'linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%)',
                    backgroundImage: `
                      linear-gradient(135deg, #F8F9FA 0%, #E9ECEF 100%),
                      radial-gradient(circle, rgba(139, 92, 246, 0.08) 1px, transparent 1px)
                    `,
                    backgroundSize: 'cover, 16px 16px',
                    backgroundPosition: 'center, 0 0',
                    borderColor: 'rgba(139, 92, 246, 0.2)',
                    boxShadow: '0 2px 8px rgba(139, 92, 246, 0.05)',
                  }}
                  onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.4)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.1)';
                  }}
                  onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => {
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(139, 92, 246, 0.05)';
                  }}
                >
                  {/* Barra colorida no topo */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 xs:h-1" style={{ background: gradient }}></div>

                  <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 p-3 xs:p-4 sm:p-6">
                    {/* Icon */}
                    <div className="w-10 h-10 xs:w-11 xs:h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center flex-shrink-0" 
                         style={{ background: isCompleted ? '#F3F4F6' : gradient }}>
                      <div className={isCompleted ? 'text-pink-600' : 'text-white'}>
                        {getMissionIcon(template.requirement_type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 xs:gap-2 mb-0.5 xs:mb-1 flex-wrap">
                        <h4 className="font-bold text-sm xs:text-base text-gray-900 truncate">{template.title}</h4>
                        {isCompleted && (
                          <span className="px-1.5 xs:px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] xs:text-xs font-semibold flex items-center gap-0.5 xs:gap-1 flex-shrink-0">
                            <Check className="w-2.5 h-2.5 xs:w-3 xs:h-3" />
                            <span className="hidden xs:inline">Completa</span>
                            <span className="xs:hidden">✓</span>
                          </span>
                        )}
                      </div>
                      <p className="text-xs xs:text-sm text-gray-600 mb-2 xs:mb-3 leading-snug">{template.description}</p>
                      
                      {/* Progress bar */}
                      {!isCompleted && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-1.5 xs:h-2 mb-1.5 xs:mb-2">
                            <div className="h-1.5 xs:h-2 rounded-full" 
                                 style={{ width: `${progressPercentage}%`, background: gradient }}></div>
                          </div>
                          <p className="text-[10px] xs:text-xs text-gray-500">
                            {mission.progress_value}/{template.requirement_value} completas
                          </p>
                        </>
                      )}
                    </div>

                    {/* Reward Button */}
                    <div className="flex-shrink-0">
                      {hasReward ? (
                        <button
                          onClick={() => handleCollectReward(mission.id)}
                          disabled={claimingMission === mission.id}
                          className="px-2 xs:px-3 sm:px-4 py-1.5 xs:py-2 rounded-lg text-xs xs:text-sm font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                          style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                        >
                          {claimingMission === mission.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 xs:h-5 xs:w-5 border-b-2 border-white" />
                          ) : (
                            <>
                              <Gift className="w-4 h-4 xs:w-5 xs:h-5 inline mr-1 xs:mr-2" />
                              <span className="hidden xs:inline">Resgatar</span>
                            </>
                          )}
                        </button>
                      ) : isCompleted ? (
                        <span className="px-2 xs:px-3 py-0.5 xs:py-1 text-white text-xs xs:text-sm font-bold rounded-full flex items-center gap-0.5 xs:gap-1"
                              style={{ background: 'linear-gradient(90deg, #EC4899 0%, #DB2777 100%)' }}>
                          <Coins className="w-3 h-3 xs:w-4 xs:h-4" />
                          <span className="hidden xs:inline">+{template.reward_value} XP</span>
                          <span className="xs:hidden">+{template.reward_value}</span>
                        </span>
                      ) : (
                        <span className="px-2 xs:px-3 py-0.5 xs:py-1 text-white text-xs xs:text-sm font-bold rounded-full flex items-center gap-0.5 xs:gap-1" 
                              style={{ background: gradient }}>
                          <Sparkles className="w-3 h-3 xs:w-4 xs:h-4" />
                          <span className="hidden xs:inline">{template.reward_value} XP</span>
                          <span className="xs:hidden">{template.reward_value}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
