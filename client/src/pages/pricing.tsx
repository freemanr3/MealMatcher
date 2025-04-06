import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function PricingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-orange-500">Pantry Pal</Link>
          <div className="flex gap-8">
            <Link href="#features" className="text-gray-700 hover:text-orange-500">Features</Link>
            <Link href="#pricing" className="text-gray-700 hover:text-orange-500">Pricing</Link>
            <Link href="#how-it-works" className="text-gray-700 hover:text-orange-500">How It Works</Link>
            <Link href="#faq" className="text-gray-700 hover:text-orange-500">FAQs</Link>
          </div>
          {user ? (
            <Link href="/">
              <Button variant="outline">Go to Dashboard</Button>
            </Link>
          ) : (
            <Link href="/auth">
              <Button>Try Free</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Header Section */}
      <header className="bg-[#FFF8F0] py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-6">Effortless Meal Planning, Zero Food Waste</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Pantry Pal uses AI to create personalized meal plans, streamline grocery lists, and track your pantry inventory—cutting your food waste by up to 40% and saving you time and money.
          </p>
          <Link href={user ? "/" : "/auth"}>
            <Button size="lg">Start Your 14-Day Free Trial</Button>
          </Link>
        </div>
      </header>

      {/* Pricing Section */}
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-600">Choose the plan that fits your household needs</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <div className="text-4xl font-bold text-orange-500">$0</div>
                <CardDescription>Forever Free</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6">Perfect for individuals just getting started with meal planning</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Basic meal planning
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Simple grocery lists
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Up to 10 saved recipes
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Basic inventory tracking
                  </li>
                </ul>
                <Link href={user ? "/" : "/auth"}>
                  <Button variant="outline" className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-orange-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Most Popular
              </div>
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <div className="text-4xl font-bold text-orange-500">$4.99</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6">Ideal for busy individuals and small families looking to save time and money</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    All Free features
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    AI-powered meal suggestions
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Unlimited recipes
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Smart expiration tracking
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Budget optimization
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Premium integrations
                  </li>
                </ul>
                <Link href={user ? "/" : "/auth"}>
                  <Button className="w-full">Start 14-Day Trial</Button>
                </Link>
              </CardContent>
            </Card>

            {/* Family Plan */}
            <Card>
              <CardHeader>
                <CardTitle>Family</CardTitle>
                <div className="text-4xl font-bold text-orange-500">$14.99</div>
                <CardDescription>per month</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mb-6">Perfect for large families and meal planning enthusiasts</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    All Pro features
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Up to 6 family profiles
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Nutritional analysis
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Dietary restriction support
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Advanced meal planning
                  </li>
                  <li className="flex items-center">
                    <span className="text-orange-500 mr-2">✓</span>
                    Priority customer support
                  </li>
                </ul>
                <Link href={user ? "/" : "/auth"}>
                  <Button variant="outline" className="w-full">Start 14-Day Trial</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-[#FFF8F0]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about Pantry Pal</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-orange-500 mb-2">How does the 14-day free trial work?</h4>
                <p className="text-gray-600">Your free trial gives you full access to all Pro plan features for 14 days. No credit card required to start. If you choose to continue, you'll be asked to select a plan and enter payment details.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-orange-500 mb-2">Can I change plans later?</h4>
                <p className="text-gray-600">Yes! You can upgrade, downgrade, or cancel your plan at any time. Changes to your subscription take effect at the start of your next billing cycle.</p>
              </div>
            </div>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-orange-500 mb-2">How does Pantry Pal track my inventory?</h4>
                <p className="text-gray-600">You can add items manually, scan receipts, or use our barcode scanner. The app tracks expiration dates and automatically updates your inventory as you use ingredients in your meals.</p>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-orange-500 mb-2">Which grocery delivery services do you integrate with?</h4>
                <p className="text-gray-600">We currently integrate with Instacart, Amazon Fresh, Walmart Grocery, Kroger, Shipt, and several local services. New integrations are added regularly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
} 