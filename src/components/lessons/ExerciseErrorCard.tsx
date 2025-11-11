/**
 * 🛡️ COMPONENTE DE ERRO REUTILIZÁVEL PARA EXERCÍCIOS
 * 
 * Exibe mensagem amigável quando um exercício tem dados inválidos.
 */

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExerciseErrorCardProps {
  title?: string;
  message?: string;
  details?: string;
  showAdminLink?: boolean;
}

export function ExerciseErrorCard({
  title = '⚠️ Configuração Inválida',
  message = 'Este exercício não está configurado corretamente.',
  details,
  showAdminLink = true
}: ExerciseErrorCardProps) {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="p-8 text-center bg-orange-50 dark:bg-orange-950/30 border-orange-500 border-2">
        <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
        {details && (
          <div className="mb-6 p-4 bg-orange-100 dark:bg-orange-900/20 rounded-lg text-left">
            <p className="text-sm font-mono text-orange-800 dark:text-orange-200">
              {details}
            </p>
          </div>
        )}
        {showAdminLink && (
          <>
            <p className="text-sm text-muted-foreground mb-4">
              Por favor, re-sincronize esta aula em{' '}
              <code className="bg-muted px-2 py-1 rounded">/admin/sync-lessons</code>
            </p>
            <Button 
              onClick={() => navigate('/admin/sync-lessons')}
              variant="outline"
              className="border-orange-500 text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50"
            >
              Ir para Sincronizar Aulas
            </Button>
          </>
        )}
      </Card>
    </div>
  );
}
