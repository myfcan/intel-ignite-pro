// src/pages/AdminAudioPreview.tsx
// Sandbox para testar audio tags emocionais do ElevenLabs eleven_v3
// Permite digitar texto com [tags], escolher voz e reproduzir diretamente

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Play, Square, Loader2, Mic, Zap, Volume2, Copy, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// ─── Vozes disponíveis ─────────────────────────────────────────────────────────
const VOICES = [
  { id: 'oqUwsXKac3MSo4E51ySV', name: 'Taciana (BR Padrão)', flag: '🇧🇷' },
  { id: 'EXAVITQu4vr4xnSDxMaL', name: 'Sarah', flag: '🇺🇸' },
  { id: 'JBFqnCBsd6RMkjVDRZzb', name: 'George', flag: '🇬🇧' },
  { id: 'TX3LPaxmHKxFdv7VOQHJ', name: 'Liam', flag: '🇺🇸' },
  { id: 'nPczCjzI2devNBz1zQrb', name: 'Brian', flag: '🇺🇸' },
  { id: 'FGY2WhTYpPnrIDTdsKH5', name: 'Laura', flag: '🇺🇸' },
  { id: 'pFZP5JQG7iQjIQuC4Bku', name: 'Lily', flag: '🇬🇧' },
  { id: 'onwK4e9ZLuTAKqWW03F9', name: 'Daniel', flag: '🇬🇧' },
];

// ─── Exemplos de audio tags por categoria ────────────────────────────────────
const TAG_CATEGORIES = [
  {
    name: 'Emoções',
    color: 'bg-violet-500/10 text-violet-700 border-violet-300',
    tags: ['excited', 'calm', 'nervous', 'frustrated', 'serious', 'cheerful', 'hopeful', 'reflective', 'empathetic', 'dramatic tone'],
  },
  {
    name: 'Sons Físicos',
    color: 'bg-amber-500/10 text-amber-700 border-amber-300',
    tags: ['sigh', 'laughs', 'whispers', 'gasps', 'clears throat'],
  },
  {
    name: 'Ritmo/Pacing',
    color: 'bg-cyan-500/10 text-cyan-700 border-cyan-300',
    tags: ['pause', 'long pause', 'rushed', 'slows down', 'hesitates'],
  },
];

// ─── Scripts de exemplo ───────────────────────────────────────────────────────
const EXAMPLE_SCRIPTS = [
  {
    label: '🎭 Dramático',
    text: '[calm] Você sabia que a Inteligência Artificial já está em todo lugar? [pause] Nos seus bolsos. Na sua casa. No seu trabalho. [dramatic tone] E a grande maioria das pessoas... ainda não percebeu. [sigh] Mas hoje isso vai mudar.',
  },
  {
    label: '🔥 Motivacional',
    text: '[excited] Bem-vindo ao AIliv! [pause] Hoje você vai aprender algo que vai transformar sua vida profissional. [hopeful] Com as ferramentas certas, qualquer pessoa pode gerar renda extra com Inteligência Artificial. [slows down] Qualquer. Pessoa. Mesmo.',
  },
  {
    label: '🤫 Suspense',
    text: 'Existe um segredo que os especialistas em IA não costumam contar. [pause] [whispers] É mais simples do que parece. [laughs] E hoje, você vai descobrir exatamente o que é.',
  },
  {
    label: '📚 Educacional',
    text: '[serious] Vamos falar sobre um conceito fundamental: o prompt. [pause] Um prompt é, essencialmente, a instrução que você dá para a IA. [reflective] Pense nisso como uma conversa. [calm] Quanto mais claro você for, melhores serão os resultados.',
  },
];

