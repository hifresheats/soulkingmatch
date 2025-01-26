import { serve } from 'https://deno.fresh.dev/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@12.0.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    if (req.method !== 'POST') {
      throw new Error(`Method ${req.method} not allowed`);
    }

    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    if (!STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16',
      httpClient: Stripe.createFetchHttpClient(),
      maxNetworkRetries: 2,
      timeout: 10000 // 10 second timeout
    });

    // Parse request body
    try {
      const body = await req.text();
      const params = JSON.parse(body);
      
      const { 
        priceId, 
        planId, 
        customerId, 
        customerEmail, 
        successUrl, 
        cancelUrl 
      } = params;

      // Validate required fields
      if (!priceId || typeof priceId !== 'string') {
        throw new Error('Invalid or missing price ID');
      }
      if (!planId || typeof planId !== 'string') {
        throw new Error('Invalid or missing plan ID');
      }
      if (!customerId || typeof customerId !== 'string') {
        throw new Error('Invalid or missing user ID');
      }
      if (!customerEmail || typeof customerEmail !== 'string' || !customerEmail.includes('@')) {
        throw new Error('Invalid or missing user email');
      }
      if (!successUrl || typeof successUrl !== 'string' || !successUrl.startsWith('http')) {
        throw new Error('Invalid or missing success URL');
      }
      if (!cancelUrl || typeof cancelUrl !== 'string' || !cancelUrl.startsWith('http')) {
        throw new Error('Invalid or missing cancel URL');
      }

      // Create checkout session
      console.log('Creating Stripe checkout session...');
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
            adjustable_quantity: {
              enabled: false
            }
          },
        ],
        mode: 'subscription',
        success_url: successUrl,
        cancel_url: cancelUrl,
        customer_email: customerEmail,
        client_reference_id: `${customerId}_${planId}`,
        metadata: {
          customerId,
          planId
        },
        allow_promotion_codes: true,
        billing_address_collection: 'required'
      });

      console.log('Checkout session created successfully');
      return new Response(
        JSON.stringify({ url: session.url }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (e) {
      console.error('Error in checkout session:', e);
      const errorMessage = e instanceof Error 
        ? e.message 
        : 'An unexpected error occurred while creating the checkout session';
      
      return new Response(
        JSON.stringify({ 
          error: errorMessage,
          code: 'checkout_session_error',
          timestamp: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});