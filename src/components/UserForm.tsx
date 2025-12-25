import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Target, MapPin, Activity, Plus, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { UserDetails, FitnessPlan } from '../types';
import { generateFitnessPlan } from '../lib/api';
import { saveFitnessPlan } from '../lib/storage';

const userDetailsSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.number().min(16, 'Age must be at least 16').max(100, 'Age must be less than 100'),
  gender: z.enum(['male', 'female', 'other']),
  height: z.number().min(120, 'Height must be at least 120cm').max(250, 'Height must be less than 250cm'),
  weight: z.number().min(30, 'Weight must be at least 30kg').max(300, 'Weight must be less than 300kg'),
  fitnessGoal: z.enum(['weight_loss', 'muscle_gain', 'maintain', 'endurance', 'strength']),
  fitnessLevel: z.enum(['beginner', 'intermediate', 'advanced']),
  workoutLocation: z.enum(['home', 'gym', 'outdoor']),
  dietaryPreference: z.enum(['vegetarian', 'non_vegetarian', 'vegan', 'keto', 'paleo']),
  planDays: z.number().min(1, 'Plan must be at least 1 day').max(30, 'Plan cannot exceed 30 days'),
  medicalHistory: z.string().optional(),
  stressLevel: z.enum(['low', 'moderate', 'high']).optional(),
  sleepHours: z.number().min(4).max(12).optional(),
  waterIntake: z.number().min(1).max(5).optional(),
});

interface UserFormProps {
  onPlanGenerated: (plan: FitnessPlan) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const UserForm: React.FC<UserFormProps> = ({ onPlanGenerated, isLoading, setIsLoading }) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UserDetails>({
    resolver: zodResolver(userDetailsSchema),
    defaultValues: {
      gender: 'male',
      fitnessGoal: 'weight_loss',
      fitnessLevel: 'beginner',
      workoutLocation: 'home',
      dietaryPreference: 'non_vegetarian',
      planDays: 7,
      stressLevel: 'moderate',
    },
  });

  const onSubmit = async (data: UserDetails) => {
    setIsLoading(true);
    try {
      const aiResponse = await generateFitnessPlan(data);
      
      const plan: FitnessPlan = {
        id: `plan-${Date.now()}`,
        createdAt: new Date(),
        userDetails: data,
        workoutPlan: aiResponse.workoutPlan,
        dietPlan: aiResponse.dietPlan,
        tips: aiResponse.tips,
        motivation: aiResponse.motivation,
      };

      saveFitnessPlan(plan);
      onPlanGenerated(plan);
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate plan. Please check your API keys and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formSections = [
    {
      title: 'Personal Information',
      icon: User,
      fields: ['name', 'age', 'gender', 'height', 'weight'],
    },
    {
      title: 'Fitness Goals',
      icon: Target,
      fields: ['fitnessGoal', 'fitnessLevel', 'planDays'],
    },
    {
      title: 'Preferences',
      icon: MapPin,
      fields: ['workoutLocation', 'dietaryPreference'],
    },
    {
      title: 'Additional Information',
      icon: Plus,
      fields: ['medicalHistory', 'stressLevel', 'sleepHours', 'waterIntake'],
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.8 }}
      className="max-w-4xl mx-auto"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          {formSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, x: sectionIndex % 2 === 0 ? -50 : 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 1 + sectionIndex * 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <section.icon className="h-5 w-5 text-primary" />
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.fields.map((fieldName) => {
                    const field = fieldName as keyof UserDetails;
                    return (
                      <div key={field} className="space-y-2">
                        <Label htmlFor={field} className="capitalize">
                          {field === 'planDays' ? 'Plan Duration' : field.replace(/([A-Z])/g, ' $1').toLowerCase()}
                          {['name', 'age', 'height', 'weight', 'planDays'].includes(field) && ' *'}
                        </Label>
                        
                        {field === 'gender' && (
                          <select
                            {...register(field)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                          </select>
                        )}
                        
                        {field === 'fitnessGoal' && (
                          <select
                            {...register(field)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="weight_loss">Weight Loss</option>
                            <option value="muscle_gain">Muscle Gain</option>
                            <option value="maintain">Maintain Weight</option>
                            <option value="endurance">Build Endurance</option>
                            <option value="strength">Build Strength</option>
                          </select>
                        )}
                        
                        {field === 'fitnessLevel' && (
                          <select
                            {...register(field)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="beginner">Beginner</option>
                            <option value="intermediate">Intermediate</option>
                            <option value="advanced">Advanced</option>
                          </select>
                        )}
                        
                        {field === 'planDays' && (
                          <select
                            {...register(field, { valueAsNumber: true })}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value={1}>1 Day</option>
                            <option value={3}>3 Days</option>
                            <option value={7}>7 Days (1 Week)</option>
                            <option value={14}>14 Days (2 Weeks)</option>
                            <option value={21}>21 Days (3 Weeks)</option>
                            <option value={30}>30 Days (1 Month)</option>
                          </select>
                        )}
                        
                        {field === 'workoutLocation' && (
                          <select
                            {...register(field)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="home">Home</option>
                            <option value="gym">Gym</option>
                            <option value="outdoor">Outdoor</option>
                          </select>
                        )}
                        
                        {field === 'dietaryPreference' && (
                          <select
                            {...register(field)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="vegetarian">Vegetarian</option>
                            <option value="non_vegetarian">Non-Vegetarian</option>
                            <option value="vegan">Vegan</option>
                            <option value="keto">Keto</option>
                            <option value="paleo">Paleo</option>
                          </select>
                        )}
                        
                        {field === 'stressLevel' && (
                          <select
                            {...register(field)}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          >
                            <option value="">Select stress level</option>
                            <option value="low">Low</option>
                            <option value="moderate">Moderate</option>
                            <option value="high">High</option>
                          </select>
                        )}
                        
                        {field === 'medicalHistory' && (
                          <textarea
                            {...register(field)}
                            placeholder="Any medical conditions, injuries, or limitations..."
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
                          />
                        )}
                        
                        {!['gender', 'fitnessGoal', 'fitnessLevel', 'planDays', 'workoutLocation', 'dietaryPreference', 'stressLevel', 'medicalHistory'].includes(field) && (
                          <Input
                            {...register(field, { valueAsNumber: ['age', 'height', 'weight', 'sleepHours', 'waterIntake'].includes(field) })}
                            type={['age', 'height', 'weight', 'sleepHours', 'waterIntake'].includes(field) ? 'number' : 'text'}
                            placeholder={getPlaceholder(field)}
                          />
                        )}
                        
                        {errors[field] && (
                          <p className="text-sm text-destructive">
                            {errors[field]?.message}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.4 }}
          className="flex justify-center"
        >
          <Button
            type="submit"
            size="lg"
            disabled={isLoading}
            className="min-w-[200px] fitness-gradient"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Plan...
              </>
            ) : (
              <>
                <Activity className="mr-2 h-4 w-4" />
                Generate My Plan
              </>
            )}
          </Button>
        </motion.div>
      </form>
    </motion.div>
  );
};

function getPlaceholder(field: keyof UserDetails): string {
  const placeholders: Record<string, string> = {
    name: 'Enter your full name',
    age: '25',
    height: '175',
    weight: '70',
    sleepHours: '8',
    waterIntake: '2.5',
  };
  return placeholders[field] || '';
}

export default UserForm;