import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, Loader2 } from 'lucide-react';
import type { Database } from '../lib/database.types'; 

type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

const STRIPE_LINKS = {
  Basic: 'https://buy.stripe.com/eVa28WgUK8engtGbII',
  Premium: 'https://buy.stripe.com/bIY9Bo7kabqz2CQfYZ',
  VIP: 'https://buy.stripe.com/eVa28W9si2U391edQS'
};

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data: plans, error: plansError } = await supabase
          .from('subscription_plans')
          .select('*')
          .order('price');

        if (plansError) throw plansError;

        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: subscription, error: subError } = await supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .maybeSingle();

          if (subError) throw subError;
          setCurrentSubscription(subscription);
        }

        if (plans) setPlans(plans);
      } catch (error) {
        console.error('Error fetching subscription data:', error);
        setError('Failed to load subscription plans. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleSubscribe = (plan: SubscriptionPlan) => {
    try {
      // Check internet connectivity
      if (!navigator.onLine) {
        throw new Error('No internet connection. Please check your network and try again.');
      }

      const stripeLink = STRIPE_LINKS[plan.name as keyof typeof STRIPE_LINKS];
      if (!stripeLink) {
        throw new Error('Payment link not found for this plan');
      }
      
      // Use window.open for better error handling
      const newWindow = window.open(stripeLink, '_blank');
      
      if (!newWindow) {
        throw new Error('Pop-up blocked. Please allow pop-ups and try again.');
      }

    } catch (error) {
      setError(
        error instanceof Error
          ? `Payment error: ${error.message}`
          : 'Unable to connect to payment service. Please check your internet connection and try again.'
      );
      
      // Clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    }
  };

  // Add online/offline event listeners
  useEffect(() => {
    const handleOnline = () => setError(null);
    const handleOffline = () => 
      setError('No internet connection. Please check your network and try again.');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-12 px-2 sm:px-6 lg:px-8">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Subscription Plans</h2>
        <p className="mt-2 sm:mt-4 text-base sm:text-lg text-gray-600">
          Choose the perfect plan for your dating journey
        </p>
      </div>

      {error && (
        <div className="max-w-3xl mx-auto mt-6">
          <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm flex items-center justify-between">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-4 text-red-600 hover:text-red-800"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 sm:mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 lg:max-w-7xl lg:mx-auto">
        {plans.map((plan) => {
          const features = plan.features as string[];
          const isCurrentPlan = currentSubscription?.plan_id === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 bg-white transform transition-transform hover:scale-[1.02] ${
                isCurrentPlan ? 'ring-2 ring-pink-500' : ''
              }`}
            >
              <div className="p-4 sm:p-6">
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900">{plan.name}</h3>
                {plan.description && (
                  <p className="mt-2 text-sm sm:text-base text-gray-500">{plan.description}</p>
                )}
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    {plan.price === 0 ? 'Free' : `£${plan.price}`}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-base font-medium text-gray-500">
                      /{plan.interval}
                    </span>
                  )}
                </p>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={isCurrentPlan || plan.price === 0}
                  className={`mt-8 w-full rounded-lg px-4 py-2 text-sm font-semibold ${
                    isCurrentPlan
                      ? 'bg-green-500 text-white cursor-default'
                      : plan.price === 0
                      ? 'bg-gray-100 text-gray-800 cursor-default'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90 transition-all transform hover:scale-[1.02] cursor-pointer'
                  }`}
                >
                  {isCurrentPlan ? (
                    'Current Plan'
                  ) : plan.price === 0 ? (
                    'Free Plan'
                  ) : (
                    'Subscribe Now'
                  )}
                </button>
              </div>
              <div className="px-6 pt-6 pb-8">
                <h4 className="text-sm font-semibold text-gray-900 tracking-wide uppercase">
                  What's included
                </h4>
                <ul className="mt-4 space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-gray-700">{feature}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}