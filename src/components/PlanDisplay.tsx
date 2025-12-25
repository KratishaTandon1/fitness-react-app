import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Target, 
  Utensils, 
  RotateCcw
} from 'lucide-react';
import { Button } from './ui/button';
import type { FitnessPlan } from '../types';
import WorkoutPlanDisplay from './WorkoutPlanDisplay';
import DietPlanDisplay from './DietPlanDisplay';
import TipsSection from './TipsSection';
import ExportToPDF from './ExportToPDF';
import VoiceReader from './VoiceReader';
import SavePlan from './SavePlan';

interface PlanDisplayProps {
  plan: FitnessPlan;
  onRegeneratePlan: () => void;
}

const PlanDisplay: React.FC<PlanDisplayProps> = ({ plan, onRegeneratePlan }) => {
  const [activeTab, setActiveTab] = useState<'workout' | 'diet' | 'tips'>('workout');

  const tabs = [
    { id: 'workout', label: 'Workout Plan', icon: Target },
    { id: 'diet', label: 'Diet Plan', icon: Utensils },
    { id: 'tips', label: 'Tips & Motivation', icon: Calendar },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header Section */}
      <div className="text-center space-y-4">
        <motion.h1
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          className="text-4xl font-bold fitness-gradient bg-clip-text text-transparent"
        >
          Your Personalized Fitness Plan
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-muted-foreground text-lg"
        >
          Customized for {plan.userDetails.name} • {plan.userDetails.fitnessGoal.replace('_', ' ')} • {plan.userDetails.fitnessLevel}
        </motion.p>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap justify-center gap-4"
      >
        <SavePlan plan={plan} />
        <ExportToPDF plan={plan} />
        <VoiceReader plan={plan} />
        <Button
          variant="outline"
          onClick={onRegeneratePlan}
          className="flex items-center space-x-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Generate New Plan</span>
        </Button>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <div className="flex bg-muted p-1 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-background shadow-sm text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="min-h-[600px]"
      >
        {activeTab === 'workout' && <WorkoutPlanDisplay workoutPlan={plan.workoutPlan} />}
        {activeTab === 'diet' && <DietPlanDisplay dietPlan={plan.dietPlan} />}
        {activeTab === 'tips' && (
          <TipsSection 
            tips={plan.tips} 
            motivation={plan.motivation}
            userDetails={plan.userDetails}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default PlanDisplay;