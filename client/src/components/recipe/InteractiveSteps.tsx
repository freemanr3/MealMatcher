import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { parseInstructionsFromHtml, parseInstructionsIntoSteps } from '@/lib/recipeUtils';
import { Check } from 'lucide-react';

interface Step {
  id: number;
  text: string;
}

interface InteractiveStepsProps {
  instructions: string;
  analyzedInstructions?: any[];
}

export const InteractiveSteps: React.FC<InteractiveStepsProps> = ({ 
  instructions, 
  analyzedInstructions 
}) => {
  // Parse instructions into steps
  const getSteps = (): Step[] => {
    // First try to use analyzedInstructions if available
    if (analyzedInstructions && analyzedInstructions.length > 0 && analyzedInstructions[0].steps) {
      return analyzedInstructions[0].steps.map((step: any) => ({
        id: step.number,
        text: step.step
      }));
    }
    
    // Otherwise parse from HTML instructions
    if (instructions) {
      return parseInstructionsFromHtml(instructions);
    }
    
    return [];
  };

  const steps = getSteps();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  
  // Calculate progress percentage
  const progressPercentage = steps.length > 0 
    ? Math.round((completedSteps.length / steps.length) * 100) 
    : 0;
  
  const handleToggleStep = (stepId: number) => {
    setCompletedSteps(prev => {
      if (prev.includes(stepId)) {
        return prev.filter(id => id !== stepId);
      } else {
        return [...prev, stepId];
      }
    });
    
    // Auto advance to next step
    if (stepId === currentStep && currentStep < steps.length) {
      setCurrentStep(stepId + 1);
    }
  };
  
  if (steps.length === 0) {
    return <p className="text-muted-foreground">No detailed instructions provided for this recipe.</p>;
  }
  
  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>{completedSteps.length} of {steps.length} steps completed</span>
          <span className="font-medium">{progressPercentage}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      {/* Steps list */}
      <ol className="space-y-4">
        {steps.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;
          
          return (
            <motion.li
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`p-4 rounded-lg transition-all ${
                isCompleted 
                  ? 'bg-green-50 border border-green-100' 
                  : isCurrent 
                    ? 'bg-orange-50 border border-orange-100 shadow-sm' 
                    : 'bg-white border'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Step number or checkbox */}
                <div className="mt-0.5">
                  <Checkbox 
                    id={`step-${step.id}`}
                    checked={isCompleted}
                    onCheckedChange={() => handleToggleStep(step.id)}
                    className={`h-6 w-6 rounded-full ${
                      isCompleted ? 'bg-green-500 text-white border-green-500' : ''
                    }`}
                  />
                </div>
                
                {/* Step content */}
                <div className="flex-1">
                  <label 
                    htmlFor={`step-${step.id}`}
                    className={`block text-base leading-relaxed cursor-pointer ${
                      isCompleted ? 'text-muted-foreground' : 'text-foreground'
                    }`}
                  >
                    <span className={isCompleted ? 'line-through decoration-2 decoration-green-500/50' : ''}>
                      {step.text}
                    </span>
                    
                    {/* Ingredients used in this step (if available from analyzedInstructions) */}
                    {analyzedInstructions && 
                     analyzedInstructions[0]?.steps[step.id - 1]?.ingredients?.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {analyzedInstructions[0].steps[step.id - 1].ingredients.map((ing: any) => (
                          <span 
                            key={ing.id} 
                            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-orange-50 text-orange-700"
                          >
                            {ing.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </label>
                </div>
                
                {/* Completion indicator */}
                {isCompleted && (
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="flex-shrink-0 rounded-full bg-green-500 p-1"
                  >
                    <Check className="h-4 w-4 text-white" />
                  </motion.div>
                )}
              </div>
            </motion.li>
          );
        })}
      </ol>
      
      {/* Completion message */}
      {completedSteps.length === steps.length && steps.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 border border-green-100 rounded-lg text-center"
        >
          <p className="font-medium text-green-800">All steps completed! Enjoy your meal! 🎉</p>
        </motion.div>
      )}
    </div>
  );
}; 