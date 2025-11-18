import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { CheckCircle2, Gift, Sparkles, Target, BookOpen, Trophy, Check, Coins } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function MissoesDiarias() {
  const { 
    missions, 
    rewards, 
    loading, 
    claiming, 
    claimReward 
  } = useDailyMissions();

  const [claimingMission, setClaimingMission] = useState<string | null>(null);

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
      "from-orange-400 to-orange-600",
      "from-blue-400 to-blue-600",
      "from-pink-400 to-pink-600",
    ];
    return gradients[index % 3];
  };

  return (
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
              const isComplete = mission.completed;
              const progress = Math.min(
                (mission.progress_value / template.requirement_value) * 100,
                100
              );

              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card
                    className={cn(
                      "relative overflow-hidden transition-all duration-500 border-2 h-full",
                      isComplete
                        ? "bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 border-primary/40 shadow-lg shadow-primary/20"
                        : "bg-card/80 backdrop-blur-sm border-border/50 hover:border-primary/30"
                    )}
                  >
                    {/* Background Pattern */}
                    <div
                      className={cn(
                        "absolute inset-0 opacity-5 transition-opacity duration-500",
                        isComplete && "opacity-10"
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${getMissionGradient(index)})`,
                      }}
                    />
                    
                    {/* Trophy Badge para missão completa */}
                    {isComplete && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="relative">
                          <div className="absolute inset-0 bg-primary/30 blur-xl animate-pulse rounded-full" />
                          <div className="relative bg-gradient-to-br from-primary to-accent p-2 rounded-full">
                            <Trophy className="w-6 h-6 text-primary-foreground" />
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <CardHeader className="relative pb-4 space-y-3">
                      {/* Ícone */}
                      <div
                        className={cn(
                          "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300",
                          isComplete
                            ? "bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30"
                            : "bg-muted/50"
                        )}
                      >
                        <div className={cn(
                          "transition-colors duration-300",
                          isComplete ? "text-primary-foreground" : "text-muted-foreground"
                        )}>
                          {getMissionIcon(template.requirement_type)}
                        </div>
                      </div>

                      {/* Título e Descrição */}
                      <div>
                        <CardTitle className={cn(
                          "text-lg font-bold mb-1.5 transition-colors duration-300",
                          isComplete ? "text-primary" : "text-foreground"
                        )}>
                          {template.title}
                        </CardTitle>
                        <CardDescription className="text-sm leading-relaxed">
                          {template.description}
                        </CardDescription>
                      </div>
                    </CardHeader>

                    <CardContent className="relative space-y-4">
                      {/* Progresso */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground font-medium">Progresso</span>
                          <span className={cn(
                            "font-bold transition-colors duration-300",
                            isComplete ? "text-primary" : "text-foreground"
                          )}>
                            {mission.progress_value} / {template.requirement_value}
                          </span>
                        </div>
                        <Progress 
                          value={progress} 
                          className={cn(
                            "h-2.5 transition-all duration-500",
                            isComplete && "bg-primary/20"
                          )} 
                        />
                      </div>

                      {/* Badge de Conclusão */}
                      {isComplete && !mission.reward_claimed && (
                        <div className="p-3 bg-gradient-to-r from-primary/15 to-accent/15 rounded-xl border border-primary/30">
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
                            <p className="text-sm text-primary font-semibold">
                              Missão completa! Recompensa disponível
                            </p>
                          </div>
                        </div>
                      )}

                      {isComplete && mission.reward_claimed && (
                        <div className="p-3 bg-muted/30 rounded-xl border border-border/50">
                          <div className="flex items-center gap-2">
                            <Check className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                            <p className="text-sm text-muted-foreground font-medium">
                              Recompensa já resgatada
                            </p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
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
  );
}
