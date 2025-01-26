import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Heart, MessageCircle, Share2, MoreVertical, Loader2, Edit2 } from 'lucide-react';
import type { Database } from '../lib/database.types';
import { useAuthStore } from '../store/auth';

type Post = {
  id: string;
  user_id: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  liked_by_user: boolean;
  profile: Database['public']['Tables']['profiles']['Row'];
};

export function Feed() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [likingPost, setLikingPost] = useState<string | null>(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const { profile } = useAuthStore();
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [editingPost, setEditingPost] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            profile:profiles(*),
            liked_by_user:post_likes!inner(user_id)
          `)
          .eq('post_likes.user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Transform the data to include liked_by_user boolean
        const transformedPosts = data?.map(post => ({
          ...post,
          liked_by_user: true
        })) || [];
        
        setPosts(transformedPosts);
      } catch (error) {
        console.error('Error fetching posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    const subscription = supabase
      .channel('public:posts')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts'
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setPosts(current =>
              current.map(post =>
                post.id === payload.new.id
                  ? { ...post, ...payload.new }
                  : post
              )
            );
          }
        }
      )
      .subscribe();

    return () => { subscription.unsubscribe(); };
  }, []);

  const handleLike = async (postId: string) => {
    if (likingPost) return; // Prevent multiple simultaneous likes
    
    setLikingPost(postId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const post = posts.find(p => p.id === postId);
      if (!post) return;

      if (post.liked_by_user) {
        // Unlike
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setPosts(current =>
          current.map(p =>
            p.id === postId
              ? { ...p, liked_by_user: false, likes_count: p.likes_count - 1 }
              : p
          )
        );
      } else {
        // Like
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        setPosts(current =>
          current.map(p =>
            p.id === postId
              ? { ...p, liked_by_user: true, likes_count: p.likes_count + 1 }
              : p
          )
        );
      }
    } catch (error) {
      console.error('Error toggling like:', error);
    } finally {
      setLikingPost(null);
    }
  };

  const handleComment = async () => {
    if (!selectedPost || !comment.trim() || !profile) return;
    
    // Check if user has a paid subscription
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', profile.id)
      .eq('status', 'active')
      .maybeSingle();

    if (!subscription) {
      alert('Only paid members can comment on posts. Please upgrade your subscription.');
      return;
    }

    setCommenting(true);
    try {
      const { error } = await supabase
        .from('post_comments')
        .insert({
          post_id: selectedPost.id,
          user_id: profile.id,
          content: comment.trim()
        });

      if (error) throw error;

      // Update comments count
      setPosts(current =>
        current.map(p =>
          p.id === selectedPost.id
            ? { ...p, comments_count: p.comments_count + 1 }
            : p
        )
      );

      setComment('');
      setShowCommentModal(false);
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setCommenting(false);
    }
  };

  const handleEdit = async (postId: string) => {
    if (!editContent.trim()) return;

    try {
      const { error } = await supabase
        .from('posts')
        .update({ content: editContent.trim() })
        .eq('id', postId);

      if (error) throw error;

      setEditingPost(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-0">
      {posts.map((post) => (
        <div key={post.id} className="bg-white rounded-xl shadow-md mb-4 sm:mb-6 overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] animate-slide-in">
          {/* Post Header */}
          <div className="p-3 sm:p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img
                src={post.profile.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'}
                alt={post.profile.full_name || ''}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-pink-500/20 hover:ring-pink-500/40 transition-all duration-300"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                  {post.profile.full_name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            {post.user_id === profile?.id && (
              <button
                onClick={() => {
                  setEditingPost(post.id);
                  setEditContent(post.content);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <Edit2 className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Post Content */}
          <div className="px-4 pb-2">
            {editingPost === post.id ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => {
                      setEditingPost(null);
                      setEditContent('');
                    }}
                    className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleEdit(post.id)}
                    className="px-3 py-1 text-sm bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-800">{post.content}</p>
            )}
          </div>

          {/* Post Image */}
          {post.image_url && (
            <img
              src={post.image_url}
              alt="Post content"
              className="w-full h-auto max-h-96 object-cover"
            />
          )}

          {/* Post Actions */}
          <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button
                onClick={() => handleLike(post.id)}
                disabled={likingPost === post.id}
                className={`flex items-center space-x-2 transform transition-all duration-300 hover:scale-110 active:scale-95 ${
                  post.liked_by_user ? 'text-pink-500' : 'text-gray-600 hover:text-pink-500'
                }`}
              >
                {likingPost === post.id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Heart className={`w-5 h-5 ${post.liked_by_user ? 'fill-current' : ''}`} />
                )}
                <span>{post.likes_count}</span>
              </button>
              <button
                onClick={() => {
                  setSelectedPost(post);
                  setShowCommentModal(true);
                }}
                className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transform transition-all duration-300 hover:scale-110 active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{post.comments_count}</span>
              </button>
            </div>
            <button className="text-gray-600 hover:text-gray-800 transform transition-all duration-300 hover:scale-110 active:scale-95">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      ))}
      
      {/* Comment Modal */}
      {showCommentModal && selectedPost && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Add a Comment</h3>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Write your comment..."
              rows={3}
            />
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCommentModal(false);
                  setSelectedPost(null);
                  setComment('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleComment}
                disabled={commenting || !comment.trim()}
                className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {commenting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Post Comment'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}