import React, { useState } from 'react';
import { Save, Check, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import type { FitnessPlan } from '../types';
import { saveFitnessPlan } from '../lib/storage';

interface SavePlanProps {
  plan: FitnessPlan;
}

const SavePlan: React.FC<SavePlanProps> = ({ plan }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);

  // Check if plan is already saved on component mount
  React.useEffect(() => {
    const savedPlans = JSON.parse(localStorage.getItem('fitness_plans') || '[]');
    const planExists = savedPlans.some((savedPlan: FitnessPlan) => savedPlan.id === plan.id);
    setIsAlreadySaved(planExists);
  }, [plan.id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save plan to local storage
      saveFitnessPlan(plan);
      
      // Show success state
      setIsSaved(true);
      setIsAlreadySaved(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan to local storage. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Button
      onClick={handleSave}
      disabled={isSaving}
      variant={isSaved ? "default" : isAlreadySaved ? "secondary" : "outline"}
      className={`flex items-center space-x-2 transition-all duration-200 ${
        isSaved ? 'bg-green-600 hover:bg-green-700' : ''
      }`}
    >
      {isSaving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isSaved ? (
        <Check className="h-4 w-4" />
      ) : (
        <Save className="h-4 w-4" />
      )}
      <span>
        {isSaving ? 'Saving...' : isSaved ? 'Saved!' : isAlreadySaved ? 'Update Plan' : 'Save Plan'}
      </span>
    </Button>
  );
};

export default SavePlan;