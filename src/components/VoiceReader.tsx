import React, { useState } from 'react';
import { Volume2, VolumeX, Play, Pause, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { FitnessPlan } from '../types';
import { generateSpeech } from '../lib/api';

interface VoiceReaderProps {
  plan: FitnessPlan;
}

const VoiceReader: React.FC<VoiceReaderProps> = ({ plan }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [selectedSection, setSelectedSection] = useState<'workout' | 'diet' | 'tips'>('workout');

  const generatePlanText = (section: 'workout' | 'diet' | 'tips'): string => {
    switch (section) {
      case 'workout':
        return `Here is your personalized workout plan. 
        ${plan.workoutPlan.workouts.map(day => 
          `${day.day}: ${day.focus}. 
          Exercises include: ${day.exercises.map(ex => 
            `${ex.name}, ${ex.sets} sets of ${ex.reps} with ${ex.restTime} rest`
          ).join('. ')}.`
        ).join(' ')}`;
        
      case 'diet':
        return `Here is your personalized diet plan with ${plan.dietPlan.dailyCalories} calories per day. 
        ${plan.dietPlan.meals.map(day => 
          `${day.day}: Breakfast is ${day.breakfast.name} with ${day.breakfast.calories} calories. 
          Lunch is ${day.lunch.name} with ${day.lunch.calories} calories. 
          Dinner is ${day.dinner.name} with ${day.dinner.calories} calories.`
        ).join(' ')}`;
        
      case 'tips':
        return `Here are your personalized tips and motivation: 
        ${plan.tips.join('. ')} 
        And here's your motivational message: ${plan.motivation}`;
        
      default:
        return '';
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      // Stop current playback
      if (currentAudio) {
        currentAudio.pause();
      } else {
        // If using browser TTS, stop it
        speechSynthesis.cancel();
      }
      setIsPlaying(false);
      return;
    }

    setIsLoading(true);
    try {
      const text = generatePlanText(selectedSection);
      const speechResult = await generateSpeech(text);
      
      if (speechResult.type === 'audio' && speechResult.blob) {
        // ElevenLabs audio blob - play as usual
        const audioUrl = URL.createObjectURL(speechResult.blob);
        const audio = new Audio(audioUrl);
        
        audio.onended = () => {
          setIsPlaying(false);
          URL.revokeObjectURL(audioUrl);
          setCurrentAudio(null);
        };
        
        audio.onplay = () => setIsPlaying(true);
        audio.onpause = () => setIsPlaying(false);
        
        setCurrentAudio(audio);
        await audio.play();
        
      } else if (speechResult.type === 'browser-tts') {
        // Browser TTS was used, the speech is already playing
        setIsPlaying(true);
        setCurrentAudio(null); // No audio element for browser TTS
        
        // Set up a way to track when speech ends
        const checkSpeaking = setInterval(() => {
          if (!speechSynthesis.speaking) {
            setIsPlaying(false);
            clearInterval(checkSpeaking);
          }
        }, 100);
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      alert('Voice feature is not available. Your browser may not support speech synthesis.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStop = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } else {
      speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Volume2 className="h-5 w-5 text-primary" />
          <span>Read My Plan</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Choose section to listen to:</p>
          <div className="flex space-x-2">
            {[
              { id: 'workout', label: 'Workout' },
              { id: 'diet', label: 'Diet' }, 
              { id: 'tips', label: 'Tips' }
            ].map((section) => (
              <Button
                key={section.id}
                variant={selectedSection === section.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setSelectedSection(section.id as any);
                  handleStop();
                }}
              >
                {section.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            onClick={handlePlayPause}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            <span>{isLoading ? 'Loading...' : isPlaying ? 'Pause' : 'Play'}</span>
          </Button>
          
          {currentAudio && (
            <Button
              variant="outline"
              onClick={handleStop}
              className="flex items-center space-x-2"
            >
              <VolumeX className="h-4 w-4" />
              <span>Stop</span>
            </Button>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Voice feature powered by ElevenLabs TTS
        </p>
      </CardContent>
    </Card>
  );
};

export default VoiceReader;