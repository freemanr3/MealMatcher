import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Utensils, Calendar, Settings } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white p-6">
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-orange-600">Meal Matcher</h1>
          <p className="text-muted-foreground">
            Swipe right on meals you love, create your perfect meal plan
          </p>
        </div>

        <div className="grid gap-4">
          <Link href="/swipe">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="flex items-center gap-4 p-6">
                <Utensils className="w-8 h-8 text-orange-500" />
                <div>
                  <h2 className="font-semibold">Start Swiping</h2>
                  <p className="text-sm text-muted-foreground">
                    Discover meals that match your preferences
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/planner">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="flex items-center gap-4 p-6">
                <Calendar className="w-8 h-8 text-orange-500" />
                <div>
                  <h2 className="font-semibold">Meal Planner</h2>
                  <p className="text-sm text-muted-foreground">
                    View and manage your meal schedule
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/preferences">
            <Card className="cursor-pointer hover:shadow-lg transition-shadow">
              <CardContent className="flex items-center gap-4 p-6">
                <Settings className="w-8 h-8 text-orange-500" />
                <div>
                  <h2 className="font-semibold">Preferences</h2>
                  <p className="text-sm text-muted-foreground">
                    Update your dietary preferences and budget
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
