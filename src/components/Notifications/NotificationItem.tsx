import { formatDistanceToNow } from 'date-fns';
import { MessageCircle, Package, AlertCircle, MapPin, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const getIcon = () => {
    switch (notification.type) {
      case 'message':
        return <MessageCircle className="h-5 w-5 text-blue-500" />;
      case 'food_claimed':
        return <Package className="h-5 w-5 text-green-500" />;
      case 'new_nearby':
        return <MapPin className="h-5 w-5 text-primary" />;
      case 'expiring_soon':
        return <Clock className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    // Navigate based on type
    if (notification.link) {
      window.location.href = notification.link;
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
        !notification.read && "bg-muted/30"
      )}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <p className="font-medium text-sm">{notification.title}</p>
            {!notification.read && (
              <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
            )}
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-1">
            {notification.description}
          </p>
          
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
