// V7 Cinematic Demo - New phase-based player
import { useNavigate } from "react-router-dom";
import { V7PhasePlayer } from "@/components/lessons/v7/cinematic/V7PhasePlayer";
import { fimDaBrincadeiraScript } from "@/data/v7LessonScripts/fimDaBrincadeiraScript";
import { toast } from "sonner";

const V7CinematicDemo = () => {
  const navigate = useNavigate();

  const handleComplete = () => {
    toast.success("🎬 Experiência V7 Cinematic concluída!");
    setTimeout(() => navigate('/'), 2000);
  };

  return (
    <V7PhasePlayer
      script={fimDaBrincadeiraScript}
      onComplete={handleComplete}
    />
  );
};

export default V7CinematicDemo;
