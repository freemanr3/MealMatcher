import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, TrendingUp, AlertCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useMealPlan } from '@/hooks/use-meal-plan';

interface BudgetTrackerProps {
  className?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showWarning?: boolean;
}

export function BudgetTracker({ 
  className = '', 
  variant = 'default',
  showWarning = true 
}: BudgetTrackerProps) {
  const { budget, spent, remaining, budgetPercentage, mealPlan } = useMealPlan();
  const [isAnimating, setIsAnimating] = useState(false);
  const [prevSpent, setPrevSpent] = useState(spent);
  
  // Detect changes in spent amount to trigger animation
  useEffect(() => {
    if (spent !== prevSpent) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 2000);
      setPrevSpent(spent);
      return () => clearTimeout(timer);
    }
  }, [spent, prevSpent]);
  
  // Calculate progress color based on percentage
  const getProgressColor = () => {
    if (budgetPercentage > 90) return 'bg-red-500';
    if (budgetPercentage > 75) return 'bg-orange-500'; 
    return 'bg-green-600';
  };
  
  // Handle different variants
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <DollarSign className="h-4 w-4 text-green-600" />
        <div className="w-full max-w-24 bg-muted rounded-full h-2 overflow-hidden">
          <motion.div 
            className={`h-full ${getProgressColor()}`}
            initial={{ width: '0%' }}
            animate={{ width: `${budgetPercentage}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <span className="text-xs font-medium">${spent.toFixed(0)}/${budget.toFixed(0)}</span>
      </div>
    );
  }
  
  if (variant === 'detailed') {
    return (
      <div className={`bg-white rounded-lg p-4 shadow-sm ${className}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-medium">Meal Plan Budget</h3>
            <p className="text-sm text-muted-foreground">Track your meal planning costs</p>
          </div>
          <div className="bg-green-50 p-2 rounded-full">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
        </div>
        
        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Spent</span>
            <div className="flex items-center gap-1">
              <motion.span
                key={spent.toString()}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-sm font-bold"
              >
                ${spent.toFixed(2)}
              </motion.span>
              <span className="text-sm text-muted-foreground">/ ${budget.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="relative h-2.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div 
              className={`absolute inset-y-0 left-0 ${getProgressColor()}`}
              initial={{ width: `${(prevSpent / budget) * 100}%` }}
              animate={{ width: `${budgetPercentage}%` }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>Remaining</span>
            </div>
            <span className="font-bold">${remaining.toFixed(2)}</span>
          </div>
          
          <div className="bg-gray-50 p-2 rounded-lg">
            <div className="flex items-center gap-1 text-muted-foreground mb-1">
              <DollarSign className="h-3.5 w-3.5" />
              <span>Per Meal Avg</span>
            </div>
            <span className="font-bold">${(spent / (spent > 0 ? Math.max(1, mealPlan.length) : 1)).toFixed(2)}</span>
          </div>
        </div>
        
        {showWarning && budgetPercentage > 90 && (
          <div className="mt-4 bg-red-50 p-2 rounded-lg flex items-center gap-2 text-xs text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>You're getting close to your budget limit!</span>
          </div>
        )}
        
        {/* Animation for budget changes */}
        <AnimatePresence>
          {isAnimating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 right-4 bg-green-100 px-3 py-1 rounded-full text-xs text-green-700 font-medium"
            >
              Budget updated!
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }
  
  // Default variant
  return (
    <div className={`bg-white rounded-lg p-3 shadow-sm ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">Meal Plan Budget</span>
        <motion.span
          key={spent.toString()}
          initial={{ scale: 1 }}
          animate={isAnimating ? { scale: [1, 1.1, 1] } : { scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-sm font-medium"
        >
          ${spent.toFixed(2)} / ${budget.toFixed(2)}
        </motion.span>
      </div>
      
      <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
        <motion.div 
          className={`absolute inset-y-0 left-0 ${getProgressColor()}`}
          initial={{ width: `${(prevSpent / budget) * 100}%` }}
          animate={{ width: `${budgetPercentage}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
        />
      </div>
      
      <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
        <span>Remaining: ${remaining.toFixed(2)}</span>
        <span>{budgetPercentage.toFixed(0)}%</span>
      </div>
    </div>
  );
}
