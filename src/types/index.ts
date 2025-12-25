export interface UserDetails {
  name: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  height: number; // in cm
  weight: number; // in kg
  fitnessGoal: 'weight_loss' | 'muscle_gain' | 'maintain' | 'endurance' | 'strength';
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  workoutLocation: 'home' | 'gym' | 'outdoor';
  dietaryPreference: 'vegetarian' | 'non_vegetarian' | 'vegan' | 'keto' | 'paleo';
  planDays: number; // number of days for the plan
  medicalHistory?: string;
  stressLevel?: 'low' | 'moderate' | 'high';
  sleepHours?: number;
  waterIntake?: number; // in liters
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  restTime: string;
  instructions?: string;
  muscleGroups: string[];
  equipment?: string;
}

export interface DayWorkout {
  day: string;
  focus: string;
  warmup: string[];
  exercises: Exercise[];
  cooldown: string[];
  duration: string;
}

export interface WorkoutPlan {
  title: string;
  duration: string;
  daysPerWeek: number;
  workouts: DayWorkout[];
}

export interface Meal {
  name: string;
  ingredients: string[];
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  instructions?: string;
}

export interface DayMeals {
  day: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal[];
}

export interface DietPlan {
  title: string;
  duration: string;
  dailyCalories: number;
  macroSplit: {
    protein: number;
    carbs: number;
    fats: number;
  };
  meals: DayMeals[];
}

export interface FitnessPlan {
  id: string;
  createdAt: Date;
  userDetails: UserDetails;
  workoutPlan: WorkoutPlan;
  dietPlan: DietPlan;
  tips: string[];
  motivation: string;
}

export interface MotivationQuote {
  text: string;
  author?: string;
  category: 'workout' | 'diet' | 'general' | 'motivation';
}

export type Theme = 'light' | 'dark' | 'system';