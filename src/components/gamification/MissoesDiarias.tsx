import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { CheckCircle2, Gift, Sparkles, Target, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";

export function MissoesDiarias() {
  const { 
    missions, 
    rewards, 
    loading, 
    claiming, 
    claimReward 
  } = useDailyMissions();

  const handleCollectReward = async (missionId: string) => {
    await claimReward(missionId);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Missões do Dia - Grid de 3 cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {missions.map((mission, index) => {
          const template = mission.missions_daily_templates;
          const progress = Math.min((mission.progress_value / template.requirement_value) * 100, 100);
          const isComplete = mission.completed;

          return (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={cn(
                "relative overflow-hidden transition-all duration-300",
                isComplete && "border-green-500/50 bg-green-500/5"
              )}>
                <CardContent className="pt-6 pb-6 space-y-4">
                  {/* Ícone com gradiente */}
                  <div className={cn(
                    "w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center mx-auto shadow-lg",
                    getMissionGradient(index),
                    isComplete && "from-green-400 to-green-600"
                  )}>
                    {isComplete ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : (
                      <div className="text-white">
                        {getMissionIcon(template.requirement_type)}
                      </div>
                    )}
                  </div>

                  {/* Progresso */}
                  <div className="text-center">
                    <div className="text-4xl font-bold mb-1">
                      {mission.progress_value}
                      <span className="text-2xl text-muted-foreground">/{template.requirement_value}</span>
                    </div>
                    <h3 className="font-semibold text-base mb-1">{template.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                  </div>

                  {/* Barra de progresso */}
                  <div className="space-y-2">
                    <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className={cn(
                          "absolute inset-y-0 left-0 rounded-full",
                          isComplete
                            ? "bg-green-500"
                            : "bg-gradient-to-r from-primary to-primary/80"
                        )}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {Math.round(progress)}% completo
                      </span>
                      {isComplete && (
                        <span className="text-green-500 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Completo!
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Recompensa da missão */}
                  {!isComplete && template.reward_value && (
                    <div className="text-center pt-2 border-t">
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Sparkles className="w-3 h-3 text-primary" />
                        +{template.reward_value} pontos
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Recompensas não resgatadas */}
      {rewards.length > 0 && (
        <motion.div
          animate={{ 
            boxShadow: [
              "0 0 0 0 hsl(var(--primary) / 0)", 
              "0 0 20px 5px hsl(var(--primary) / 0.3)", 
              "0 0 0 0 hsl(var(--primary) / 0)"
            ] 
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="pt-6 space-y-3">
              <div className="flex items-center gap-2 mb-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  <Gift className="w-6 h-6 text-primary" />
                </motion.div>
                <h3 className="text-lg font-semibold">Recompensas Disponíveis</h3>
              </div>

              {rewards.map((reward) => (
                <motion.div
                  key={reward.id}
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  className="flex items-center justify-between p-4 bg-card rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">
                        {reward.reward_value} {reward.reward_type === "points" ? "pontos" : reward.reward_type}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Missão completada!
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleCollectReward(reward.id)}
                    disabled={claiming}
                    className="gap-2"
                  >
                    {claiming ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Gift className="w-4 h-4" />
                        Resgatar
                      </>
                    )}
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Todas as missões completas */}
      {missions.every((m) => m.completed) && rewards.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className="bg-gradient-to-br from-green-500/10 to-green-600/10 border-green-500/50">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">
                🎉 Todas as missões completas!
              </h3>
              <p className="text-sm text-muted-foreground">
                Volte amanhã para novas missões e recompensas
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
