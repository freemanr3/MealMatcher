import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BudgetTrackerProps {
  budget: number;
  spent: number;
}

export function BudgetTracker({ budget, spent }: BudgetTrackerProps) {
  const percentage = (spent / budget) * 100;
  const remaining = budget - spent;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between text-sm">
            <div>
              <p className="text-muted-foreground">Spent</p>
              <p className="font-medium">${spent.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Remaining</p>
              <p className="font-medium">${remaining.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
