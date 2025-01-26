import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { supabase } from '../lib/supabase';
import { Camera, Loader2, Shield, AlertTriangle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function ProfileForm() {
  const { profile, loadProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
  const [emailPreferences, setEmailPreferences] = useState({
    matches: true,
    messages: true,
    profile_views: true,
    likes: true,
    system_updates: true
  });
  const [formData, setFormData] = useState<Partial<Profile>>({
    full_name: profile?.full_name || '',
    username: profile?.username || '',
    bio: profile?.bio || '',
    gender: profile?.gender || '',
    looking_for: profile?.looking_for || '',
    birth_date: profile?.birth_date || '',
    location: profile?.location || '',
    photos: profile?.photos || [],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: profile?.id,
          ...formData,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;
      await loadProfile();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (index: number, file: File) => {
    if (!profile) return;
    
    setError(null);
    
    if (!file.type.startsWith('image/')) {
      setError('Invalid file type. Please upload an image file.');
      return;
    }
    
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }
    
    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      // Delete old photo if it exists
      const oldPhoto = formData.photos?.[index];
      if (oldPhoto) {
        const oldPath = new URL(oldPhoto).pathname.split('/').slice(-2).join('/');
        await supabase.storage
          .from('user-media')
          .remove([oldPath]);
      }

      const { error: uploadError } = await supabase.storage
        .from('user-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });

      if (uploadError) throw uploadError;

      // Get public URL with cache busting
      const { data } = supabase.storage
        .from('user-media')
        .getPublicUrl(filePath);
      
      // Add cache busting query parameter
      const publicUrl = new URL(data.publicUrl);
      publicUrl.searchParams.set('t', Date.now().toString());

      if (!publicUrl) {
        throw new Error('Failed to get public URL for uploaded image');
      }
      
      const finalUrl = publicUrl.toString();

      const newPhotos = [...(formData.photos || [])];
      newPhotos[index] = finalUrl;
      
      setFormData(prev => ({
        ...prev,
        photos: newPhotos,
      }));

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          photos: newPhotos,
          updated_at: new Date().toISOString(),
        }, { returning: 'minimal' })
        .eq('id', profile.id);

      if (updateError) throw updateError;
      
      // Reload profile to ensure we have the latest data
      await loadProfile();

    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error('Error uploading photo:', err.message);
      setError(err.message || 'Failed to upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const requestVerification = async () => {
    try {
      const { error } = await supabase
        .from('verifications')
        .insert({
          user_id: profile?.id,
          type: 'photo',
        });

      if (error) throw error;
      setVerificationStatus('pending');
    } catch (error) {
      console.error('Error requesting verification:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 max-w-2xl mx-auto p-3 sm:p-6">
      {profile?.verified && (
        <div className="bg-green-50 p-3 sm:p-4 rounded-lg flex items-center space-x-2 sm:space-x-3">
          <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />
          <div>
            <h4 className="font-medium text-green-800 text-sm sm:text-base">Verified Profile</h4>
            <p className="text-xs sm:text-sm text-green-600">
              Your profile has been verified. This badge helps build trust with other users.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
          <Shield className="w-5 h-5 text-blue-500" />
          <div className="flex-1 ml-3">
            <h4 className="text-sm font-medium text-blue-800">Verification in Progress</h4>
            <p className="text-sm text-blue-600 mt-1">
              Our team will review your profile within 24-48 hours. We'll check:
            </p>
            <ul className="mt-2 text-sm text-blue-600 space-y-1">
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                Profile photo authenticity
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                Profile information accuracy
              </li>
              <li className="flex items-center">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-2" />
                Account security status
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500 text-sm sm:text-base"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Full Name</label>
          <input
            type="text"
            value={formData.full_name || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={formData.gender || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Looking For</label>
          <select
            value={formData.looking_for || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, looking_for: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
          >
            <option value="">Select preference</option>
            <option value="male">Men</option>
            <option value="female">Women</option>
            <option value="everyone">Everyone</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Birth Date</label>
          <input
            type="date"
            value={formData.birth_date || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Location</label>
          <input
            type="text"
            value={formData.location || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
            placeholder="City, Country"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Bio</label>
        <textarea
          value={formData.bio || ''}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
        <p className="text-sm text-gray-500 mb-4">
          Upload clear photos of yourself. This helps with verification and matching.
        </p>
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, index) => (
            <label
              key={index}
              className="relative aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-pink-500 transition-colors cursor-pointer overflow-hidden group"
            >
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoUpload(index, file);
                }}
                disabled={uploadingPhoto}
              />
              {formData.photos?.[index] ? (
                <img
                  key={formData.photos[index]}
                  src={formData.photos[index]}
                  alt={`Photo ${index + 1}`}
                  className="absolute inset-0 w-full h-full object-cover rounded-lg bg-gray-100"
                  loading="lazy"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300"%3E%3Crect width="300" height="300" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="14" fill="%236b7280"%3EFailed to load image%3C/text%3E%3C/svg%3E';
                    setError('Failed to load image. Please try uploading again.');
                  }}
                />
              ) : uploadingPhoto ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Camera className="w-8 h-8 text-gray-400" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Camera className="w-6 h-6 text-white" />
              </div>
            </label>
          ))}
        </div>
        <div className="mt-4">
          <button
            type="button"
            onClick={requestVerification}
            disabled={!formData.photos?.length || verificationStatus === 'pending'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Shield className="w-4 h-4 mr-2" />
            Request Verification
          </button>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Email Notifications</h3>
        <div className="space-y-4">
          {Object.entries(emailPreferences).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(e) => setEmailPreferences(prev => ({
                    ...prev,
                    [key]: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-pink-600 shadow-sm focus:border-pink-300 focus:ring focus:ring-pink-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-gray-700">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
              </label>
              <span className="text-sm text-gray-500">
                {key === 'matches' && 'Get notified when you match with someone'}
                {key === 'messages' && 'Receive email notifications for new messages'}
                {key === 'profile_views' && 'Know when someone views your profile'}
                {key === 'likes' && 'Get notified when someone likes your profile'}
                {key === 'system_updates' && 'Receive important updates about your account'}
              </span>
            </div>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          'Save Profile'
        )}
      </button>
    </form>
  );
}