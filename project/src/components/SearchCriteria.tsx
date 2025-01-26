import { useState } from 'react';
import { Search, Filter, MapPin, Loader2 } from 'lucide-react';
import { cn } from '../lib/utils';
import { getCurrentLocation } from '../lib/utils';

interface SearchCriteriaProps {
  onSearch: (criteria: SearchCriteria) => void;
}

export interface SearchCriteria {
  latitude?: number;
  longitude?: number;
  ageRange: [number, number];
  distance: number;
  height: [number, number];
  gender: string;
  interests: string[];
  relationshipGoals: string[];
  education: string[];
  languages: string[];
  lifestyle: string[];
  personality: string[];
}

export function SearchCriteria({ onSearch }: SearchCriteriaProps) {
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [criteria, setCriteria] = useState<SearchCriteria>({
    ageRange: [18, 50],
    distance: 50,
    height: [150, 200],
    gender: '',
    interests: [],
    relationshipGoals: [],
    education: [],
    languages: [],
    lifestyle: [],
    personality: [],
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!location) {
      alert('Please enable location to search nearby matches');
      return;
    }
    onSearch({
      ...criteria,
      latitude: location.lat,
      longitude: location.lng
    });
  };

  const detectLocation = async () => {
    setLoading(true);
    try {
      const loc = await getCurrentLocation();
      setLocation({ lat: loc.latitude, lng: loc.longitude });
    } catch (error) {
      console.error('Error getting location:', error);
      alert('Could not detect location. Please enable location services.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-3 sm:p-4 mb-4 sm:mb-6 w-full max-w-3xl mx-auto transform transition-all duration-300 hover:shadow-lg animate-slide-in">
      <form onSubmit={handleSubmit}>
        {/* Basic Search */}
        <div className="flex items-center space-x-2 sm:space-x-4 mb-3 sm:mb-4">
          <div className="flex-1 flex space-x-2">
            <button
              type="button"
              onClick={detectLocation}
              disabled={loading}
              className={cn(
                "flex items-center justify-center px-4 py-2 rounded-lg",
                "text-sm border border-gray-300",
                loading ? "bg-gray-100" : "hover:bg-gray-50"
              )}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
              ) : (
                <MapPin className="w-5 h-5 text-gray-400" />
              )}
              <span className="ml-2">
                {location ? 'Location Detected' : 'Detect Location'}
              </span>
            </button>
            {location && (
              <div className="flex-1 text-sm text-gray-500 flex items-center">
                <span className="ml-2">
                  {location.lat.toFixed(4)}°, {location.lng.toFixed(4)}°
                </span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "p-2 rounded-lg border border-gray-300",
              showFilters ? "bg-pink-50 border-pink-300" : "hover:bg-gray-50"
            )}
          >
            <Filter className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="space-y-3 sm:space-y-4 border-t pt-3 sm:pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Age Range
                </label>
                <div className="flex items-center space-x-2 text-sm sm:text-base">
                  <input
                    type="number"
                    value={criteria.ageRange[0]}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      ageRange: [parseInt(e.target.value), prev.ageRange[1]]
                    }))}
                    min="18"
                    max={criteria.ageRange[1]}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={criteria.ageRange[1]}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      ageRange: [prev.ageRange[0], parseInt(e.target.value)]
                    }))}
                    min={criteria.ageRange[0]}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Distance (km)
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={criteria.distance}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    distance: parseInt(e.target.value)
                  }))}
                  className="w-full"
                />
                <div className="text-sm text-gray-600 mt-1">
                  {criteria.distance} km
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Height Range (cm)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={criteria.height[0]}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      height: [parseInt(e.target.value), prev.height[1]]
                    }))}
                    min="150"
                    max={criteria.height[1]}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                  />
                  <span>to</span>
                  <input
                    type="number"
                    value={criteria.height[1]}
                    onChange={(e) => setCriteria(prev => ({
                      ...prev,
                      height: [prev.height[0], parseInt(e.target.value)]
                    }))}
                    min={criteria.height[0]}
                    className="w-20 px-2 py-1 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Education
                </label>
                <select
                  multiple
                  value={criteria.education}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    education: Array.from(e.target.selectedOptions, option => option.value)
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="high_school">High School</option>
                  <option value="bachelors">Bachelor's Degree</option>
                  <option value="masters">Master's Degree</option>
                  <option value="phd">PhD</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={criteria.gender}
                  onChange={(e) => setCriteria(prev => ({
                    ...prev,
                    gender: e.target.value
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">Any</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="non-binary">Non-binary</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Relationship Goals
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Casual', 'Serious', 'Marriage', 'Friendship'].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => setCriteria(prev => ({
                        ...prev,
                        relationshipGoals: prev.relationshipGoals.includes(goal)
                          ? prev.relationshipGoals.filter(g => g !== goal)
                          : [...prev.relationshipGoals, goal]
                      }))}
                      className={cn(
                        "px-3 py-1 rounded-full text-sm",
                        "transform transition-all duration-300 hover:scale-105 active:scale-95",
                        criteria.relationshipGoals.includes(goal)
                          ? "bg-pink-100 text-pink-800 border-pink-200"
                          : "bg-gray-100 text-gray-800 border-gray-200"
                      )}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Languages
              </label>
              <div className="flex flex-wrap gap-2">
                {['English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese'].map((lang) => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setCriteria(prev => ({
                      ...prev,
                      languages: prev.languages.includes(lang)
                        ? prev.languages.filter(l => l !== lang)
                        : [...prev.languages, lang]
                    }))}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm",
                      criteria.languages.includes(lang)
                        ? "bg-pink-100 text-pink-800 border-pink-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    )}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Interests
              </label>
              <div className="flex flex-wrap gap-2">
                {['Travel', 'Music', 'Sports', 'Art', 'Food', 'Reading', 'Gaming', 'Movies'].map((interest) => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => setCriteria(prev => ({
                      ...prev,
                      interests: prev.interests.includes(interest)
                        ? prev.interests.filter(i => i !== interest)
                        : [...prev.interests, interest]
                    }))}
                    className={cn(
                      "px-3 py-1 rounded-full text-sm",
                      criteria.interests.includes(interest)
                        ? "bg-pink-100 text-pink-800 border-pink-200"
                        : "bg-gray-100 text-gray-800 border-gray-200"
                    )}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:opacity-90 transform transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-lg"
          >
            Apply Filters
          </button>
        </div>
      </form>
    </div>
  );
}