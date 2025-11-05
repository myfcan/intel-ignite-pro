import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, RotateCw, Save, Sparkles, Zap } from "lucide-react";

interface PlaygroundComponentProps {
  lessonId: string;
  userId: string;
  title?: string;
  description?: string;
  fields?: {
    name: string;
    label: string;
    type: "text" | "textarea" | "select";
    options?: string[];
    placeholder?: string;
  }[];
}

export const PlaygroundComponent = ({
  lessonId,
  userId,
  title = "Playground: Teste Agora",
  description = "Agora é sua vez! Use a IA para criar algo prático.",
  fields = [
    { name: "context", label: "Contexto", type: "textarea", placeholder: "Ex: Preciso escrever um email..." },
    { name: "tone", label: "Tom", type: "select", options: ["Formal", "Amigável", "Urgente"] },
  ],
}: PlaygroundComponentProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [interactionsRemaining, setInteractionsRemaining] = useState<number | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Build prompt from form data
      const prompt = Object.entries(formData)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

      const { data, error } = await supabase.functions.invoke("claude-interact", {
        body: {
          lesson_id: lessonId,
          message: prompt,
          context_type: "playground",
        },
      });

      if (error) throw error;

      if (data.limit_reached) {
        toast({
          title: "Limite diário atingido",
          description: `Você usou todas as suas ${data.limit} interações hoje. Volte amanhã!`,
          variant: "destructive",
        });
        return;
      }

      setResponse(data.response);
      setInteractionsRemaining(data.remaining);

      toast({
        title: "Gerado com sucesso!",
        description: data.cached ? "Resposta obtida do cache" : "Nova resposta gerada",
      });
    } catch (error: any) {
      console.error("Error generating:", error);
      toast({
        title: "Erro ao gerar",
        description: error.message || "Tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(response);
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    });
  };

  const handleReset = () => {
    setFormData({});
    setResponse("");
  };

  const handleSaveTemplate = async () => {
    try {
      const templateTitle = formData.context?.substring(0, 50) || "Meu Template";
      
      const { error } = await supabase.from("saved_templates").insert({
        user_id: userId,
        title: templateTitle,
        category: "playground",
        prompt_text: response,
      });

      if (error) throw error;

      toast({
        title: "Template salvo!",
        description: "Você pode acessá-lo na biblioteca de templates",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isFormValid = fields.every((field) => formData[field.name]);

  return (
    <Card className="p-6 space-y-6 border-2 border-accent/20 bg-gradient-to-br from-accent/5 to-primary/5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-accent to-primary rounded-lg flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      {interactionsRemaining !== null && (
        <div className="flex items-center gap-2 p-3 bg-primary/10 rounded-lg">
          <Zap className="w-4 h-4 text-primary" />
          <p className="text-sm font-medium">
            {interactionsRemaining} interações restantes hoje
          </p>
        </div>
      )}

      <div className="space-y-4">
        {fields.map((field) => (
          <div key={field.name} className="space-y-2">
            <Label htmlFor={field.name} className="text-base">
              {field.label}
            </Label>
            {field.type === "textarea" ? (
              <Textarea
                id={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field.name]: e.target.value })
                }
                className="min-h-[100px] text-base"
              />
            ) : field.type === "select" ? (
              <div className="flex gap-2">
                {field.options?.map((option) => (
                  <Button
                    key={option}
                    type="button"
                    variant={formData[field.name] === option ? "default" : "outline"}
                    onClick={() => setFormData({ ...formData, [field.name]: option })}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <Input
                id={field.name}
                placeholder={field.placeholder}
                value={formData[field.name] || ""}
                onChange={(e) =>
                  setFormData({ ...formData, [field.name]: e.target.value })
                }
                className="text-base"
              />
            )}
          </div>
        ))}
      </div>

      <Button
        onClick={handleGenerate}
        disabled={!isFormValid || loading}
        className="w-full h-12 text-base"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Gerando...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-5 w-5" />
            Gerar com IA
          </>
        )}
      </Button>

      {response && (
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-background rounded-lg border-2 border-success/20">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-success">✨ Resultado Gerado</h4>
            </div>
            <div className="prose prose-sm max-w-none">
              <p className="text-base leading-relaxed whitespace-pre-wrap">{response}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={handleCopy} variant="outline" size="sm">
              <Copy className="mr-2 h-4 w-4" />
              Copiar
            </Button>
            <Button onClick={handleReset} variant="outline" size="sm">
              <RotateCw className="mr-2 h-4 w-4" />
              Refazer
            </Button>
            <Button onClick={handleSaveTemplate} variant="outline" size="sm">
              <Save className="mr-2 h-4 w-4" />
              Salvar Template
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};