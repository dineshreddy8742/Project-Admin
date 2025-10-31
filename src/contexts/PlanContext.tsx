import { createContext, useContext, useState, ReactNode } from 'react';

interface PlanContextType {
  currentPlan: 'free' | 'premium' | 'enterprise';
  setPlan: (plan: 'free' | 'premium' | 'enterprise') => void;
  hasFeatureAccess: (feature: string) => boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

export const usePlan = () => {
  const context = useContext(PlanContext);
  if (context === undefined) {
    throw new Error('usePlan must be used within a PlanProvider');
  }
  return context;
};

interface PlanProviderProps {
  children: ReactNode;
}

export const PlanProvider: React.FC<PlanProviderProps> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<'free' | 'premium' | 'enterprise'>('premium');

  const setPlan = (plan: 'free' | 'premium' | 'enterprise') => {
    setCurrentPlan(plan);
  };

  const hasFeatureAccess = (feature: string): boolean => {
    const featureAccess = {
      free: ['disease-detector', 'weather', 'market-trends', 'government-schemes', 'ai-assistant', 'grocery-marketplace', 'cold-storage'],
      premium: ['crop-monitor', 'disease-detector', 'weather', 'market-trends', 'government-schemes', 'ai-assistant', 'grocery-marketplace', 'cold-storage'],
      enterprise: ['crop-monitor', 'disease-detector', 'weather', 'market-trends', 'government-schemes', 'ai-assistant', 'grocery-marketplace', 'cold-storage', 'advanced-analytics']
    };

    const planFeatures = featureAccess[currentPlan];
    return planFeatures ? planFeatures.includes(feature) : false;
  };

  return (
    <PlanContext.Provider
      value={{
        currentPlan,
        setPlan,
        hasFeatureAccess
      }}
    >
      {children}
    </PlanContext.Provider>
  );
};