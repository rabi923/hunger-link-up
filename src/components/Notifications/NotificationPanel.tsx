import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import NotificationItem from './NotificationItem';
import type { Notification } from '@/hooks/useNotifications';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
}

const NotificationPanel = ({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll
}: NotificationPanelProps) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40" 
        onClick={onClose}
      />
      
      {/* Panel */}
      <Card className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] z-50 shadow-[var(--shadow-card)]">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Notifications</h3>
          <div className="flex gap-2">
            {notifications.length > 0 && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMarkAllAsRead}
                  className="text-xs"
                >
                  Mark all read
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearAll}
                  className="text-xs text-destructive"
                >
                  Clear all
                </Button>
              </>
            )}
          </div>
        </div>

        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={onMarkAsRead}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </Card>
    </>
  );
};

export default NotificationPanel;