export default function AdminAudioPreview() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [text, setText] = useState(EXAMPLE_SCRIPTS[0].text);
  const [voiceId, setVoiceId] = useState(VOICES[0].id);
  const [speed, setSpeed] = useState(1.0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ duration: number; words: number; tags: string[] } | null>(null);
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  // Detectar tags no texto atual
  const detectedTags = [...(text.match(/\[([^\]]{1,30})\]/g) || [])].map(t => t.slice(1, -1));

  const insertTag = (tag: string) => {
    const tagStr = `[${tag}] `;
    setText(prev => prev + tagStr);
  };

  const copyTag = (tag: string) => {
    navigator.clipboard.writeText(`[${tag}]`);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 1500);
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
  };

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({ title: 'Texto vazio', description: 'Digite algo para gerar o áudio', variant: 'destructive' });
      return;
    }

    stopAudio();
    setIsGenerating(true);
    setAudioUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-audio-with-timestamps', {
        body: {
          text,
          voice_id: voiceId,
          speed,
          use_emotion_tags: true, // sempre eleven_v3 neste sandbox
        },
      });

      if (error) throw error;
      if (!data?.audio_base64) throw new Error('Nenhum áudio retornado');

      // Converter base64 → blob → URL
      const binaryStr = atob(data.audio_base64);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
      }
      const blob = new Blob([bytes], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);
      setAudioUrl(url);

      // Estatísticas
      const tags = [...(text.match(/\[([^\]]{1,30})\]/g) || [])].map(t => t.slice(1, -1));
      setLastResult({
        duration: data.word_timestamps?.[data.word_timestamps.length - 1]?.end_time ?? 0,
        words: data.word_timestamps?.length ?? 0,
        tags,
      });

      // Auto-play
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.playbackRate = 1.0;
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();

    } catch (err: any) {
      toast({
        title: 'Erro ao gerar áudio',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePlayPause = async () => {
    if (!audioUrl) return;
    if (isPlaying) {
      stopAudio();
    } else {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      audio.onplay = () => setIsPlaying(true);
      audio.onended = () => setIsPlaying(false);
      audio.onerror = () => setIsPlaying(false);
      await audio.play();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={() => navigate('/admin')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
        </div>

        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Mic className="w-8 h-8 text-violet-500" />
            Audio Tags Sandbox
          </h1>
          <p className="text-muted-foreground text-sm">
            Teste audio tags emocionais do <Badge className="bg-violet-600 text-white text-xs">eleven_v3</Badge> em tempo real — sem rodar o pipeline completo.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5">

          {/* ── COLUNA PRINCIPAL ── */}
          <div className="space-y-4">

            {/* Scripts de Exemplo */}
            <Card className="border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Scripts de Exemplo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLE_SCRIPTS.map((ex) => (
                    <Button
                      key={ex.label}
                      variant="outline"
                      size="sm"
                      className="text-xs h-7"
                      onClick={() => setText(ex.text)}
                    >
                      {ex.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Textarea */}
            <Card className="border-2 border-violet-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Texto com Audio Tags</span>
                  <div className="flex items-center gap-2">
                    {detectedTags.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        🎭 {detectedTags.length} tag{detectedTags.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">{text.length} chars</span>
                  </div>
                </CardTitle>
                <CardDescription className="text-xs">
                  Use <code className="bg-muted px-1 rounded">[excited]</code>, <code className="bg-muted px-1 rounded">[pause]</code>, <code className="bg-muted px-1 rounded">[whispers]</code> antes de palavras ou frases
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={8}
                  className="font-mono text-sm resize-none"
                  placeholder="[excited] Digite seu texto com audio tags aqui..."
                />
              </CardContent>
            </Card>

            {/* Configurações de Voz */}
            <Card className="border-cyan-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Configurações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Voz */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">Voz</Label>
                    <Select value={voiceId} onValueChange={setVoiceId}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VOICES.map((v) => (
                          <SelectItem key={v.id} value={v.id}>
                            {v.flag} {v.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Speed */}
                  <div className="space-y-1.5">
                    <Label className="text-xs">
                      Velocidade: <span className="font-bold text-foreground">{speed.toFixed(1)}x</span>
                    </Label>
                    <Slider
                      min={0.7}
                      max={1.2}
                      step={0.05}
                      value={[speed]}
                      onValueChange={([v]) => setSpeed(v)}
                      className="mt-2"
                    />
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>0.7x (lento)</span>
                      <span>1.2x (rápido)</span>
                    </div>
                  </div>
                </div>

                {/* Modelo badge */}
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-violet-500/5 border border-violet-500/20">
                  <Zap className="w-4 h-4 text-violet-500 flex-shrink-0" />
                  <div className="text-xs">
                    <span className="font-semibold text-violet-700">eleven_v3 (alpha)</span>
                    <span className="text-muted-foreground ml-1">— único modelo que suporta audio tags emocionais</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Botões de ação */}
            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !text.trim()}
                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Gerando com eleven_v3...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Gerar e Reproduzir Áudio
                  </>
                )}
              </Button>

              {audioUrl && (
                <Button
                  onClick={handlePlayPause}
                  variant="outline"
                  size="lg"
                  className="gap-2"
                >
                  {isPlaying ? (
                    <><Square className="w-4 h-4" /> Parar</>
                  ) : (
                    <><Volume2 className="w-4 h-4" /> Replay</>
                  )}
                </Button>
              )}
            </div>

            {/* Resultado */}
            {lastResult && (
              <Card className="border-green-500/30 bg-green-500/5">
                <CardContent className="pt-4 pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-700">Áudio gerado com sucesso</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">⏱ {lastResult.duration.toFixed(1)}s</Badge>
                    <Badge variant="outline" className="text-xs">📝 {lastResult.words} palavras</Badge>
                    {lastResult.tags.length > 0 && (
                      <Badge variant="outline" className="text-xs text-violet-600 border-violet-300">
                        🎭 {lastResult.tags.length} tag{lastResult.tags.length > 1 ? 's' : ''} aplicada{lastResult.tags.length > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                  {lastResult.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {lastResult.tags.map((tag, i) => (
                        <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-violet-100 text-violet-700 font-mono">
                          [{tag}]
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* ── SIDEBAR: Referência de Tags ── */}
          <div className="space-y-4">
            <Card className="border-violet-500/20 sticky top-4">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Mic className="w-4 h-4 text-violet-500" />
                  Referência de Tags
                </CardTitle>
                <CardDescription className="text-xs">
                  Clique para inserir no texto ou copiar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {TAG_CATEGORIES.map((cat) => (
                  <div key={cat.name}>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">
                      {cat.name}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.tags.map((tag) => (
                        <div key={tag} className="flex items-center gap-0.5">
                          <button
                            onClick={() => insertTag(tag)}
                            className={`text-[11px] px-2 py-0.5 rounded-l border font-mono hover:opacity-80 transition-opacity ${cat.color}`}
                            title="Inserir no texto"
                          >
                            [{tag}]
                          </button>
                          <button
                            onClick={() => copyTag(tag)}
                            className={`text-[10px] px-1.5 py-0.5 rounded-r border-y border-r font-mono hover:opacity-80 transition-opacity ${cat.color}`}
                            title="Copiar tag"
                          >
                            {copiedTag === tag ? <CheckCircle2 className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {/* Dica */}
                <div className="mt-3 p-2.5 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-700 space-y-1">
                  <p className="font-semibold">💡 Boas práticas:</p>
                  <p>• Coloque a tag <strong>antes</strong> da frase afetada</p>
                  <p>• Use <code>[pause]</code> para pausas curtas</p>
                  <p>• Use <code>[long pause]</code> para suspense</p>
                  <p>• Não combine tags conflitantes (ex: <code>[excited]</code> + <code>[calm]</code>)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
