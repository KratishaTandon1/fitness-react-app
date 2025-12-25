import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Heart, Target, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { UserDetails } from '../types';

interface TipsSectionProps {
  tips: string[];
  motivation: string;
  userDetails: UserDetails;
}

const TipsSection: React.FC<TipsSectionProps> = ({ tips, motivation, userDetails }) => {
  return (
    <div className="space-y-6">
      {/* Motivation Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <Card className="relative overflow-hidden">
          <div className="absolute inset-0 fitness-gradient opacity-10" />
          <CardContent className="relative p-8">
            <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">Your Personal Motivation</h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-lg leading-relaxed text-muted-foreground italic"
            >
              "{motivation}"
            </motion.p>
          </CardContent>
        </Card>
      </motion.div>

      {/* User Goal Reminder */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-primary" />
              <span>Your Goal Reminder</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Primary Goal:</span>
                  <span className="capitalize">{userDetails.fitnessGoal.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Level:</span>
                  <span className="capitalize">{userDetails.fitnessLevel}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Preference:</span>
                  <span className="capitalize">{userDetails.dietaryPreference.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-medium">Location:</span>
                  <span className="capitalize">{userDetails.workoutLocation}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Tips Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold mb-2">Personalized Tips for Success</h2>
          <p className="text-muted-foreground">Expert advice tailored to your goals and lifestyle</p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <Lightbulb className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm leading-relaxed">{tip}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Additional Reminders */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="grid md:grid-cols-3 gap-4"
      >
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">💧</span>
            </div>
            <h3 className="font-semibold mb-1">Stay Hydrated</h3>
            <p className="text-sm text-muted-foreground">
              Aim for {userDetails.waterIntake || 2.5}+ liters of water daily
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">😴</span>
            </div>
            <h3 className="font-semibold mb-1">Quality Sleep</h3>
            <p className="text-sm text-muted-foreground">
              Target {userDetails.sleepHours || 7-8} hours of restful sleep nightly
            </p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="p-4">
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold mb-1">Track Progress</h3>
            <p className="text-sm text-muted-foreground">
              Monitor your journey and celebrate small wins
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default TipsSection;