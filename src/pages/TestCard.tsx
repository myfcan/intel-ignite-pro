import { IaBookExperienceCard } from "@/components/lessons/IaBookExperienceCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function TestCard() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate("/admin")}
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar ao Admin
        </Button>
        
        <IaBookExperienceCard />
      </div>
    </div>
  );
}
