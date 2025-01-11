import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Check, Loader2 } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import type { Database } from '../lib/database.types';

type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row'];
type Subscription = Database['public']['Tables']['subscriptions']['Row'];

const stripePromise = loadStripe('pk_test_51O9PqvBqPxKHZQFYrhmYwhGqF8UZGEJw2qFPrxJqYHBPQCUF6jvEztTQzZKAVZLPxFEwLzrqF9WBfBkLxuhPwGkX00vJ3JZF8M');

export function SubscriptionPlans() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    const fetchPlans = async () => {
      const { data: plans } = await supabase
        .from('subscription_plans')
        .select('*')
        .order('price');

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .maybeSingle();

        setCurrentSubscription(subscription || null);
      }

      if (plans) setPlans(plans);
      setLoading(false);
    };

    fetchPlans();
  }, []);

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    setSubscribing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (!plan.stripe_price_id) {
        throw new Error('This plan is not available for purchase');
      }

      // Ensure we have the required data
      if (!user.email) {
        throw new Error('User email is required for subscription');
      }

      const { data: session, error: sessionError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId: plan.stripe_price_id,
          planId: plan.id,
          userId: user.id,
          userEmail: user.email,
          successUrl: `${window.location.origin}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
          cancelUrl: `${window.location.origin}/dashboard`,
        },
      });

      if (sessionError) {
        console.error('Checkout session error:', sessionError);
        throw new Error(sessionError.message || 'Failed to create checkout session');
      }

      if (!session?.id) throw new Error('Failed to create checkout session');

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: session.id,
      });

      if (stripeError) {
        console.error('Stripe redirect error:', stripeError);
        throw new Error(stripeError.message || 'Failed to redirect to checkout');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      const message = error instanceof Error ? error.message : 'Failed to start subscription process';
      // Show error in UI instead of using alert
      setError(message);
    } finally {
      setSubscribing(false);
    }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-pink-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
            {error}
          </div>
        )}
        <h2 className="text-3xl font-bold text-gray-900">Subscription Plans</h2>
        <p className="mt-4 text-lg text-gray-600">
          Choose the perfect plan for your dating journey
        </p>
      </div>

      <div className="mt-12 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const features = plan.features as string[];
          const isCurrentPlan = currentSubscription?.plan_id === plan.id;

          return (
            <div
              key={plan.id}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 ${
                isCurrentPlan ? 'ring-2 ring-pink-500' : ''
              }`}
            >
              <div className="p-6">
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                {plan.description && (
                  <p className="mt-2 text-gray-500">{plan.description}</p>
                )}
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">
                    £{plan.price}
                  </span>
                  <span className="text-base font-medium text-gray-500">
                    /{plan.interval}
                  </span>
                </p>
                <button
                  onClick={() => handleSubscribe(plan)}
                  disabled={subscribing || isCurrentPlan || plan.price === 0 || !plan.stripe_price_id}
                  className={`mt-8 w-full rounded-lg px-4 py-2 text-sm font-semibold ${
                    isCurrentPlan
                      ? 'bg-green-500 text-white cursor-default'
                      : plan.price === 0
                      ? 'bg-gray-100 text-gray-800 cursor-default'
                      : !plan.stripe_price_id
                      ? 'bg-gray-100 text-gray-800 cursor-not-allowed'
                      : 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:opacity-90'
                  }`}
                >
                  {subscribing ? (
                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : plan.price === 0 ? (
                    'Free Plan'
                  ) : !plan.stripe_price_id ? (
                    'Not Available'
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