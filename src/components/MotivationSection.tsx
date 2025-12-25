import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quote, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { generateMotivationQuote } from '../lib/api';
import { generateMotivationQuotes } from '../lib/storage';

const MotivationSection: React.FC = () => {
  const [quote, setQuote] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadQuote();
  }, []);

  const loadQuote = async () => {
    setIsLoading(true);
    try {
      const newQuote = await generateMotivationQuote();
      setQuote(newQuote);
    } catch {
      // Fallback to local quotes
      const quotes = generateMotivationQuotes();
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote.text);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="max-w-2xl mx-auto"
    >
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 fitness-gradient opacity-10" />
        <CardContent className="relative p-6 text-center">
          <Quote className="h-8 w-8 text-primary mx-auto mb-4 opacity-50" />
          
          {isLoading ? (
            <div className="flex items-center justify-center py-4">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <motion.p
              key={quote}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-medium italic text-foreground/90 mb-4"
            >
              "{quote}"
            </motion.p>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={loadQuote}
            disabled={isLoading}
            className="text-muted-foreground hover:text-primary"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            New Quote
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default MotivationSection;