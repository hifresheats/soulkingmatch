import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { MessageSquare } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Match = Database['public']['Tables']['matches']['Row'] & {
  profiles: Database['public']['Tables']['profiles']['Row'];
  last_message?: Database['public']['Tables']['messages']['Row'];
};

export function ChatList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          profiles:user2_id(*)
        `)
        .eq('status', 'matched')
        .eq('user1_id', user.id)
        .order('matched_at', { ascending: false });

      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }

      // Fetch last message for each match
      const matchesWithMessages = await Promise.all(
        data.map(async (match) => {
          const { data: messages } = await supabase
            .from('messages')
            .select('*')
            .eq('match_id', match.id)
            .order('sent_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...match,
            last_message: messages,
          };
        })
      );

      setMatches(matchesWithMessages);
      setLoading(false);
    };

    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-500">
        <MessageSquare className="w-12 h-12 mb-4" />
        <p>No matches yet. Keep swiping!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {matches.map((match) => (
        <div
          key={match.id}
          className="flex items-center space-x-4 p-4 hover:bg-gray-50 cursor-pointer transition-colors"
        >
          <img
            src={match.profiles.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'}
            alt={match.profiles.full_name || ''}
            className="w-14 h-14 rounded-full object-cover ring-2 ring-pink-500/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-base font-medium text-gray-900 truncate">
              {match.profiles.full_name}
            </p>
            {match.last_message ? (
              <p className="text-sm text-gray-500 truncate mt-1">
                {match.last_message.content}
              </p>
            ) : (
              <p className="text-sm text-gray-400 italic mt-1">
                No messages yet
              </p>
            )}
          </div>
          {match.last_message && (
            <div className="flex-shrink-0 text-xs text-gray-400">
              {new Date(match.last_message.sent_at).toLocaleDateString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}