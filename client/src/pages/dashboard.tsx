import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChefHat, Utensils, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function DashboardPage() {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Welcome to Pantry Pal</h1>
        <p className="text-xl text-muted-foreground">
          Your personal recipe discovery and meal planning assistant
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Card>
          <CardHeader>
            <ChefHat className="h-8 w-8 mb-2 text-orange-500" />
            <CardTitle>Discover Recipes</CardTitle>
            <CardDescription>
              Find delicious recipes based on your available ingredients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/discover">
              <Button className="w-full">Start Discovering</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Utensils className="h-8 w-8 mb-2 text-orange-500" />
            <CardTitle>My Ingredients</CardTitle>
            <CardDescription>
              Manage your pantry and available ingredients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/ingredients">
              <Button className="w-full">Manage Ingredients</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Calendar className="h-8 w-8 mb-2 text-orange-500" />
            <CardTitle>Meal Planner</CardTitle>
            <CardDescription>
              Plan your meals and track your budget
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/meal-planner">
              <Button className="w-full">View Meal Plan</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 