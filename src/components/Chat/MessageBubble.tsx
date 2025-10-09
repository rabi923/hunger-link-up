import { Check, CheckCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Message } from '@/hooks/useRealtimeMessages';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else if (diffInHours < 48) {
      return `Yesterday, ${date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    }
  };

  return (
    <div className={cn(
      "flex gap-2 max-w-[80%]",
      isOwn ? "ml-auto flex-row-reverse" : "mr-auto"
    )}>
      <div className={cn(
        "rounded-2xl px-4 py-2 break-words",
        isOwn 
          ? "bg-primary text-primary-foreground rounded-br-sm" 
          : "bg-muted text-foreground rounded-bl-sm"
      )}>
        {!isOwn && message.sender && (
          <p className="text-xs font-semibold mb-1 opacity-70">
            {message.sender.full_name}
          </p>
        )}
        <p className="text-sm whitespace-pre-wrap">{message.message_text}</p>
        <div className={cn(
          "flex items-center gap-1 mt-1 text-xs",
          isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
        )}>
          <span>{formatTime(message.created_at)}</span>
          {isOwn && (
            message.read_at ? (
              <CheckCheck className="h-3 w-3" />
            ) : (
              <Check className="h-3 w-3" />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
