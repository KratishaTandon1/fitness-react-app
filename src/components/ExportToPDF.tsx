import React, { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import type { FitnessPlan } from '../types';
import jsPDF from 'jspdf';

interface ExportToPDFProps {
  plan: FitnessPlan;
}

const ExportToPDF: React.FC<ExportToPDFProps> = ({ plan }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let currentY = margin;

      // Title
      pdf.setFontSize(24);
      pdf.setTextColor(103, 126, 234); // Primary color
      pdf.text('AI Fitness Coach - Personal Plan', margin, currentY);
      currentY += 15;

      // User details
      pdf.setFontSize(16);
      pdf.setTextColor(0, 0, 0);
      pdf.text(`Plan for: ${plan.userDetails?.name || 'User'}`, margin, currentY);
      currentY += 8;
      
      pdf.setFontSize(12);
      pdf.text(`Goal: ${plan.userDetails?.fitnessGoal?.replace('_', ' ') || 'General Fitness'}`, margin, currentY);
      currentY += 6;
      pdf.text(`Level: ${plan.userDetails?.fitnessLevel || 'beginner'}`, margin, currentY);
      currentY += 6;
      
      // Handle createdAt safely
      const createdDate = plan.createdAt instanceof Date ? 
        plan.createdAt.toLocaleDateString() : 
        new Date().toLocaleDateString();
      pdf.text(`Created: ${createdDate}`, margin, currentY);
      currentY += 15;

      // Workout Plan Section
      if (plan.workoutPlan && plan.workoutPlan.workouts && plan.workoutPlan.workouts.length > 0) {
        pdf.setFontSize(18);
        pdf.setTextColor(103, 126, 234);
        pdf.text('Workout Plan', margin, currentY);
        currentY += 10;

        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Duration: ${plan.workoutPlan.duration || 'Not specified'}`, margin, currentY);
        currentY += 6;
        pdf.text(`Days per week: ${plan.workoutPlan.daysPerWeek || 'Not specified'}`, margin, currentY);
        currentY += 10;

        // Workout days
        for (const dayWorkout of plan.workoutPlan.workouts) {
          if (currentY > pageHeight - 40) {
            pdf.addPage();
            currentY = margin;
          }

          pdf.setFontSize(14);
          pdf.setTextColor(103, 126, 234);
          pdf.text(`${dayWorkout.day || 'Day'} - ${dayWorkout.focus || 'Workout'}`, margin, currentY);
          currentY += 8;

          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          
          const exercises = dayWorkout.exercises || [];
          for (const exercise of exercises.slice(0, 8)) { // Limit exercises to fit
            if (currentY > pageHeight - 20) {
              pdf.addPage();
              currentY = margin;
            }
            
            const exerciseText = `• ${exercise.name || 'Exercise'}: ${exercise.sets || 1} sets x ${exercise.reps || '10'}, Rest: ${exercise.restTime || '30s'}`;
            pdf.text(exerciseText, margin + 5, currentY);
            currentY += 5;
          }
          currentY += 5;
        }
      }

      // Diet Plan Section
      if (plan.dietPlan && plan.dietPlan.meals && plan.dietPlan.meals.length > 0) {
        if (currentY > pageHeight - 60) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.setFontSize(18);
        pdf.setTextColor(103, 126, 234);
        pdf.text('Diet Plan', margin, currentY);
        currentY += 10;

        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`Daily Calories: ${plan.dietPlan.dailyCalories || 'Not specified'}`, margin, currentY);
        currentY += 6;
        
        if (plan.dietPlan.macroSplit) {
          pdf.text(`Protein: ${plan.dietPlan.macroSplit.protein || 0}% | Carbs: ${plan.dietPlan.macroSplit.carbs || 0}% | Fats: ${plan.dietPlan.macroSplit.fats || 0}%`, margin, currentY);
        }
        currentY += 10;

        // Diet days
        for (const dayMeals of plan.dietPlan.meals.slice(0, 7)) {
          if (currentY > pageHeight - 30) {
            pdf.addPage();
            currentY = margin;
          }

          pdf.setFontSize(14);
          pdf.setTextColor(103, 126, 234);
          pdf.text(`${dayMeals.day || 'Day'}`, margin, currentY);
          currentY += 8;

          pdf.setFontSize(10);
          pdf.setTextColor(0, 0, 0);
          
          if (dayMeals.breakfast) {
            pdf.text(`• Breakfast: ${dayMeals.breakfast.name || 'Meal'} (${dayMeals.breakfast.calories || 0} cal)`, margin + 5, currentY);
            currentY += 5;
          }
          if (dayMeals.lunch) {
            pdf.text(`• Lunch: ${dayMeals.lunch.name || 'Meal'} (${dayMeals.lunch.calories || 0} cal)`, margin + 5, currentY);
            currentY += 5;
          }
          if (dayMeals.dinner) {
            pdf.text(`• Dinner: ${dayMeals.dinner.name || 'Meal'} (${dayMeals.dinner.calories || 0} cal)`, margin + 5, currentY);
            currentY += 5;
          }
          currentY += 3;
        }
      }

      // Tips Section
      if (plan.tips && plan.tips.length > 0) {
        if (currentY > pageHeight - 60) {
          pdf.addPage();
          currentY = margin;
        }

        pdf.setFontSize(18);
        pdf.setTextColor(103, 126, 234);
        pdf.text('Personal Tips & Motivation', margin, currentY);
        currentY += 10;

        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        
        // Motivation
        if (plan.motivation) {
          const motivationLines = pdf.splitTextToSize(`"${plan.motivation}"`, pageWidth - 2 * margin);
          pdf.text(motivationLines, margin, currentY);
          currentY += motivationLines.length * 6 + 10;
        }

        // Tips
        pdf.setFontSize(12);
        for (let i = 0; i < plan.tips.length && i < 5; i++) {
          if (currentY > pageHeight - 20) {
            pdf.addPage();
            currentY = margin;
          }
          
          const tipLines = pdf.splitTextToSize(`${i + 1}. ${plan.tips[i]}`, pageWidth - 2 * margin - 10);
          pdf.text(tipLines, margin + 5, currentY);
          currentY += tipLines.length * 6 + 5;
        }
      }

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(128, 128, 128);
      pdf.text('Generated by AI Fitness Coach', margin, pageHeight - 10);

      // Save the PDF
      const fileName = `${(plan.userDetails?.name || 'User').replace(/\s+/g, '_')}_Fitness_Plan.pdf`;
      pdf.save(fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Better error handling with more specific messages
      let errorMessage = 'Error generating PDF. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('jsPDF')) {
          errorMessage = 'PDF library error. Please refresh the page and try again.';
        } else if (error.message.includes('Cannot read')) {
          errorMessage = 'Plan data is incomplete. Please generate a new plan first.';
        }
      }
      
      alert(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={exportToPDF}
      disabled={isExporting}
      className="flex items-center space-x-2"
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span>{isExporting ? 'Generating...' : 'Export PDF'}</span>
    </Button>
  );
};

export default ExportToPDF;