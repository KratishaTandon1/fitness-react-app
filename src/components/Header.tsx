import React from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Dumbbell, Sparkles, FolderOpen } from 'lucide-react';
import { Button } from './ui/button';
import { useTheme } from './ThemeProvider';

interface HeaderProps {
  onNewPlan: () => void;
  onViewSavedPlans: () => void;
}

const Header: React.FC<HeaderProps> = ({ onNewPlan, onViewSavedPlans }) => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <motion.header 
      className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Dumbbell className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold">AI Fitness Coach</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={onNewPlan}
            className="flex items-center space-x-2"
          >
            <Sparkles className="h-4 w-4" />
            <span>New Plan</span>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={onViewSavedPlans}
            className="flex items-center space-x-2"
          >
            <FolderOpen className="h-4 w-4" />
            <span className="hidden md:inline">Saved Plans</span>
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="hover:bg-accent"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;