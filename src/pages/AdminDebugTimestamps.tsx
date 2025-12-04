import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Clock, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface LessonData {
  id: string;
  title: string;
  audio_url: string | null;
  content: any;
  word_timestamps: any;
}

export default function AdminDebugTimestamps() {
  const [lessons, setLessons] = useState<LessonData[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, audio_url, content, word_timestamps')
        .order('order_index', { ascending: true });

      if (error) throw error;
      setLessons(data || []);
    } catch (error) {
      console.error('Erro ao buscar aulas:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Debug: Timestamps das Aulas</h1>
            <p className="text-muted-foreground mt-1">
              Visualize os timestamps de cada seção e validação do áudio
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate('/admin/manual')}>
            Voltar ao Admin
          </Button>
        </div>

        <div className="space-y-4">
          {lessons.map((lesson) => {
            const sections = lesson.content?.sections || [];
            const duration = lesson.content?.duration || 0;
            const hasAudio = !!lesson.audio_url;
            const hasWordTimestamps = lesson.word_timestamps && lesson.word_timestamps.length > 0;
            const hasSectionTimestamps = sections.some((s: any) => s.timestamp > 0);

            return (
              <Card key={lesson.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{lesson.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        {hasAudio ? (
                          <Badge variant="default" className="gap-1">
                            <Music className="w-3 h-3" />
                            Áudio OK
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            Sem áudio
                          </Badge>
                        )}
                        
                        {hasWordTimestamps ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Word Timestamps: {lesson.word_timestamps.length}
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            Sem Word Timestamps
                          </Badge>
                        )}

                        {hasSectionTimestamps ? (
                          <Badge variant="default" className="gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            Section Timestamps OK
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <XCircle className="w-3 h-3" />
                            Sem Section Timestamps
                          </Badge>
                        )}

                        {duration > 0 && (
                          <Badge variant="outline" className="gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(duration)}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/lessons-interactive/${lesson.id}`)}
                    >
                      Ver Aula
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {sections.length > 0 ? (
                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm text-muted-foreground">
                        Seções ({sections.length}):
                      </h4>
                      <div className="grid gap-2">
                        {sections.map((section: any, index: number) => (
                          <div
                            key={section.id || index}
                            className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <Badge variant="outline">
                                Seção {index + 1}
                              </Badge>
                              <span className="text-sm font-medium">
                                {section.id || 'sem-id'}
                              </span>
                              {section.type && (
                                <Badge variant="secondary" className="text-xs">
                                  {section.type}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {section.timestamp !== undefined && section.timestamp !== null ? (
                                section.timestamp > 0 ? (
                                  <Badge className="gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatDuration(section.timestamp)}
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="gap-1">
                                    <XCircle className="w-3 h-3" />
                                    0:00
                                  </Badge>
                                )
                              ) : (
                                <Badge variant="secondary" className="gap-1">
                                  <XCircle className="w-3 h-3" />
                                  Sem timestamp
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma seção encontrada</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
