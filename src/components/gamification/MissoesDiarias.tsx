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

  // Detect newly completed missions
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
        return <BookOpen className="w-6 h-6" />;
      case "correct_exercises":
        return <CheckCircle2 className="w-6 h-6" />;
      case "daily_streak":
        return <Target className="w-6 h-6" />;
      default:
        return <Target className="w-6 h-6" />;
    }
  };

  return (
    <>
      {completedMission && (
        <MissionCompletionAnimation
          missionTitle={completedMission.title}
          rewardValue={completedMission.reward}
          onComplete={() => setCompletedMission(null)}
        />
      )}

      <div className="w-full max-w-7xl mx-auto space-y-6">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {missions.map((mission, index) => {
              const template = mission.missions_daily_templates;
              const progressPercentage = Math.min(
                (mission.progress_value / template.requirement_value) * 100,
                100
              );
              const isCompleted = mission.completed;
              const hasReward = rewards.some(r => r.mission_id === mission.id && !r.collected);

              const missionColors = [
                { bg: "bg-gradient-to-br from-amber-400 to-orange-500", icon: "text-orange-600" },
                { bg: "bg-gradient-to-br from-purple-400 to-indigo-500", icon: "text-purple-600" },
                { bg: "bg-gradient-to-br from-emerald-400 to-teal-500", icon: "text-teal-600" },
                { bg: "bg-gradient-to-br from-pink-400 to-rose-500", icon: "text-pink-600" },
                { bg: "bg-gradient-to-br from-cyan-400 to-blue-500", icon: "text-cyan-600" },
              ];
              
              const color = missionColors[index % missionColors.length];

              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className={cn(
                    "group relative overflow-hidden rounded-[32px] min-h-[110px] transition-all duration-300",
                    "hover:scale-[1.02] hover:shadow-2xl",
                    isCompleted ? color.bg : "bg-white/60 backdrop-blur-xl border-2 border-slate-200/50"
                  )}
                >
                  {isCompleted && (
                    <>
                      <div className="absolute -right-12 -top-12 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                      <div className="absolute -left-8 -bottom-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
                    </>
                  )}

                  <div className="relative flex items-center gap-5 p-6">
                    <div className={cn(
                      "flex-shrink-0 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform duration-300",
                      "group-hover:scale-110",
                      isCompleted ? "bg-white/95" : `${color.bg}`
                    )}>
                      <div className={isCompleted ? color.icon : "text-white"}>
                        {getMissionIcon(template.requirement_type)}
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className={cn(
                          "font-bold text-lg",
                          isCompleted ? "text-white" : "text-slate-800"
                        )}>
                          {template.title}
                        </h3>
                        {isCompleted && (
                          <span className="flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" />
                            Completa
                          </span>
                        )}
                      </div>
                      
                      <p className={cn(
                        "text-sm mb-3 line-clamp-1",
                        isCompleted ? "text-white/90" : "text-slate-600"
                      )}>
                        {template.description}
                      </p>

                      {!isCompleted && (
                        <div className="mb-2">
                          <Progress 
                            value={progressPercentage} 
                            className="h-2 bg-slate-200"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <span className={cn(
                          "text-xs font-medium",
                          isCompleted ? "text-white/80" : "text-slate-500"
                        )}>
                          {mission.progress_value}/{template.requirement_value} {
                            template.requirement_type === 'complete_lessons' ? 'aulas' :
                            template.requirement_type === 'correct_exercises' ? 'exercícios' :
                            'dias'
                          }
                        </span>
                        {!isCompleted && progressPercentage > 0 && (
                          <span className="text-xs font-medium text-slate-500">
                            • {Math.round(progressPercentage)}% completo
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {hasReward ? (
                        <Button
                          onClick={() => handleCollectReward(mission.id)}
                          disabled={claimingMission === mission.id}
                          className={cn(
                            "rounded-full px-6 h-12 font-semibold shadow-lg",
                            "bg-white/95 hover:bg-white text-slate-800",
                            "transition-all duration-300 hover:scale-110"
                          )}
                        >
                          {claimingMission === mission.id ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-800" />
                          ) : (
                            <>
                              <Gift className="w-5 h-5 mr-2" />
                              {template.reward_value} XP
                            </>
                          )}
                        </Button>
                      ) : isCompleted ? (
                        <div className="flex items-center gap-2 bg-white/90 rounded-full px-4 py-2 shadow-lg">
                          <Coins className="w-5 h-5 text-amber-600" />
                          <span className="text-sm font-semibold text-slate-800">
                            +{template.reward_value} XP
                          </span>
                        </div>
                      ) : (
                        <div className={cn(
                          "flex items-center gap-2 rounded-full px-4 py-2",
                          color.bg,
                          "text-white font-semibold text-sm shadow-lg"
                        )}>
                          <Sparkles className="w-4 h-4" />
                          {template.reward_value} XP
                        </div>
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
