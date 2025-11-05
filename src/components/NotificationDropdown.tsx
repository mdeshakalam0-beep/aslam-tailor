import React, { useState, useEffect, useRef } from 'react';
import { Bell, XCircle, CheckCircle2 } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSession } from '@/components/SessionContextProvider';
import { getNotifications, markNotificationAsRead, Notification } from '@/utils/notifications';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

// Path to your notification sound file in the public folder
const NOTIFICATION_SOUND_PATH = '/notification.mp3'; 

const NotificationDropdown: React.FC = () => {
  const { session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fetchAndSetNotifications = async () => {
    if (session?.user) {
      const fetched = await getNotifications(session.user.id);
      setNotifications(fetched);
      setUnreadCount(fetched.filter(n => !n.is_read).length);
    } else {
      // For non-logged-in users, only show general notifications
      const fetched = await getNotifications(null);
      setNotifications(fetched);
      setUnreadCount(fetched.filter(n => !n.is_read).length);
    }
  };

  useEffect(() => {
    fetchAndSetNotifications();

    // Setup Supabase Realtime subscription
    const channel = supabase
      .channel('public:notifications')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'notifications',
        // No filter here, we'll filter in the callback
      }, (payload) => {
        // Filter client-side for user-specific or general notifications
        if (payload.new?.user_id === null || payload.new?.user_id === session?.user?.id) {
          console.log('Realtime notification received:', payload);
          fetchAndSetNotifications(); // Re-fetch all notifications
          if (payload.eventType === 'INSERT' && !payload.new?.is_read) {
            // Play sound only for new, unread notifications
            audioRef.current?.play();
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markNotificationAsRead(notificationId);
    if (success) {
      setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer" />
          {unreadCount > 0 && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <DropdownMenuItem className="text-muted-foreground">No new notifications.</DropdownMenuItem>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <DropdownMenuItem key={notification.id} className="flex flex-col items-start space-y-1 p-2">
                <div className="flex justify-between w-full">
                  <p className={`text-sm ${notification.is_read ? 'text-muted-foreground' : 'font-medium text-foreground'}`}>
                    {notification.message}
                  </p>
                  {!notification.is_read && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-primary" onClick={() => handleMarkAsRead(notification.id)}>
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </span>
                <DropdownMenuSeparator className="w-full" />
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
      <audio ref={audioRef} src={NOTIFICATION_SOUND_PATH} preload="auto" />
    </DropdownMenu>
  );
};

export default NotificationDropdown;