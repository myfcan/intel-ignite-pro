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

      <div className="w-full max-w-7xl mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
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
                  className="rounded-xl transition-all relative overflow-hidden border"
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
                  <div className="absolute top-0 left-0 right-0 h-1" style={{ background: gradient }}></div>

                  <div className="flex items-center gap-4 p-6">
                    {/* Icon */}
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                         style={{ background: isCompleted ? '#F3F4F6' : gradient }}>
                      <div className={isCompleted ? 'text-pink-600' : 'text-white'}>
                        {getMissionIcon(template.requirement_type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900">{template.title}</h4>
                        {isCompleted && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Completa
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                      
                      {/* Progress bar */}
                      {!isCompleted && (
                        <>
                          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div className="h-2 rounded-full" 
                                 style={{ width: `${progressPercentage}%`, background: gradient }}></div>
                          </div>
                          <p className="text-xs text-gray-500">
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
                          className="px-4 py-2 rounded-lg font-semibold text-white shadow-lg hover:shadow-xl transition-all"
                          style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }}
                        >
                          {claimingMission === mission.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                          ) : (
                            <>
                              <Gift className="w-5 h-5 inline mr-2" />
                              Resgatar
                            </>
                          )}
                        </button>
                      ) : isCompleted ? (
                        <span className="px-3 py-1 text-white text-sm font-bold rounded-full flex items-center gap-1"
                              style={{ background: 'linear-gradient(90deg, #EC4899 0%, #DB2777 100%)' }}>
                          <Coins className="w-4 h-4" />
                          +{template.reward_value} XP
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-white text-sm font-bold rounded-full flex items-center gap-1" 
                              style={{ background: gradient }}>
                          <Sparkles className="w-4 h-4" />
                          {template.reward_value} XP
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
