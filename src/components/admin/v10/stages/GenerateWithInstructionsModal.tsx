import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2 } from 'lucide-react';

interface GenerateWithInstructionsModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (instructions: string) => Promise<void>;
  isLoading: boolean;
}

export function GenerateWithInstructionsModal({
  open,
  onClose,
  onGenerate,
  isLoading,
}: GenerateWithInstructionsModalProps) {
  const [instructions, setInstructions] = useState('');

  const handleGenerate = async () => {
    if (!instructions.trim()) return;
    await onGenerate(instructions);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Gerar Aula com IA
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div>
            <Label className="text-sm font-medium">
              Instruções para a IA
            </Label>
            <p className="text-xs text-muted-foreground mt-1 mb-2">
              Cole aqui as instruções detalhadas: ferramentas, passos, cores, campos, warnings.
              Quanto mais detalhado, melhor o resultado.
            </p>
            <Textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder={`INSTRUÇÕES OBRIGATÓRIAS PARA GERAR ESTA AULA:

AULA: Nome da aula
FERRAMENTAS: Ferramenta1, Ferramenta2
NÃO USE: ...

FASE 1 — ...
  Passo 1: ...
  Passo 2: ...`}
              className="min-h-[300px] font-mono text-sm"
              maxLength={15000}
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {instructions.length} / 15.000 caracteres
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={!instructions.trim() || isLoading}
              className="bg-indigo-500 hover:bg-indigo-600"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando passos...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Gerar Passos
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
