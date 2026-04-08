import { loadStripe } from '@stripe/stripe-js';
import { db, auth } from '../services/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Athena V10.1 Unified: Multi-Provider Payment Strategy
const PAYMENT_PROVIDER = import.meta.env.VITE_PAYMENT_GATEWAY || 'stripe';

let stripePromise;
const getStripe = () => {
  if (PAYMENT_PROVIDER === 'stripe' && !stripePromise) {
    stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
  }
  return stripePromise;
};

/**
 * createCheckoutSession
 * Unified entry point for Stripe and Mollie.
 */
export async function createCheckoutSession(items) {
  try {
    const user = auth.currentUser;
    
    // 1. Log the intent in Firestore (Standardized Order Data)
    const orderData = {
      uid: user?.uid || 'guest',
      customer_email: user?.email || 'guest@example.com',
      items,
      total_amount: items.reduce((acc, item) => acc + (item.prijs * item.quantity), 0),
      status: 'pending',
      provider: PAYMENT_PROVIDER,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    console.log(`🛒 [OrderCreated] ID: ${orderRef.id} (${PAYMENT_PROVIDER})`);

    // 2. Call backend to create session
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        items, 
        orderId: orderRef.id,
        provider: PAYMENT_PROVIDER,
        successUrl: `${window.location.origin}/success?order_id=${orderRef.id}`,
        cancelUrl: `${window.location.origin}/cart`
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to create ${PAYMENT_PROVIDER} session`);
    }

    const sessionData = await response.json();

    // 3. Handle Provider-Specific Redirect
    if (PAYMENT_PROVIDER === 'stripe') {
      const stripe = await getStripe();
      const result = await stripe.redirectToCheckout({
        sessionId: sessionData.id,
      });
      if (result.error) throw new Error(result.error.message);
    } else if (PAYMENT_PROVIDER === 'mollie') {
      // Mollie provides a direct checkoutUrl from the backend
      if (sessionData.checkoutUrl) {
        window.location.href = sessionData.checkoutUrl;
      } else {
        throw new Error('Mollie checkout URL missing from response');
      }
    }
    
  } catch (err) {
    console.error(`❌ [${PAYMENT_PROVIDER} CheckoutError]:`, err.message);
    trackShopEvent('checkout_failed', { provider: PAYMENT_PROVIDER, error: err.message });
    throw err;
  }
}

export function trackShopEvent(eventName, data) {
  console.log(`[ShopAnalytics] ${eventName}:`, data);
}
