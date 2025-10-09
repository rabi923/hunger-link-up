import { useState, useRef, useEffect } from 'react';
import { X, Phone, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/useChat';
import { useRealtimeMessages } from '@/hooks/useRealtimeMessages';
import MessageBubble from './MessageBubble';
import MessageInput from './MessageInput';
import TypingIndicator from './TypingIndicator';
import QuickReplies from './QuickReplies';

interface ChatModalProps {
  otherUserId: string;
  otherUserName: string;
  otherUserPhone?: string;
  onClose: () => void;
}

const ChatModal = ({ otherUserId, otherUserName, otherUserPhone, onClose }: ChatModalProps) => {
  const { conversationId, currentUserId, sendMessage } = useChat(otherUserId);
  const { messages, loading } = useRealtimeMessages(conversationId);
  const [messageText, setMessageText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!messageText.trim()) return;
    
    const success = await sendMessage(messageText);
    if (success) {
      setMessageText('');
    }
  };

  const handleQuickReply = async (text: string) => {
    await sendMessage(text);
  };

  const openPhone = () => {
    if (otherUserPhone) {
      window.location.href = `tel:${otherUserPhone}`;
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-[9999] flex flex-col">
      {/* Header */}
      <div className="h-16 border-b flex items-center px-4 gap-3 bg-background shadow-sm">
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{otherUserName}</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-xs text-muted-foreground">Online</span>
          </div>
        </div>
        
        {otherUserPhone && (
          <Button
            size="icon"
            variant="ghost"
            onClick={openPhone}
          >
            <Phone className="h-5 w-5" />
          </Button>
        )}
        
        <Button
          size="icon"
          variant="ghost"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="text-6xl mb-4">💬</div>
            <h3 className="text-lg font-semibold mb-2">Start the conversation</h3>
            <p className="text-muted-foreground">
              Send a message to {otherUserName}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={message.sender_id === currentUserId}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Quick Replies */}
      <QuickReplies onSelect={handleQuickReply} />

      {/* Input */}
      <MessageInput
        value={messageText}
        onChange={setMessageText}
        onSend={handleSend}
        disabled={!conversationId}
      />
    </div>
  );
};

export default ChatModal;
