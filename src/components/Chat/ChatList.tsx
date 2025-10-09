import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Heart } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import ChatModal from './ChatModal';

type Conversation = {
  id: string;
  user1_id: string;
  user2_id: string;
  last_message_at: string;
  otherUser: {
    id: string;
    full_name: string;
    profile_picture_url: string | null;
    phone: string | null;
  };
  lastMessage?: {
    message_text: string;
    sender_id: string;
  };
  unreadCount: number;
};

const ChatList = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] = useState<Conversation | null>(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setCurrentUserId(user.id);

      const { data: convos, error } = await supabase
        .from('conversations')
        .select(`
          *,
          user1:profiles!user1_id(id, full_name, profile_picture_url, phone),
          user2:profiles!user2_id(id, full_name, profile_picture_url, phone)
        `)
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      // Get last message and unread count for each conversation
      const conversationsWithDetails = await Promise.all(
        (convos || []).map(async (convo) => {
          const otherUser = convo.user1_id === user.id ? convo.user2 : convo.user1;
          
          // Get last message
          const { data: lastMsg } = await supabase
            .from('messages')
            .select('message_text, sender_id')
            .eq('conversation_id', convo.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Get unread count
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', convo.id)
            .neq('sender_id', user.id)
            .is('read_at', null);

          return {
            id: convo.id,
            user1_id: convo.user1_id,
            user2_id: convo.user2_id,
            last_message_at: convo.last_message_at,
            otherUser,
            lastMessage: lastMsg || undefined,
            unreadCount: count || 0
          };
        })
      );

      setConversations(conversationsWithDetails);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageCircle className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No messages yet</h3>
        <p className="text-muted-foreground">
          Start chatting with food givers or receivers near you!
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="h-full overflow-y-auto pb-20">
        <div className="p-4 space-y-2">
          {conversations.map((convo) => (
            <Card 
              key={convo.id}
              className="cursor-pointer hover:shadow-[var(--shadow-card)] transition-shadow"
              onClick={() => setSelectedChat(convo)}
            >
              <CardContent className="p-4">
                <div className="flex gap-3">
                  {convo.otherUser.profile_picture_url ? (
                    <img
                      src={convo.otherUser.profile_picture_url}
                      alt={convo.otherUser.full_name}
                      className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <Heart className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold truncate">{convo.otherUser.full_name}</h3>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(convo.last_message_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-muted-foreground truncate">
                        {convo.lastMessage?.sender_id === currentUserId && 'You: '}
                        {convo.lastMessage?.message_text || 'No messages yet'}
                      </p>
                      {convo.unreadCount > 0 && (
                        <Badge variant="destructive" className="flex-shrink-0">
                          {convo.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {selectedChat && (
        <ChatModal
          otherUserId={selectedChat.otherUser.id}
          otherUserName={selectedChat.otherUser.full_name}
          otherUserPhone={selectedChat.otherUser.phone || undefined}
          onClose={() => {
            setSelectedChat(null);
            fetchConversations(); // Refresh conversations
          }}
        />
      )}
    </>
  );
};

export default ChatList;
