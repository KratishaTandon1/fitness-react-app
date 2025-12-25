import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Target, 
  ChevronDown, 
  ChevronRight, 
  Image as ImageIcon,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { WorkoutPlan } from '../types';
import { generateImage } from '../lib/api';

interface WorkoutPlanDisplayProps {
  workoutPlan: WorkoutPlan;
}

const WorkoutPlanDisplay: React.FC<WorkoutPlanDisplayProps> = ({ workoutPlan }) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set([workoutPlan.workouts[0]?.day]));
  const [exerciseImages, setExerciseImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});

  // Auto-generate images for all exercises when component mounts
  useEffect(() => {
    const generateAllImages = async () => {
      const uniqueExercises = new Set<string>();
      
      // Collect all unique exercise names
      workoutPlan.workouts.forEach(day => {
        day.exercises.forEach(exercise => uniqueExercises.add(exercise.name));
      });
      
      // Generate images for unique exercises with a small delay between requests
      for (const exerciseName of uniqueExercises) {
        setTimeout(() => {
          handleGenerateImage(exerciseName);
        }, Math.random() * 2000); // Random delay up to 2 seconds to avoid overwhelming the API
      }
    };
    
    generateAllImages();
  }, [workoutPlan]);

  const toggleDay = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const handleGenerateImage = async (exerciseName: string) => {
    const imageKey = exerciseName.toLowerCase().replace(/\s+/g, '-');
    if (exerciseImages[imageKey] || loadingImages[imageKey]) return;

    setLoadingImages(prev => ({ ...prev, [imageKey]: true }));
    
    try {
      const imageUrl = await generateImage(`${exerciseName} exercise fitness gym demonstration realistic`);
      setExerciseImages(prev => {
        const newState = { ...prev, [imageKey]: imageUrl };
        return newState;
      });
    } catch (error) {
      console.error('🏋️ Error generating exercise image:', error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [imageKey]: false }));
    }
  };

  const getImageKey = (exerciseName: string) => exerciseName.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="text-lg font-semibold">{workoutPlan.duration}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Days per Week</p>
            <p className="text-lg font-semibold">{workoutPlan.daysPerWeek} days</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Focus</p>
            <p className="text-lg font-semibold">{workoutPlan.title}</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Workouts */}
      <div className="space-y-4">
        {workoutPlan.workouts.map((dayWorkout, index) => (
          <motion.div
            key={dayWorkout.day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleDay(dayWorkout.day)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-primary font-bold">{dayWorkout.day}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-base font-medium">{dayWorkout.focus}</span>
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">{dayWorkout.duration}</span>
                    {expandedDays.has(dayWorkout.day) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {expandedDays.has(dayWorkout.day) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="space-y-6">
                      {/* Warm-up */}
                      {dayWorkout.warmup && dayWorkout.warmup.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-orange-600 mb-2 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Warm-up
                          </h4>
                          <div className="space-y-1">
                            {dayWorkout.warmup.map((warmupExercise, idx) => (
                              <p key={idx} className="text-sm text-muted-foreground">• {warmupExercise}</p>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Main Exercises */}
                      <div>
                        <h4 className="font-semibold text-primary mb-4 flex items-center">
                          <Target className="h-4 w-4 mr-1" />
                          Main Exercises
                        </h4>
                        <div className="space-y-4">
                          {dayWorkout.exercises.map((exercise, exerciseIndex) => (
                            <motion.div
                              key={exercise.name}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: exerciseIndex * 0.1 }}
                              className="exercise-item"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h5 className="font-semibold">{exercise.name}</h5>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleGenerateImage(exercise.name)}
                                      disabled={loadingImages[getImageKey(exercise.name)]}
                                      className="h-6 w-6 p-0"
                                    >
                                      <ImageIcon className="h-3 w-3" />
                                    </Button>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                                    <div>
                                      <span className="text-muted-foreground">Sets:</span>
                                      <span className="ml-1 font-medium">{exercise.sets}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Reps:</span>
                                      <span className="ml-1 font-medium">{exercise.reps}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Rest:</span>
                                      <span className="ml-1 font-medium">{exercise.restTime}</span>
                                    </div>
                                    {exercise.equipment && (
                                      <div>
                                        <span className="text-muted-foreground">Equipment:</span>
                                        <span className="ml-1 font-medium">{exercise.equipment}</span>
                                      </div>
                                    )}
                                  </div>

                                  {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-2">
                                      {exercise.muscleGroups.map((muscle) => (
                                        <span
                                          key={muscle}
                                          className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full"
                                        >
                                          {muscle}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {exercise.instructions && (
                                    <div className="mt-2">
                                      <details className="text-sm">
                                        <summary className="cursor-pointer text-muted-foreground hover:text-foreground flex items-center">
                                          <Info className="h-3 w-3 mr-1" />
                                          Instructions
                                        </summary>
                                        <p className="mt-1 text-muted-foreground">{exercise.instructions}</p>
                                      </details>
                                    </div>
                                  )}
                                </div>

                                {/* Exercise Image */}
                                {exerciseImages[getImageKey(exercise.name)] && (
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="ml-4 flex-shrink-0"
                                  >
                                    <img
                                      src={exerciseImages[getImageKey(exercise.name)]}
                                      alt={exercise.name}
                                      className="w-20 h-20 object-cover rounded-md border"
                                      onError={(e) => {
                                        // If image fails to load, hide it
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = 'none';
                                      }}
                                    />
                                  </motion.div>
                                )}

                                {loadingImages[getImageKey(exercise.name)] && (
                                  <div className="ml-4 flex-shrink-0 w-20 h-20 bg-muted rounded-md flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
                                  </div>
                                )}
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Cool-down */}
                      {dayWorkout.cooldown && dayWorkout.cooldown.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-green-600 mb-2 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Cool-down
                          </h4>
                          <div className="space-y-1">
                            {dayWorkout.cooldown.map((cooldownExercise, idx) => (
                              <p key={idx} className="text-sm text-muted-foreground">• {cooldownExercise}</p>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default WorkoutPlanDisplay;