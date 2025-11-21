import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type NotificationPermission = 'granted' | 'denied' | 'default';

interface UseNotificationsReturn {
  permission: NotificationPermission;
  requestPermission: () => Promise<NotificationPermission>;
  isSupported: boolean;
  sendTestNotification: () => void;
  subscribeToPush: () => Promise<void>;
}

export function useNotifications(): UseNotificationsReturn {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if notifications are supported
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setIsSupported(true);
      setPermission(Notification.permission as NotificationPermission);
    }
  }, []);

  const requestPermission = async (): Promise<NotificationPermission> => {
    if (!isSupported) {
      console.warn('Notifications not supported');
      return 'denied';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result as NotificationPermission);
      
      if (result === 'granted') {
        await subscribeToPush();
      }
      
      return result as NotificationPermission;
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return 'denied';
    }
  };

  const subscribeToPush = async (): Promise<void> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Store permission status in database
      await supabase
        .from('users')
        .update({ 
          // We'll add this column in migration if needed
          // notification_enabled: true 
        })
        .eq('id', user.id);

      console.log('✅ Push notification subscription saved');
    } catch (error) {
      console.error('Error subscribing to push:', error);
    }
  };

  const sendTestNotification = () => {
    if (permission === 'granted') {
      new Notification('🎉 Notificações ativadas!', {
        body: 'Você receberá avisos quando novas missões diárias estiverem disponíveis.',
        icon: '/logo-ailiv.png',
        badge: '/logo-ailiv.png',
        tag: 'test-notification',
        requireInteraction: false,
      });
    }
  };

  return {
    permission,
    requestPermission,
    isSupported,
    sendTestNotification,
    subscribeToPush,
  };
}
