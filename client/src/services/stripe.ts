/**
 * Service to handle Stripe API calls
 */

interface CreateSubscriptionParams {
  email: string;
  userId: string;
  name?: string;
}

interface SubscriptionResponse {
  subscriptionId: string;
  clientSecret: string;
  customerId: string;
}

/**
 * Creates a subscription with a 14-day trial period
 */
export async function createSubscription({
  email,
  userId,
  name,
}: CreateSubscriptionParams): Promise<SubscriptionResponse> {
  try {
    const response = await fetch('/api/subscription/create-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        userId,
        name,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
} 