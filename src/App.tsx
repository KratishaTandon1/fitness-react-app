import React, { useState } from 'react';
import { motion } from 'framer-motion';
import UserForm from './components/UserForm';
import PlanDisplay from './components/PlanDisplay';
import Header from './components/Header';
import MotivationSection from './components/MotivationSection';
import SavedPlans from './components/SavedPlans';
import { ThemeProvider } from './components/ThemeProvider';
import type { FitnessPlan } from './types';
import { getCurrentPlan, saveFitnessPlan } from './lib/storage';

const App: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<FitnessPlan | null>(() => getCurrentPlan());
  const [isLoading, setIsLoading] = useState(false);
  const [showSavedPlans, setShowSavedPlans] = useState(false);

  const handlePlanGenerated = (plan: FitnessPlan) => {
    setCurrentPlan(plan);
  };

  const handleNewPlan = () => {
    setCurrentPlan(null);
  };

  const handleViewSavedPlans = () => {
    setShowSavedPlans(true);
  };

  const handleCloseSavedPlans = () => {
    setShowSavedPlans(false);
  };

  const handleLoadSavedPlan = (plan: FitnessPlan) => {
    // Save the loaded plan as current plan
    saveFitnessPlan(plan);
    setCurrentPlan(plan);
  };

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Header onNewPlan={handleNewPlan} onViewSavedPlans={handleViewSavedPlans} />
        
        <main className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {!currentPlan ? (
              <div className="space-y-8">
                <div className="text-center space-y-4">
                  <motion.h1 
                    className="text-4xl md:text-6xl font-bold fitness-gradient bg-clip-text text-transparent"
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                  >
                    AI Fitness Coach
                  </motion.h1>
                  <motion.p 
                    className="text-xl text-muted-foreground max-w-2xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                  >
                    Get personalized workout and diet plans powered by AI, tailored specifically to your goals and lifestyle.
                  </motion.p>
                </div>
                
                <MotivationSection />
                
                <UserForm 
                  onPlanGenerated={handlePlanGenerated}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </div>
            ) : (
              <PlanDisplay 
                plan={currentPlan} 
                onRegeneratePlan={handleNewPlan}
              />
            )}
          </motion.div>
        </main>

        {/* Saved Plans Modal */}
        <SavedPlans 
          isOpen={showSavedPlans}
          onClose={handleCloseSavedPlans}
          onLoadPlan={handleLoadSavedPlan}
        />
      </div>
    </ThemeProvider>
  );
};

export default App;
