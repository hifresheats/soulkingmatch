import { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { Camera, Loader2, Shield, AlertTriangle } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function ProfileForm() {
  const { profile, loadProfile } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string | null>(null);
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
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      console.error('Invalid file type');
      return;
    }
    
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      console.error('File too large');
      return;
    }
    
    setUploadingPhoto(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/${Date.now()}.${fileExt}`;
      
      // Delete old photo if it exists
      const oldPhoto = formData.photos?.[index];
      if (oldPhoto) {
        const oldPath = oldPhoto.split('/').slice(-2).join('/');
        await supabase.storage
          .from('user-media')
          .remove([oldPath]);
      }

      // Upload new photo
      const { error: uploadError } = await supabase.storage
        .from('user-media')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('user-media')
        .getPublicUrl(filePath);

      // Update photos array
      const newPhotos = [...(formData.photos || [])];
      newPhotos[index] = publicUrl;
      
      setFormData(prev => ({
        ...prev,
        photos: newPhotos,
      }));

    } catch (error) {
      const err = error as Error;
      console.error('Error uploading photo:', err.message);
      // Show error in UI
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
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-6">
      {verificationStatus === 'pending' && (
        <div className="bg-blue-50 p-4 rounded-lg flex items-center space-x-3">
          <Shield className="w-5 h-5 text-blue-500" />
          <p className="text-sm text-blue-700">
            Verification is pending. We'll review your profile soon.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={formData.username}
            onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-pink-500 focus:ring-pink-500"
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
              className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center hover:border-pink-500 transition-colors cursor-pointer"
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
                  src={formData.photos[index]}
                  alt={`Photo ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : uploadingPhoto ? (
                <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
              ) : (
                <Camera className="w-8 h-8 text-gray-400" />
              )}
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