import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useDailyMissions } from "@/hooks/useDailyMissions";
import { CheckCircle2, Flame, Gift, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";

export function MissoesDiarias() {
  const { 
    missions, 
    rewards, 
    streak, 
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

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const completedCount = missions.filter(m => m.completed).length;
  const totalMissions = missions.length;
  const unclaimedRewards = rewards.filter(r => !r.collected);

  return (
    <div className="space-y-4">
      {/* Streak Card */}
      {streak && (
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-orange-500/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-500/20 rounded-full">
                  <Flame className="h-6 w-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Sequência Atual</p>
                  <p className="text-2xl font-bold">{streak.current_streak} dias</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Recorde</p>
                <p className="text-xl font-semibold text-orange-500">{streak.best_streak} dias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Missions Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Missões Diárias
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {completedCount} de {totalMissions} completas
              </p>
            </div>
            <Badge variant="secondary" className="text-sm">
              Hoje
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {missions.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma missão disponível hoje
            </p>
          ) : (
            missions.map((mission, index) => {
              const template = mission.missions_daily_templates;
              return (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5">
                        {mission.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border-2 border-muted" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`font-medium ${mission.completed ? "line-through text-muted-foreground" : ""}`}>
                          {template.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-0.5">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <Badge 
                      variant={mission.completed ? "default" : "secondary"}
                      className="shrink-0"
                    >
                      {template.reward_value} {template.reward_type}
                    </Badge>
                  </div>
                  
                  <div className="ml-8">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        {mission.progress_value} / {template.requirement_value}
                      </span>
                      <span className="text-xs font-medium text-primary">
                        {Math.min(100, Math.round((mission.progress_value / template.requirement_value) * 100))}%
                      </span>
                    </div>
                    <Progress 
                      value={Math.min(100, (mission.progress_value / template.requirement_value) * 100)} 
                      className="h-2"
                    />
                  </div>

                  {index < missions.length - 1 && (
                    <div className="border-b border-border/40" />
                  )}
                </motion.div>
              );
            })
          )}
        </CardContent>
      </Card>

      {/* Rewards Card */}
      {unclaimedRewards.length > 0 && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  Recompensas Disponíveis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {unclaimedRewards.map((reward) => {
                  const mission = missions.find(m => m.id === reward.mission_id);
                  const template = mission?.missions_daily_templates;
                  return (
                    <motion.div
                      key={reward.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 bg-background/50 rounded-lg border border-border/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-full">
                          <Gift className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{template?.title || 'Missão'}</p>
                          <p className="text-sm text-muted-foreground">
                            +{reward.reward_value} {reward.reward_type}
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleCollectReward(reward.mission_id)}
                        disabled={claiming}
                        size="sm"
                      >
                        {claiming ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Coletar"
                        )}
                      </Button>
                    </motion.div>
                  );
                })}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      )}

      {/* All Complete Message */}
      {completedCount === totalMissions && totalMissions > 0 && unclaimedRewards.length === 0 && (
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-green-500/20 rounded-full">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold">Missões Completadas! 🎉</h3>
              <p className="text-sm text-muted-foreground">
                Você completou todas as missões de hoje. Volte amanhã para novas missões!
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
