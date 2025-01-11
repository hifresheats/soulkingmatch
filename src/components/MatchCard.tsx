import { useState } from 'react';
import { Heart, X, Shield, Flag } from 'lucide-react';
import type { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface MatchCardProps {
  profile: Profile;
  onLike: () => void;
  onPass: () => void;
}

export function MatchCard({ profile, onLike, onPass }: MatchCardProps) {
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleReport = async () => {
    if (!reportReason) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from('reports').insert({
        reporter_id: user.id,
        reported_id: profile.id,
        reason: reportReason,
      });

      if (error) throw error;
      setReporting(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting profile:', error);
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto aspect-[3/4] rounded-2xl overflow-hidden card-shadow transform transition-transform hover:scale-[1.02]">
      <img
        src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'}
        alt={profile.full_name || 'Profile photo'}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      <div className="absolute inset-0 card-gradient" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
        <h3 className="text-2xl font-bold">
          {profile.full_name}, {profile.birth_date ? calculateAge(profile.birth_date) : '??'}
          {profile.verified && (
            <Shield className="w-5 h-5 text-blue-500 inline ml-2" />
          )}
        </h3>
        <p className="text-white/80">{profile.location}</p>
        {profile.bio && (
          <p className="mt-2 text-sm text-white/70 line-clamp-2">{profile.bio}</p>
        )}
      </div>
      
      {reporting && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center p-6">
          <div className="bg-white rounded-lg p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-4">Report Profile</h3>
            <select
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-2 border rounded mb-4"
            >
              <option value="">Select a reason</option>
              <option value="fake">Fake Profile</option>
              <option value="inappropriate">Inappropriate Content</option>
              <option value="harassment">Harassment</option>
              <option value="spam">Spam</option>
              <option value="other">Other</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setReporting(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                disabled={!reportReason}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-center space-x-4">
        <button
          onClick={() => setReporting(true)}
          className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 transition-colors"
        >
          <Flag className="w-5 h-5" />
        </button>
        <button
          onClick={onPass}
          className="swipe-button swipe-button-pass"
        >
          <X className="w-8 h-8" />
        </button>
        <button
          onClick={onLike}
          className="swipe-button swipe-button-like"
        >
          <Heart className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
}

function calculateAge(birthDate: string) {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}