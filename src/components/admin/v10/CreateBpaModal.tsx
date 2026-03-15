import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { V10BpaPipeline } from '@/types/v10.types';

interface CreateBpaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (pipeline: V10BpaPipeline) => void;
}

function toKebabCase(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function CreateBpaModal({ open, onOpenChange, onCreated }: CreateBpaModalProps) {
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugEdited, setSlugEdited] = useState(false);
  const [toolName, setToolName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugEdited) {
      setSlug(toKebabCase(value));
    }
  }

  function handleSlugChange(value: string) {
    setSlugEdited(true);
    setSlug(value);
  }

  function resetForm() {
    setTitle('');
    setSlug('');
    setSlugEdited(false);
    setToolName('');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim()) {
      toast.error('O título é obrigatório.');
      return;
    }

    setSubmitting(true);

    const payload = {
      title: title.trim(),
      slug: slug.trim() || toKebabCase(title),
      status: 'draft' as const,
      current_stage: 1,
      score_total: 0,
      score_refero: 0,
      score_docs: 0,
      score_pedagogy: 0,
      score_difficulty: 0,
      score_relevance: 0,
      score_semaphore: 'red' as const,
      steps_generated: 0,
      steps_audited: 0,
      audit_passed: false,
      images_needed: 0,
      images_generated: 0,
      images_approved: 0,
      mockups_total: 0,
      mockups_from_refero: 0,
      mockups_generic: 0,
      mockups_approved: 0,
      audios_total: 0,
      audios_generated: 0,
      audios_approved: 0,
      assembly_checklist: {},
      assembly_passed: false,
      ...(toolName.trim() ? { docs_manual_input: toolName.trim() } : {}),
    };

    const { data, error } = await supabase
      .from('v10_bpa_pipeline')
      .insert(payload)
      .select()
      .single();

    setSubmitting(false);

    if (error) {
      toast.error('Erro ao criar pipeline: ' + error.message);
      return;
    }

    const pipeline = data as unknown as V10BpaPipeline;
    toast.success('Pipeline criado com sucesso!');
    resetForm();
    onOpenChange(false);
    onCreated(pipeline);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Pipeline BPA</DialogTitle>
            <DialogDescription>
              Crie um novo pipeline de produção de aula V10.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="bpa-title">Título *</Label>
              <Input
                id="bpa-title"
                placeholder="Ex: Como usar o Canva"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bpa-slug">Slug</Label>
              <Input
                id="bpa-slug"
                placeholder="como-usar-o-canva"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Gerado automaticamente a partir do título. Editável.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bpa-tool">Ferramenta (opcional)</Label>
              <Input
                id="bpa-tool"
                placeholder="Ex: Canva, Google Sheets..."
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              className="min-h-[44px]"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="min-h-[44px] bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:opacity-90"
              disabled={submitting || !title.trim()}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                'Criar Pipeline'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
