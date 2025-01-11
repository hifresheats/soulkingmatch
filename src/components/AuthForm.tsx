import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { ExoticCrown } from './ExoticCrown';
import { ChevronLeft, ChevronRight, MapPin, Loader2 } from 'lucide-react';
import { getCurrentLocation, type GeoLocation, cn } from '../lib/utils';
import type { Database } from '../lib/database.types';

type SignupStep = 'credentials' | 'personal' | 'profile';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState<SignupStep>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    birth_date: '',
    gender: '',
    looking_for: '',
    location: '',
    bio: '',
    relationship_goals: '',
  });
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuthStore();
  const [geoLocation, setGeoLocation] = useState<GeoLocation | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const detectLocation = async () => {
    setLoadingLocation(true);
    try {
      const location = await getCurrentLocation();
      setGeoLocation(location);
      setFormData(prev => ({
        ...prev,
        location: `${location.city}, ${location.region}, ${location.country}`.replace(/^, /, ''),
      }));
    } catch (error) {
      setError('Could not detect location. Please enter manually.');
    } finally {
      setLoadingLocation(false);
    }
  };

  const handleFormDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    
    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        if (currentStep !== 'profile') {
          setCurrentStep(prev => 
            prev === 'credentials' ? 'personal' : 'profile'
          );
          return;
        }
        await signUp(email, password, formData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderSignupStep = () => {
    switch (currentStep) {
      case 'credentials':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                required
              />
            </div>
          </>
        );

      case 'personal':
        return (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="full_name"
                value={formData.full_name}
                onChange={handleFormDataChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleFormDataChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleFormDataChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  required
                >
                  <option value="">Select...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interested In
                </label>
                <select
                  name="looking_for"
                  value={formData.looking_for}
                  onChange={handleFormDataChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  required
                >
                  <option value="">Select...</option>
                  <option value="men">Men</option>
                  <option value="women">Women</option>
                  <option value="everyone">Everyone</option>
                </select>
              </div>
            </div>
          </>
        );

      case 'profile':
        return (
          <>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <button
                  type="button"
                  onClick={detectLocation}
                  className="text-sm text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1"
                  disabled={loadingLocation}
                >
                  {loadingLocation ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Detecting...</span>
                    </>
                  ) : (
                    <>
                      <MapPin className="w-4 h-4" />
                      <span>Detect Location</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleFormDataChange}
                placeholder="City, Region"
                className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm ${
                  geoLocation ? 'pl-10' : ''
                }`}
                required
              />
              {geoLocation && (
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span>
                    {geoLocation.latitude.toFixed(4)}°, {geoLocation.longitude.toFixed(4)}°
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                About Me
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleFormDataChange}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Relationship Goals
              </label>
              <select
                name="relationship_goals"
                value={formData.relationship_goals}
                onChange={handleFormDataChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                required
              >
                <option value="">Select...</option>
                <option value="serious">Serious Relationship</option>
                <option value="marriage">Marriage</option>
                <option value="casual">Casual Dating</option>
                <option value="friendship">Friendship</option>
                <option value="undecided">Still Deciding</option>
              </select>
            </div>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex justify-center mb-8">
          <ExoticCrown size="xl" className="animate-float" />
        </div>
        <h1 className="text-4xl font-bold text-center mb-8 brand-text font-playfair">
          Soul King Match
        </h1>
        
        {!isLogin && (
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-2">
              {['credentials', 'personal', 'profile'].map((step, index) => (
                <div
                  key={step}
                  className={`w-3 h-3 rounded-full ${
                    currentStep === step
                      ? 'bg-amber-500'
                      : index < ['credentials', 'personal', 'profile'].indexOf(currentStep)
                      ? 'bg-amber-200'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              Step {['credentials', 'personal', 'profile'].indexOf(currentStep) + 1} of 3
            </span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {isLogin ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                  required
                />
              </div>
            </>
          ) : (
            renderSignupStep()
          )}
          
          <button
            type="submit"
            disabled={isSubmitting}
            className={cn(
              "w-full brand-gradient text-white py-3 rounded-lg font-medium text-lg shadow-lg relative",
              "hover:opacity-90 hover:shadow-xl transform hover:scale-[1.02] transition-all",
              "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            )}
          >
            {isSubmitting ? (
              <>
                <span className="opacity-0">
                  {isLogin ? 'Sign In' : currentStep === 'profile' ? 'Complete Sign Up' : 'Continue'}
                </span>
                <Loader2 className="w-5 h-5 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </>
            ) : (
              isLogin ? 'Sign In' : currentStep === 'profile' ? 'Complete Sign Up' : 'Continue'
            )}
          </button>
        </form>
        
        {!isLogin && currentStep !== 'credentials' && (
          <button
            onClick={() => setCurrentStep(prev => 
              prev === 'profile' ? 'personal' : 'credentials'
            )}
            className="mt-4 w-full text-gray-600 py-2 text-sm hover:text-gray-900"
          >
            ← Back to previous step
          </button>
        )}
        
        <p className="mt-6 text-center text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setCurrentStep('credentials');
            }}
            className="text-amber-500 hover:text-amber-600 font-medium transition-colors"
            disabled={isSubmitting}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  );
}