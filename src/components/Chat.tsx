import { useEffect, useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Send } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Message = Database['public']['Tables']['messages']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface ChatProps {
  matchId: string;
  otherUser: Profile;
}

export function Chat({ matchId, otherUser }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('match_id', matchId)
        .order('sent_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      setMessages(data);
      setLoading(false);
    };

    fetchMessages();

    const subscription = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `match_id=eq.${matchId}`,
        },
        (payload) => {
          setMessages((current) => [...current, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('messages').insert({
      match_id: matchId,
      sender_id: user.id,
      content: newMessage.trim(),
    });

    if (error) {
      console.error('Error sending message:', error);
      return;
    }

    setNewMessage('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.sender_id === otherUser.id ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-xs md:max-w-md px-4 py-2 rounded-lg ${
                message.sender_id === otherUser.id
                  ? 'bg-white shadow-sm'
                  : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-sm'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-6 py-3 border rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 bg-gray-50"
          />
          <button
            type="submit"
            className="p-3 text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-full hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 shadow-lg hover:shadow-xl transform hover:scale-[1.05] transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}