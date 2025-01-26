import { useState } from 'react';
import { Heart, X, Shield, Flag, Sparkles, PhoneCall } from 'lucide-react';
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
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Create match
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .insert({
          user1_id: user.id,
          user2_id: profile.id,
          status: 'pending'
        })
        .select('id')
        .single();

      if (matchError) throw matchError;

      // Wait for AI evaluation to be created via trigger
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Get evaluation
      const { data: evalData, error: evalError } = await supabase
        .from('match_evaluations')
        .select('*')
        .eq('match_id', match.id)
        .single();

      if (evalError) throw evalError;

      setEvaluation(evalData);
      setShowEvaluation(true);

    } catch (error) {
      console.error('Error creating match:', error);
    } finally {
      setLoading(false);
    }
  };

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
    <div className="relative w-full max-w-sm mx-auto aspect-[3/4] rounded-2xl overflow-hidden card-shadow transform transition-all duration-300 hover:scale-[1.02] animate-slide-in">
      <img
        src={profile.photos?.[0] || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'}
        alt={profile.full_name || 'Profile photo'}
        className="absolute inset-0 w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
      />
      
      <div className="absolute inset-0 card-gradient" />
      
      <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform transition-all duration-300 hover:translate-y-[-4px]">
        <h3 className="text-2xl font-bold">
          {profile.full_name}, {profile.birth_date ? calculateAge(profile.birth_date) : '??'}
          {profile.verified && (
            <Shield className="w-5 h-5 text-blue-500 inline ml-2 animate-pulse" />
          )}
        </h3>
        <p className="text-white/80">{profile.location}</p>
        {profile.bio && (
          <p className="mt-2 text-sm text-white/70 line-clamp-2 hover:line-clamp-none transition-all duration-300">{profile.bio}</p>
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
          onClick={handleLike}
          disabled={loading}
          className="swipe-button swipe-button-like"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent" />
          ) : (
            <Heart className="w-8 h-8" />
          )}
        </button>
      </div>

      {/* AI Evaluation Modal */}
      {showEvaluation && evaluation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                <h3 className="text-lg font-semibold">AI Match Evaluation</h3>
              </div>
              <button
                onClick={() => setShowEvaluation(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg">
                <div className="text-2xl font-bold text-center text-amber-600">
                  {evaluation.ai_score || '...'}/100
                </div>
                <p className="text-sm text-center text-amber-700">
                  Match Compatibility Score
                </p>
              </div>

              {evaluation.verification_status === 'requires_review' && (
                <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-3">
                  <PhoneCall className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      Verification Call Required
                    </p>
                    <p className="text-xs text-blue-600">
                      {evaluation.callback_scheduled_at
                        ? `Scheduled for ${new Date(evaluation.callback_scheduled_at).toLocaleDateString()}`
                        : 'Our team will contact you to schedule a verification call'}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <h4 className="font-medium">Compatibility Factors</h4>
                {Object.entries(evaluation.ai_feedback.compatibility_factors || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-500"
                        style={{ width: `${Number(value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Safety Check</h4>
                {Object.entries(evaluation.ai_feedback.risk_factors || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">
                      {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{ width: `${100 - Number(value)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {evaluation.ai_feedback.recommendations?.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {evaluation.ai_feedback.recommendations.map((rec: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="mr-2">•</span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
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