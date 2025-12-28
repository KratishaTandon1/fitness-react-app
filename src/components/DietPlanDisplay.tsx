import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Utensils, 
  TrendingUp, 
  ChevronDown, 
  ChevronRight, 
  Image as ImageIcon,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { DietPlan, Meal } from '../types';
import { generateImage } from '../lib/api';
import ImageModal from './ImageModal';

interface DietPlanDisplayProps {
  dietPlan: DietPlan;
}

const DietPlanDisplay: React.FC<DietPlanDisplayProps> = ({ dietPlan }) => {
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set([dietPlan.meals[0]?.day]));
  const [mealImages, setMealImages] = useState<Record<string, string>>({});
  const [loadingImages, setLoadingImages] = useState<Record<string, boolean>>({});
  const [modalImage, setModalImage] = useState<{ src: string; alt: string } | null>(null);

  // Auto-generate images for all meals when component mounts
  useEffect(() => {
    const generateAllImages = async () => {
      const uniqueMeals = new Set<string>();
      
      // Collect all unique meal names
      dietPlan.meals.forEach(day => {
        uniqueMeals.add(day.breakfast.name);
        uniqueMeals.add(day.lunch.name);
        uniqueMeals.add(day.dinner.name);
        day.snacks.forEach(snack => uniqueMeals.add(snack.name));
      });
      
      // Generate images for unique meals with a small delay between requests
      for (const mealName of uniqueMeals) {
        setTimeout(() => {
          handleGenerateImage(mealName);
        }, Math.random() * 2000); // Random delay up to 2 seconds to avoid overwhelming the API
      }
    };
    
    generateAllImages();
  }, [dietPlan]);

  const toggleDay = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const handleGenerateImage = async (mealName: string) => {
    const imageKey = mealName.toLowerCase().replace(/\s+/g, '-');
    if (mealImages[imageKey] || loadingImages[imageKey]) return;

    setLoadingImages(prev => ({ ...prev, [imageKey]: true }));
    
    try {
      const imageUrl = await generateImage(`${mealName} healthy food meal delicious professional food photography`);
      setMealImages(prev => {
        const newState = { ...prev, [imageKey]: imageUrl };
        return newState;
      });
    } catch (error) {
      console.error('🍽️ Error generating meal image:', error);
    } finally {
      setLoadingImages(prev => ({ ...prev, [imageKey]: false }));
    }
  };

  const getImageKey = (mealName: string) => mealName.toLowerCase().replace(/\s+/g, '-');

  const renderMeal = (meal: Meal, mealType: string, color: string) => {
    const imageKey = getImageKey(meal.name);
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="meal-item"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h5 className="font-semibold capitalize text-lg" style={{ color }}>
                {mealType}
              </h5>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleGenerateImage(meal.name)}
                disabled={loadingImages[imageKey]}
                className="h-6 w-6 p-0"
              >
                <ImageIcon className="h-3 w-3" />
              </Button>
            </div>
            
            <h6 className="font-medium mb-2">{meal.name}</h6>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-3">
              <div className="flex items-center space-x-1">
                <Zap className="h-3 w-3 text-orange-500" />
                <span className="text-muted-foreground">Calories:</span>
                <span className="font-medium">{meal.calories}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Protein:</span>
                <span className="ml-1 font-medium">{meal.protein}g</span>
              </div>
              <div>
                <span className="text-muted-foreground">Carbs:</span>
                <span className="ml-1 font-medium">{meal.carbs}g</span>
              </div>
              <div>
                <span className="text-muted-foreground">Fats:</span>
                <span className="ml-1 font-medium">{meal.fats}g</span>
              </div>
            </div>

            {meal.ingredients && meal.ingredients.length > 0 && (
              <div className="mb-2">
                <p className="text-sm font-medium text-muted-foreground mb-1">Ingredients:</p>
                <div className="flex flex-wrap gap-1">
                  {meal.ingredients.map((ingredient, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-secondary/80 text-secondary-foreground px-2 py-1 rounded-full"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {meal.instructions && (
              <div className="mt-2">
                <details className="text-sm">
                  <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                    Preparation Instructions
                  </summary>
                  <p className="mt-1 text-muted-foreground">{meal.instructions}</p>
                </details>
              </div>
            )}
          </div>

          {/* Meal Image */}
          {mealImages[imageKey] && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="ml-4 flex-shrink-0"
            >
              <img
                src={mealImages[imageKey]}
                alt={meal.name}
                className="w-20 h-20 object-cover rounded-md border cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setModalImage({ src: mealImages[imageKey], alt: meal.name })}
                onError={(e) => {
                  // If image fails to load, hide it
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </motion.div>
          )}

          {loadingImages[imageKey] && (
            <div className="ml-4 flex-shrink-0 w-20 h-20 bg-muted rounded-md flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-primary border-t-transparent"></div>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Plan Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid md:grid-cols-4 gap-4"
      >
        <Card>
          <CardContent className="p-4 text-center">
            <Zap className="h-8 w-8 text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Daily Calories</p>
            <p className="text-lg font-semibold">{dietPlan.dailyCalories}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Protein</p>
            <p className="text-lg font-semibold">{dietPlan.macroSplit.protein}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Carbs</p>
            <p className="text-lg font-semibold">{dietPlan.macroSplit.carbs}%</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Fats</p>
            <p className="text-lg font-semibold">{dietPlan.macroSplit.fats}%</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Daily Meals */}
      <div className="space-y-4">
        {dietPlan.meals.map((dayMeals, index) => (
          <motion.div
            key={dayMeals.day}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="overflow-hidden">
              <CardHeader 
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => toggleDay(dayMeals.day)}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <span className="text-primary font-bold">{dayMeals.day}</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-base font-medium">{dayMeals.totalCalories} calories</span>
                  </CardTitle>
                  <div className="flex items-center space-x-4">
                    <div className="text-sm text-muted-foreground hidden md:flex space-x-4">
                      <span>P: {dayMeals.totalProtein}g</span>
                      <span>C: {dayMeals.totalCarbs}g</span>
                      <span>F: {dayMeals.totalFats}g</span>
                    </div>
                    {expandedDays.has(dayMeals.day) ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {expandedDays.has(dayMeals.day) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="space-y-6">
                      {renderMeal(dayMeals.breakfast, 'breakfast', '#f97316')}
                      {renderMeal(dayMeals.lunch, 'lunch', '#10b981')}
                      {renderMeal(dayMeals.dinner, 'dinner', '#3b82f6')}
                      
                      {dayMeals.snacks && dayMeals.snacks.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-purple-600 mb-4 flex items-center">
                            <Utensils className="h-4 w-4 mr-1" />
                            Snacks
                          </h4>
                          <div className="space-y-4">
                            {dayMeals.snacks.map((snack, snackIndex) => (
                              <div key={snackIndex}>
                                {renderMeal(snack, `snack ${snackIndex + 1}`, '#8b5cf6')}
                              </div>
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

      {/* Image Modal */}
      {modalImage && (
        <ImageModal
          isOpen={true}
          imageSrc={modalImage.src}
          imageAlt={modalImage.alt}
          onClose={() => setModalImage(null)}
        />
      )}
    </div>
  );
};

export default DietPlanDisplay;