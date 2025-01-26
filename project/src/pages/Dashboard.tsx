import { useState } from 'react';
import { ProfileForm } from '../components/ProfileForm';
import { MatchCard } from '../components/MatchCard';
import { ChatList } from '../components/ChatList';
import { Chat } from '../components/Chat';
import { useAuthStore } from '../store/auth';
import { UserCircle2, MessageSquare, LogOut, Heart, CreditCard, Crown, Newspaper } from 'lucide-react';
import { ExoticCrown } from '../components/ExoticCrown';
import { Notifications } from '../components/Notifications';
import { SubscriptionPlans } from '../components/SubscriptionPlans';
import { Feed } from '../components/Feed';
import { SearchCriteria } from '../components/SearchCriteria';
import type { SearchCriteria as SearchCriteriaType } from '../components/SearchCriteria';

type Tab = 'discover' | 'chat' | 'profile' | 'subscription' | 'feed';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const { signOut, profile } = useAuthStore();
  
  const handleSearch = (criteria: SearchCriteriaType) => {
    console.log('Search criteria:', criteria);
    // Implement search logic here
  };

  return (
    <div className="min-h-screen page-container">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <ExoticCrown size="sm" className="hidden sm:block" />
              <h1 className="text-xl sm:text-2xl font-bold brand-text font-playfair">
                Soul King Match
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Notifications />
              <button
                onClick={() => signOut()}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="bg-white border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between sm:justify-center sm:space-x-12 overflow-x-auto">
            <button
              onClick={() => setActiveTab('discover')}
              className={`py-4 px-1 border-b-2 font-medium text-xs sm:text-sm flex items-center space-x-1 sm:space-x-2 min-w-max ${
                activeTab === 'discover'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>
              Discover
              </span>
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'feed'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Newspaper className="w-5 h-5" />
              <span>
                Feed
              </span>
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'chat'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <MessageSquare className="w-5 h-5" />
              <span>
              Messages
              </span>
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'profile'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <UserCircle2 className="w-5 h-5" />
              <span>
              Profile
              </span>
            </button>
            <button
              onClick={() => setActiveTab('subscription')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'subscription'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CreditCard className="w-5 h-5" />
              <span>
                Subscription
              </span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        {activeTab === 'discover' && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] sm:min-h-[70vh]">
            <SearchCriteria onSearch={handleSearch} />
            <MatchCard
              profile={{
                id: '1',
                username: 'sarah',
                full_name: 'Sarah Johnson',
                bio: 'Adventure seeker and coffee lover ☕️',
                birth_date: '1995-06-15',
                location: 'New York, USA',
                photos: ['https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80'],
                gender: 'female',
                looking_for: 'male',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }}
              onLike={() => {}}
              onPass={() => {}}
            />
          </div>
        )}

        {activeTab === 'feed' && (
          <div className="max-w-4xl mx-auto">
            <Feed />
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="bg-white rounded-lg shadow">
            <ChatList />
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="bg-white rounded-lg shadow">
            <ProfileForm />
          </div>
        )}
        
        {activeTab === 'subscription' && (
          <div className="bg-white rounded-lg shadow">
            <SubscriptionPlans />
          </div>
        )}
      </main>
    </div>
  );
}