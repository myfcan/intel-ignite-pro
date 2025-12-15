import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Film, Play, Edit, Loader2, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface V7Lesson {
  id: string;
  title: string;
  status: string;
  is_active: boolean;
  created_at: string;
  estimated_time: number | null;
}

export function V7LessonsList() {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<V7Lesson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchLessons = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('lessons')
      .select('id, title, status, is_active, created_at, estimated_time')
      .eq('model', 'v7')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setLessons(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  if (isLoading) {
    return (
      <Card className="border-2 border-cyan-500/20">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-cyan-500" />
        </CardContent>
      </Card>
    );
  }

  if (lessons.length === 0) {
    return (
      <Card className="border-2 border-cyan-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Film className="w-5 h-5 text-cyan-500" />
            Aulas V7 Existentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">Nenhuma aula V7 criada ainda.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-cyan-500/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Film className="w-5 h-5 text-cyan-500" />
          Aulas V7 Existentes ({lessons.length})
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={fetchLessons}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{lesson.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={lesson.is_active ? 'default' : 'secondary'} className="text-xs">
                  {lesson.is_active ? 'Ativa' : lesson.status || 'Rascunho'}
                </Badge>
                {lesson.estimated_time && (
                  <span className="text-xs text-muted-foreground">
                    {Math.floor(lesson.estimated_time / 60)}min
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/admin/v7/preview/${lesson.id}`)}
              >
                <Play className="w-3 h-3 mr-1" />
                Preview
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(`/admin/v7/create?edit=${lesson.id}`)}
              >
                <Edit className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
