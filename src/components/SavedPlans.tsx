import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Star, 
  Calendar, 
  User, 
  Target, 
  Trash2,
  Eye,
  StarIcon as StarFilled
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import type { FitnessPlan } from '../types';
import { getFitnessPlans, saveFitnessPlan, deleteFitnessPlan } from '../lib/storage';

interface SavedPlansProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadPlan: (plan: FitnessPlan) => void;
}

interface ExtendedFitnessPlan extends FitnessPlan {
  isStarred?: boolean;
}

const SavedPlans: React.FC<SavedPlansProps> = ({ isOpen, onClose, onLoadPlan }) => {
  const [savedPlans, setSavedPlans] = useState<ExtendedFitnessPlan[]>([]);
  const [filter, setFilter] = useState<'all' | 'starred'>('all');

  useEffect(() => {
    if (isOpen) {
      loadSavedPlans();
    }
  }, [isOpen]);

  const loadSavedPlans = () => {
    const plans = getFitnessPlans();
    // Add starred property from localStorage if it exists
    const extendedPlans = plans.map(plan => ({
      ...plan,
      isStarred: localStorage.getItem(`starred_${plan.id}`) === 'true'
    }));
    setSavedPlans(extendedPlans);
  };

  const toggleStar = (planId: string) => {
    const isCurrentlyStarred = localStorage.getItem(`starred_${planId}`) === 'true';
    if (isCurrentlyStarred) {
      localStorage.removeItem(`starred_${planId}`);
    } else {
      localStorage.setItem(`starred_${planId}`, 'true');
    }
    loadSavedPlans();
  };

  const handleDeletePlan = (planId: string) => {
    if (confirm('Are you sure you want to delete this plan?')) {
      deleteFitnessPlan(planId);
      localStorage.removeItem(`starred_${planId}`);
      loadSavedPlans();
    }
  };

  const handleLoadPlan = (plan: FitnessPlan) => {
    onLoadPlan(plan);
    onClose();
  };

  const filteredPlans = filter === 'starred' 
    ? savedPlans.filter(plan => plan.isStarred)
    : savedPlans;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-background rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b bg-card">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Saved Plans</h2>
              <p className="text-muted-foreground">
                {savedPlans.length} plan{savedPlans.length !== 1 ? 's' : ''} saved
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          {/* Filter Buttons */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Plans ({savedPlans.length})
            </Button>
            <Button
              variant={filter === 'starred' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('starred')}
            >
              <Star className="h-4 w-4 mr-1" />
              Starred ({savedPlans.filter(p => p.isStarred).length})
            </Button>
          </div>
        </div>

        {/* Plans List */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                {filter === 'starred' ? 'No starred plans' : 'No saved plans'}
              </h3>
              <p className="text-muted-foreground">
                {filter === 'starred' 
                  ? 'Star your favorite plans to see them here' 
                  : 'Generate and save your first fitness plan to see it here'
                }
              </p>
            </div>
          ) : (
            <div className="grid gap-4">
              <AnimatePresence>
                {filteredPlans.map((plan) => (
                  <motion.div
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    layout
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-semibold">{plan.userDetails.name}</span>
                              {plan.isStarred && (
                                <StarFilled className="h-4 w-4 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                {plan.userDetails.fitnessGoal.replace('_', ' ')}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(plan.createdAt)}
                              </div>
                            </div>
                          </div>
                          
                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleStar(plan.id)}
                              className="text-yellow-600 hover:text-yellow-500"
                            >
                              {plan.isStarred ? (
                                <StarFilled className="h-4 w-4 fill-current" />
                              ) : (
                                <Star className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLoadPlan(plan)}
                              className="text-blue-600 hover:text-blue-500"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeletePlan(plan.id)}
                              className="text-red-600 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="grid md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="font-medium">Workout:</span>
                            <p className="text-muted-foreground">
                              {plan.workoutPlan.duration} • {plan.workoutPlan.daysPerWeek} days/week
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Diet:</span>
                            <p className="text-muted-foreground">
                              {plan.dietPlan.dailyCalories} cal/day
                            </p>
                          </div>
                          <div>
                            <span className="font-medium">Level:</span>
                            <p className="text-muted-foreground">
                              {plan.userDetails.fitnessLevel}
                            </p>
                          </div>
                        </div>
                        
                        {/* Quick Load Button */}
                        <Button
                          onClick={() => handleLoadPlan(plan)}
                          className="w-full mt-4"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Load This Plan
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default SavedPlans;