import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { CheckCircle2, Gift, Sparkles, Target, BookOpen, Trophy, Check, Coins } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { MissionCompletionAnimation } from "./MissionCompletionAnimation";
import React from "react";

export function MissoesDiarias() {
  const { 
    missions, 
    rewards, 
    loading, 
    claiming, 
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
          // Mission just completed!
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
        return <BookOpen className="w-7 h-7" />;
      case "correct_exercises":
        return <CheckCircle2 className="w-7 h-7" />;
      case "daily_streak":
        return <Target className="w-7 h-7" />;
      default:
        return <Target className="w-7 h-7" />;
    }
  };

  const getMissionGradient = (index: number) => {
    const gradients = [
      "from-orange-500 via-red-500 to-pink-500",
      "from-blue-500 via-purple-500 to-indigo-600",
      "from-pink-500 via-fuchsia-500 to-purple-600",
      "from-emerald-500 via-teal-500 to-cyan-600",
      "from-yellow-500 via-orange-500 to-red-500",
      "from-indigo-500 via-purple-500 to-pink-500",
    ];
    return gradients[index % 6];
  };

  const getGradientColors = (index: number) => {
    const colors = [
      { light: "bg-orange-500/10", border: "border-orange-500/30", shadow: "shadow-orange-500/20" },
      { light: "bg-blue-500/10", border: "border-blue-500/30", shadow: "shadow-blue-500/20" },
      { light: "bg-pink-500/10", border: "border-pink-500/30", shadow: "shadow-pink-500/20" },
      { light: "bg-emerald-500/10", border: "border-emerald-500/30", shadow: "shadow-emerald-500/20" },
      { light: "bg-yellow-500/10", border: "border-yellow-500/30", shadow: "shadow-yellow-500/20" },
      { light: "bg-indigo-500/10", border: "border-indigo-500/30", shadow: "shadow-indigo-500/20" },
    ];
    return colors[index % 6];
  };

  return (
    <>
      {/* Mission Completion Animation */}
      {completedMission && (
        <MissionCompletionAnimation
          missionTitle={completedMission.title}
          rewardValue={completedMission.reward}
          onComplete={() => setCompletedMission(null)}
        />
      )}

      <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
          <Target className="w-7 h-7 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Missões Diárias
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Complete suas atividades diárias e conquiste recompensas
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          {/* Cards de Missões */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {missions.map((mission, index) => {
              const template = mission.missions_daily_templates;
              const progressPercentage = Math.min(
                (mission.progress_value / template.requirement_value) * 100,
                100
              );
              const gradient = getMissionGradient(index);
              const gradientColors = getGradientColors(index);
              const isCompleted = mission.completed;

              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="group relative"
                >
                  {/* Card Container */}
                  <div
                    className={cn(
                      "relative overflow-hidden rounded-2xl p-6 transition-all duration-300 border-2",
                      isCompleted
                        ? `bg-gradient-to-br ${gradient} border-transparent shadow-2xl hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]`
                        : `${gradientColors.light} ${gradientColors.border} hover:-translate-y-1 hover:shadow-xl ${gradientColors.shadow}`
                    )}
                  >
                    {/* Background Icon Decoration */}
                    <div
                      className={cn(
                        "absolute -right-6 -top-6 transition-all duration-300 opacity-10 group-hover:opacity-20",
                        isCompleted && "opacity-30"
                      )}
                    >
                      {isCompleted ? (
                        <Trophy className="w-32 h-32 text-yellow-300" />
                      ) : (
                        <div className="text-foreground/30">
                          {React.cloneElement(getMissionIcon(template.requirement_type) as React.ReactElement, {
                            className: "w-32 h-32"
                          })}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="relative z-10 space-y-4">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <div
                              className={cn(
                                "p-2.5 rounded-xl transition-all duration-300",
                                isCompleted
                                  ? "bg-white/20 backdrop-blur-sm"
                                  : `bg-gradient-to-br ${gradient} text-white shadow-lg`
                              )}
                            >
                              {getMissionIcon(template.requirement_type)}
                            </div>
                            {isCompleted && (
                              <span className="px-2 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold text-white">
                                ✓ Concluída
                              </span>
                            )}
                          </div>
                          <h3
                            className={cn(
                              "text-lg font-bold",
                              isCompleted ? "text-white" : "text-foreground"
                            )}
                          >
                            {template.title}
                          </h3>
                          <p
                            className={cn(
                              "text-sm mt-1",
                              isCompleted ? "text-white/80" : "text-muted-foreground"
                            )}
                          >
                            {template.description}
                          </p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      {!isCompleted && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">
                              Progresso
                            </span>
                            <span className="text-sm font-bold text-foreground">
                              {mission.progress_value}/{template.requirement_value}
                            </span>
                          </div>
                          <div className="relative h-3 bg-secondary/30 rounded-full overflow-hidden backdrop-blur-sm">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progressPercentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
                              className={cn(
                                "h-full rounded-full bg-gradient-to-r shadow-lg",
                                gradient
                              )}
                            />
                          </div>
                        </div>
                      )}

                      {/* Completed State - Trophy Animation */}
                      {isCompleted && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{
                            type: "spring",
                            stiffness: 200,
                            damping: 10,
                            delay: index * 0.1 + 0.3,
                          }}
                          className="flex items-center justify-center py-4"
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                          >
                            <Trophy className="w-16 h-16 text-yellow-300 drop-shadow-lg" />
                          </motion.div>
                        </motion.div>
                      )}

                      {/* Reward Info */}
                      <div
                        className={cn(
                          "flex items-center gap-2 pt-2 border-t",
                          isCompleted ? "border-white/20" : "border-border"
                        )}
                      >
                        <Coins
                          className={cn(
                            "w-5 h-5",
                            isCompleted ? "text-yellow-300" : "text-primary"
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-semibold",
                            isCompleted ? "text-white" : "text-foreground"
                          )}
                        >
                          +{template.reward_value} pontos
                        </span>
                      </div>
                    </div>

                    {/* Glow effect for completed missions */}
                    {isCompleted && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl"
                        animate={{
                          boxShadow: [
                            "0 0 20px rgba(255, 215, 0, 0.3)",
                            "0 0 40px rgba(255, 215, 0, 0.5)",
                            "0 0 20px rgba(255, 215, 0, 0.3)",
                          ],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Seção de Recompensas */}
          {rewards.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20">
                  <Gift className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">
                  Recompensas Disponíveis
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <Card 
                    key={reward.id} 
                    className="bg-gradient-to-br from-accent/10 via-primary/5 to-accent/10 border-2 border-primary/40 shadow-lg shadow-primary/10"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Sparkles className="w-5 h-5 text-primary" />
                          </div>
                          <CardTitle className="text-base">Recompensa</CardTitle>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full">
                          <Coins className="w-5 h-5 text-primary" />
                          <span className="text-lg font-bold text-primary">+{reward.reward_value}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button
                        onClick={() => handleCollectReward(reward.mission_id)}
                        disabled={claimingMission === reward.mission_id}
                        className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {claimingMission === reward.mission_id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                            Resgatando...
                          </>
                        ) : (
                          <>
                            <Gift className="w-4 h-4 mr-2" />
                            Resgatar Agora
                          </>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Estado de Conclusão Total */}
          {missions.length > 0 &&
            missions.every((m) => m.completed) &&
            rewards.length === 0 && (
              <Card className="relative overflow-hidden bg-gradient-to-r from-primary/15 via-accent/10 to-primary/15 border-2 border-primary/40 shadow-xl shadow-primary/20">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 animate-pulse" />
                <CardContent className="relative flex flex-col items-center justify-center py-16">
                  <div className="relative mb-6">
                    <div className="absolute inset-0 bg-primary/30 blur-2xl animate-pulse rounded-full" />
                    <Trophy className="relative w-20 h-20 text-primary animate-bounce" />
                  </div>
                  <h3 className="text-3xl font-bold text-foreground mb-2">
                    Parabéns! 🎉
                  </h3>
                  <p className="text-muted-foreground text-center text-lg">
                    Você completou todas as missões de hoje!
                  </p>
                </CardContent>
              </Card>
            )}
        </>
      )}
      </div>
    </>
  );
}
