import { CheckCircle, XCircle, Circle, Loader2 } from 'lucide-react';
import { Checkpoint } from '@/hooks/useAutomatedLessonTest';

interface TestCheckpointProps {
  checkpoint: Checkpoint;
}

export const TestCheckpoint = ({ checkpoint }: TestCheckpointProps) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors">
      <div className="mt-0.5">
        {checkpoint.status === 'passed' && (
          <CheckCircle className="w-5 h-5 text-green-500" />
        )}
        {checkpoint.status === 'failed' && (
          <XCircle className="w-5 h-5 text-red-500" />
        )}
        {checkpoint.status === 'running' && (
          <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
        )}
        {checkpoint.status === 'pending' && (
          <Circle className="w-5 h-5 text-muted-foreground/30" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-medium ${
            checkpoint.status === 'passed' ? 'text-green-700 dark:text-green-400' :
            checkpoint.status === 'failed' ? 'text-red-700 dark:text-red-400' :
            checkpoint.status === 'running' ? 'text-blue-700 dark:text-blue-400' :
            'text-muted-foreground'
          }`}>
            {checkpoint.name}
          </span>
          
          {checkpoint.duration && (
            <span className="text-xs text-muted-foreground font-mono">
              {checkpoint.duration}ms
            </span>
          )}
        </div>

        {checkpoint.message && (
          <p className="text-sm text-muted-foreground mt-1">
            {checkpoint.message}
          </p>
        )}

        {checkpoint.details && (
          <p className="text-xs text-muted-foreground/70 mt-1 font-mono">
            {checkpoint.details}
          </p>
        )}
      </div>
    </div>
  );
};
