import { useState } from 'react';
import { ProfileForm } from '../components/ProfileForm';
import { MatchCard } from '../components/MatchCard';
import { ChatList } from '../components/ChatList';
import { Chat } from '../components/Chat';
import { useAuthStore } from '../store/auth';
import { UserCircle2, MessageSquare, LogOut, Heart, CreditCard, Crown } from 'lucide-react';
import { ExoticCrown } from '../components/ExoticCrown';
import { Notifications } from '../components/Notifications';
import { SubscriptionPlans } from '../components/SubscriptionPlans';

type Tab = 'discover' | 'chat' | 'profile' | 'subscription';

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('discover');
  const { signOut, profile } = useAuthStore();

  return (
    <div className="min-h-screen page-container">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <ExoticCrown size="sm" className="hidden sm:block" />
              <h1 className="text-2xl font-bold brand-text font-playfair">
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
          <div className="flex justify-center space-x-12">
            <button
              onClick={() => setActiveTab('discover')}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === 'discover'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Heart className="w-5 h-5" />
              <span>
              Discover
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'discover' && (
          <div className="flex flex-col items-center justify-center min-h-[70vh]">
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