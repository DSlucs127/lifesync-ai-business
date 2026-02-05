
import { useEffect, useRef } from 'react';
import { CalendarEvent } from '../types';

export const useNotifications = (events: CalendarEvent[]) => {
  const processedEvents = useRef<Set<string>>(new Set());

  // Solicitar permissão ao montar
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Verificar eventos a cada minuto
  useEffect(() => {
    const checkEvents = () => {
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      
      events.forEach(event => {
        const eventStart = new Date(event.date);
        const reminders = event.reminders || [10]; // Default 10 min if undefined

        reminders.forEach(minutes => {
            // Calculate alert time
            const alertTime = new Date(eventStart.getTime() - minutes * 60000);
            
            // Check if alert time is within the last minute (to avoid spamming past events)
            // and hasn't been processed yet for this specific reminder slot
            const timeDiff = Math.abs(now.getTime() - alertTime.getTime());
            const uniqueId = `${event.id}_${minutes}`;

            if (timeDiff < 60000 && !processedEvents.current.has(uniqueId)) {
                // Trigger Notification
                new Notification(`LifeSync: ${event.title}`, {
                    body: minutes === 0 ? "Começa agora!" : `Começa em ${minutes} minutos.`,
                    icon: '/icon.png', // Fallback to manifest icon logic
                });
                
                // Play a gentle sound
                try {
                   const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                   audio.volume = 0.5;
                   audio.play();
                } catch(e) {
                    // Ignore audio errors (interaction policy)
                }

                processedEvents.current.add(uniqueId);
            }
        });
      });
    };

    const interval = setInterval(checkEvents, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, [events]);
};
