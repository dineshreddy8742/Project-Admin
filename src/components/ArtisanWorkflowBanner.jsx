import React, { useState } from 'react';
import { CheckCircle, Edit, Sparkles, BarChart2, Globe } from 'lucide-react';

const STEPS = [
  { label: 'Add Product', icon: Edit },
  { label: 'Tell Your Story', icon: Globe },
  { label: 'Generate Promotions', icon: Sparkles },
  { label: 'Review Insights', icon: BarChart2 },
  { label: 'Go Live', icon: CheckCircle },
];

const ArtisanWorkflowBanner = ({ initialStep = 0, onStepClick }) => {
  const [activeStep, setActiveStep] = useState(initialStep);

  const handleStep = (idx) => {
    setActiveStep(idx);
    if (onStepClick) onStepClick(idx);
  };

  return (
    <div className="flex flex-wrap gap-1 md:gap-4 justify-center items-center bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-8 shadow">
      {STEPS.map((step, idx) => {
        const isActive = idx === activeStep;
        const isComplete = idx < activeStep;
        return (
          <button
            key={step.label}
            aria-label={step.label}
            className={`flex flex-col items-center px-3 py-2 min-w-10 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-primary transition border-2 ${
              isActive ? 'border-primary bg-primary/10' : isComplete ? 'border-green-400 bg-green-50' : 'border-gray-200 bg-white hover:border-primary'
            }`}
            onClick={() => handleStep(idx)}
            tabIndex={0}
          >
            <step.icon size={26} className={isComplete ? 'text-green-500' : isActive ? 'text-primary' : 'text-gray-400'} />
            <span className={`text-xs mt-1 ${isActive ? 'font-bold text-primary' : isComplete ? 'text-green-600' : 'text-gray-500'}`}>{step.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ArtisanWorkflowBanner;
