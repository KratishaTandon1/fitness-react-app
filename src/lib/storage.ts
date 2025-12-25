import type { FitnessPlan, MotivationQuote } from '../types';

export const storageKeys = {
  FITNESS_PLANS: 'fitness_plans',
  CURRENT_PLAN: 'current_plan',
  THEME: 'theme',
  USER_PREFERENCES: 'user_preferences'
} as const;

export const saveFitnessPlan = (plan: FitnessPlan): void => {
  try {
    const existingPlans = getFitnessPlans();
    const updatedPlans = [plan, ...existingPlans.filter(p => p.id !== plan.id)];
    localStorage.setItem(storageKeys.FITNESS_PLANS, JSON.stringify(updatedPlans));
    localStorage.setItem(storageKeys.CURRENT_PLAN, JSON.stringify(plan));
  } catch (error) {
    console.error('Error saving fitness plan:', error);
  }
};

export const getFitnessPlans = (): FitnessPlan[] => {
  try {
    const plans = localStorage.getItem(storageKeys.FITNESS_PLANS);
    return plans ? JSON.parse(plans) : [];
  } catch (error) {
    console.error('Error retrieving fitness plans:', error);
    return [];
  }
};

export const getCurrentPlan = (): FitnessPlan | null => {
  try {
    const plan = localStorage.getItem(storageKeys.CURRENT_PLAN);
    return plan ? JSON.parse(plan) : null;
  } catch (error) {
    console.error('Error retrieving current plan:', error);
    return null;
  }
};

export const deleteFitnessPlan = (planId: string): void => {
  try {
    const existingPlans = getFitnessPlans();
    const updatedPlans = existingPlans.filter(p => p.id !== planId);
    localStorage.setItem(storageKeys.FITNESS_PLANS, JSON.stringify(updatedPlans));
    
    const currentPlan = getCurrentPlan();
    if (currentPlan?.id === planId) {
      localStorage.removeItem(storageKeys.CURRENT_PLAN);
    }
  } catch (error) {
    console.error('Error deleting fitness plan:', error);
  }
};

export const saveTheme = (theme: string): void => {
  try {
    localStorage.setItem(storageKeys.THEME, theme);
  } catch (error) {
    console.error('Error saving theme:', error);
  }
};

export const getTheme = (): string => {
  try {
    return localStorage.getItem(storageKeys.THEME) || 'system';
  } catch (error) {
    console.error('Error retrieving theme:', error);
    return 'system';
  }
};

export const generateMotivationQuotes = (): MotivationQuote[] => {
  return [
    {
      text: "The only bad workout is the one that didn't happen.",
      author: "Unknown",
      category: "workout"
    },
    {
      text: "Your body can do it. It's your mind you have to convince.",
      author: "Unknown", 
      category: "motivation"
    },
    {
      text: "Abs are made in the kitchen, not just in the gym.",
      author: "Unknown",
      category: "diet"
    },
    {
      text: "Progress, not perfection.",
      author: "Unknown",
      category: "general"
    },
    {
      text: "A healthy outside starts from the inside.",
      author: "Robert Urich",
      category: "general"
    },
    {
      text: "Exercise is a celebration of what your body can do, not a punishment for what you ate.",
      author: "Unknown",
      category: "workout"
    }
  ];
};