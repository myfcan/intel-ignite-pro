import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useNotifications } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';

export function NotificationPrompt() {
  const [show, setShow] = useState(false);
  const { permission, requestPermission, isSupported, sendTestNotification } = useNotifications();
  const { toast } = useToast();

  useEffect(() => {
    // Show prompt after 5 seconds if notifications are supported and not yet decided
    const timer = setTimeout(() => {
      if (isSupported && permission === 'default') {
        setShow(true);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [isSupported, permission]);

  const handleEnable = async () => {
    const result = await requestPermission();
    
    if (result === 'granted') {
      toast({
        title: '🎉 Notificações ativadas!',
        description: 'Você será avisado quando novas missões diárias estiverem disponíveis.',
      });
      sendTestNotification();
      setShow(false);
    } else if (result === 'denied') {
      toast({
        title: 'Notificações bloqueadas',
        description: 'Você pode ativar nas configurações do navegador.',
        variant: 'destructive',
      });
      setShow(false);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    // Store dismissal in localStorage to not show again for a while
    localStorage.setItem('notification-prompt-dismissed', Date.now().toString());
  };

  if (!show || !isSupported || permission !== 'default') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="bg-white shadow-2xl border-2 border-cyan-200">
        <div className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-slate-900 mb-1">
                Receba avisos de novas missões
              </h3>
              <p className="text-xs text-slate-600 mb-3">
                Seja notificado quando novas missões diárias estiverem disponíveis
              </p>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleEnable}
                  size="sm"
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white flex-1"
                >
                  Ativar avisos
                </Button>
                <Button
                  onClick={handleDismiss}
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0"
                >
                  Agora não
                </Button>
              </div>
            </div>
            
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </Card>
    </div>
  );
}
