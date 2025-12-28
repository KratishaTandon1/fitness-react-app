import type { UserDetails, WorkoutPlan, DietPlan } from '../types';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Gemini Configuration 
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

// Text-to-Speech Configuration
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = import.meta.env.VITE_ELEVENLABS_VOICE_ID || 'EXAVITQu4vr4xnSDxMaL';

// Image Generation Configuration  
const REPLICATE_API_TOKEN = import.meta.env.VITE_REPLICATE_API_TOKEN;

interface AIResponse {
  workoutPlan: WorkoutPlan;
  dietPlan: DietPlan;
  tips: string[];
  motivation: string;
}

export const generateFitnessPlan = async (userDetails: UserDetails): Promise<AIResponse> => {
  const prompt = createFitnessPlanPrompt(userDetails);
  
  try {
    // Check for valid OpenAI API key (not placeholder)
    if (OPENAI_API_KEY && OPENAI_API_KEY !== 'your_openai_api_key_here') {
      console.log('Generating plan with OpenAI GPT-4o...');
      return await generateWithOpenAI(prompt);
    } 
    // Fall back to Gemini if available
    else if (GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here' && GEMINI_API_KEY !== 'your_new_gemini_api_key_here') {
      console.log('Generating plan with Google Gemini...');
      return await generateWithGemini(prompt);
    } 
    // If no API keys available, return enhanced demo response
    else {
      console.log('No API keys configured, using enhanced demo response...');
      return generateEnhancedDemoResponse(userDetails);
    }
  } catch (error) {
    console.error('Primary AI service failed:', error);
    
    // If OpenAI fails, try Gemini as fallback
    if (OPENAI_API_KEY && GEMINI_API_KEY && GEMINI_API_KEY !== 'your_gemini_api_key_here' && GEMINI_API_KEY !== 'your_new_gemini_api_key_here') {
      try {
        console.log('Trying Gemini as fallback...');
        return await generateWithGemini(prompt);
      } catch (geminiError) {
        console.error('Gemini fallback also failed:', geminiError);
      }
    }
    
    // Final fallback to enhanced demo response
    console.log('All AI services failed, using enhanced demo response...');
    return generateEnhancedDemoResponse(userDetails);
  }
};

const createFitnessPlanPrompt = (userDetails: UserDetails): string => {
  const { name, age, gender, height, weight, fitnessGoal, fitnessLevel, workoutLocation, dietaryPreference, medicalHistory, stressLevel, planDays } = userDetails;
  
  // Calculate BMI and basic metabolic info
  const heightM = height / 100;
  const bmi = weight / (heightM * heightM);
  const bmr = gender === 'male' 
    ? 88.362 + (13.397 * weight) + (4.799 * height) - (5.677 * age)
    : 447.593 + (9.247 * weight) + (3.098 * height) - (4.330 * age);
  
  const activityMultiplier = fitnessLevel === 'beginner' ? 1.2 : fitnessLevel === 'intermediate' ? 1.375 : 1.55;
  const tdee = Math.round(bmr * activityMultiplier);
  
  const targetCalories = fitnessGoal === 'weight_loss' ? tdee - 500 : 
                        fitnessGoal === 'muscle_gain' ? tdee + 300 :
                        tdee;

  return `You are an expert fitness coach and nutritionist. Generate a comprehensive, science-based fitness plan for ${name}.

**PERSONAL PROFILE:**
- Name: ${name}
- Age: ${age} years (${age < 25 ? 'Young adult' : age < 40 ? 'Adult' : age < 55 ? 'Middle-aged' : 'Mature adult'})
- Gender: ${gender}
- Height: ${height} cm, Weight: ${weight} kg (BMI: ${bmi.toFixed(1)})
- Current Fitness Level: ${fitnessLevel}
- Primary Goal: ${fitnessGoal.replace('_', ' ')}
- Workout Environment: ${workoutLocation}
- Dietary Preference: ${dietaryPreference.replace('_', ' ')}
- Plan Duration: ${planDays || 7} days
- Estimated TDEE: ${tdee} calories
- Target Daily Calories: ${targetCalories} calories
${medicalHistory ? `- Medical Considerations: ${medicalHistory}` : ''}
${stressLevel ? `- Current Stress Level: ${stressLevel}` : ''}

**REQUIREMENTS:**
Generate a ${planDays || 7}-day plan with:

1. **workoutPlan** object with:
   - title: Plan name
   - duration: "${planDays || 7} days" 
   - daysPerWeek: Appropriate frequency (3-6 based on level)
   - workouts: Array of ${planDays || 7} daily workouts, each with:
     * day: "Day 1", "Day 2", etc.
     * focus: Muscle groups/type (e.g., "Upper Body", "HIIT", "Rest")
     * warmup: Array of 3-4 warm-up activities
     * exercises: Array of 4-8 exercises with name, sets, reps, restTime, instructions, muscleGroups, equipment
     * cooldown: Array of 3-4 cool-down activities
     * duration: Estimated workout time

2. **dietPlan** object with:
   - title: Nutrition plan name
   - duration: "${planDays || 7} days"
   - dailyCalories: ${targetCalories} (adjusted for ${fitnessGoal.replace('_', ' ')})
   - macroSplit: {protein: %, carbs: %, fats: %} optimized for ${fitnessGoal.replace('_', ' ')}
   - meals: Array of ${planDays || 7} daily meal plans with:
     * day: "Day 1", "Day 2", etc.
     * totalCalories, totalProtein, totalCarbs, totalFats
     * breakfast, lunch, dinner: Each with name, ingredients[], calories, protein, carbs, fats, instructions
     * snacks: Array of 1-2 snacks with same structure

3. **tips**: Array of 6-8 personalized tips considering their ${fitnessLevel} level, ${fitnessGoal.replace('_', ' ')} goal, and ${workoutLocation} preference

4. **motivation**: Inspiring message addressing ${name} personally, referencing their ${fitnessGoal.replace('_', ' ')} goal and ${planDays || 7}-day commitment

**PERSONALIZATION GUIDELINES:**
- ${fitnessLevel === 'beginner' ? 'Focus on form, basic movements, lighter intensity, more rest days' : 
    fitnessLevel === 'intermediate' ? 'Moderate intensity, compound movements, balanced split' : 
    'High intensity, advanced techniques, minimal rest days'}
- ${fitnessGoal === 'weight_loss' ? 'Higher cardio, moderate strength training, caloric deficit' :
    fitnessGoal === 'muscle_gain' ? 'Heavy strength training, progressive overload, caloric surplus' :
    fitnessGoal === 'strength' ? 'Lower rep ranges, compound movements, strength focus' :
    'Balanced approach with varied training styles'}
- ${workoutLocation === 'home' ? 'Bodyweight and minimal equipment exercises' :
    workoutLocation === 'gym' ? 'Full range of gym equipment' :
    'Outdoor/functional fitness activities'}
- ${dietaryPreference !== 'non_vegetarian' ? `Ensure ${dietaryPreference} compliance with adequate protein sources` : 'Include diverse protein sources'}

**CRITICAL:** Respond with ONLY valid JSON. No explanations, no markdown, no additional text. The JSON must be properly formatted and complete.

JSON:`;
};

const generateWithOpenAI = async (prompt: string): Promise<AIResponse> => {
  const response = await fetch(OPENAI_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o',  // Using latest model
      messages: [
        {
          role: 'system',
          content: 'You are a certified fitness coach and registered dietitian with 10+ years of experience. You specialize in creating personalized, science-based fitness and nutrition plans. Always respond with perfectly formatted JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.6,  // Slightly lower for more consistent results
      max_tokens: 6000,   // Increased for comprehensive plans
      response_format: { type: "json_object" }  // Force JSON format
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0]?.message?.content;
  
  if (!content) {
    throw new Error('Empty response from OpenAI');
  }

  try {
    // Clean up the response in case there are extra characters
    const cleanContent = content.replace(/```json|```/g, '').trim();
    const parsedData = JSON.parse(cleanContent);
    
    // Validate required fields
    if (!parsedData.workoutPlan || !parsedData.dietPlan || !parsedData.tips || !parsedData.motivation) {
      throw new Error('Missing required fields in AI response');
    }
    
    return parsedData;
  } catch (error) {
    console.error('Failed to parse OpenAI response:', content);
    throw new Error('Invalid JSON response from OpenAI: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

const generateWithGemini = async (prompt: string): Promise<AIResponse> => {
  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 6000,
        topK: 40,
        topP: 0.95,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  const content = data.candidates[0]?.content?.parts[0]?.text;
  
  if (!content) {
    throw new Error('Empty response from Gemini');
  }
  
  try {
    // Clean and parse the response
    let cleanContent = content.replace(/```json|```/g, '').trim();
    
    // Handle potential markdown formatting
    if (cleanContent.startsWith('```') && cleanContent.endsWith('```')) {
      cleanContent = cleanContent.slice(3, -3).trim();
    }
    
    const parsedData = JSON.parse(cleanContent);
    
    // Validate required fields
    if (!parsedData.workoutPlan || !parsedData.dietPlan || !parsedData.tips || !parsedData.motivation) {
      throw new Error('Missing required fields in AI response');
    }
    
    return parsedData;
  } catch (error) {
    console.error('Failed to parse Gemini response:', content);
    throw new Error('Invalid JSON response from Gemini: ' + (error instanceof Error ? error.message : 'Unknown error'));
  }
};

export const generateSpeech = async (text: string): Promise<{ type: 'audio' | 'browser-tts', blob?: Blob }> => {
  // Try ElevenLabs first if API key is available
  if (ELEVENLABS_API_KEY && ELEVENLABS_API_KEY !== 'your_elevenlabs_api_key_here') {
    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        return { type: 'audio', blob: audioBlob };
      }
    } catch {
      console.warn('ElevenLabs TTS failed, using browser fallback');
    }
  }

  // Fallback to browser's speech synthesis with mobile support
  return new Promise((resolve, reject) => {
    if (!('speechSynthesis' in window)) {
      reject(new Error('Speech synthesis not supported in this browser'));
      return;
    }

    // Check if browser actually supports speech (mobile safari often returns false)
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    // iOS Safari often blocks speech synthesis
    if (isIOS && !window.speechSynthesis.speaking && window.speechSynthesis.pending === false) {
      // Try to detect if iOS TTS is actually available
      const testUtterance = new SpeechSynthesisUtterance('');
      try {
        speechSynthesis.speak(testUtterance);
        speechSynthesis.cancel();
      } catch (e) {
        reject(new Error('Speech synthesis not available on this iOS device'));
        return;
      }
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.8; // Slower rate for better mobile compatibility
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Function to set voice with mobile compatibility
    const setVoice = () => {
      const voices = speechSynthesis.getVoices();
      if (voices.length === 0) {
        // On mobile, voices might not be loaded yet
        if (isMobile) {
          // Use default voice on mobile
          utterance.voice = null;
          return;
        }
      }
      
      // Find best English voice
      const englishVoice = voices.find(voice => 
        voice.lang.startsWith('en') && !voice.name.includes('Google')
      ) || voices.find(voice => voice.lang.startsWith('en')) || voices[0];
      
      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    };

    utterance.onend = () => {
      resolve({ type: 'browser-tts' });
    };

    utterance.onerror = (error) => {
      reject(new Error('Speech synthesis failed: ' + error.error));
    };

    // Add timeout for mobile devices
    const timeout = setTimeout(() => {
      speechSynthesis.cancel();
      reject(new Error('Speech synthesis timeout on mobile device'));
    }, 30000); // 30 second timeout

    utterance.onend = () => {
      clearTimeout(timeout);
      resolve({ type: 'browser-tts' });
    };

    // Start speaking with mobile-specific handling
    try {
      speechSynthesis.speak(utterance);
      
      // Mobile Chrome sometimes needs a small delay
      if (isMobile && !isIOS) {
        setTimeout(() => {
          if (!speechSynthesis.speaking && !speechSynthesis.pending) {
            speechSynthesis.speak(utterance);
          }
        }, 100);
      }
    } catch (error) {
      clearTimeout(timeout);
      reject(new Error('Failed to start speech synthesis'));
    }
  });
};

export const generateImage = async (prompt: string): Promise<string> => {

  
  // Try multiple image sources with fallbacks
  
  // 1. Try Replicate if API token is available
  if (REPLICATE_API_TOKEN && REPLICATE_API_TOKEN !== 'your_replicate_api_token_here') {
    try {
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
          input: {
            prompt: prompt,
            negative_prompt: "blurry, bad quality, distorted",
            width: 512,
            height: 512,
            num_inference_steps: 20,
            guidance_scale: 7.5,
          },
        }),
      });

      if (response.ok) {
        const prediction = await response.json();
        
        // Poll for completion (simplified)
        if (prediction.urls?.get) {
          const result = await fetch(prediction.urls.get, {
            headers: {
              'Authorization': `Token ${REPLICATE_API_TOKEN}`,
            },
          });
          
          const completedPrediction = await result.json();
          if (completedPrediction.output?.[0]) {
            return completedPrediction.output[0];
          }
        }
      }
    } catch {
      // Continue to fallback
    }
  }

  // 2. Use direct image URLs without testing (CORS issues with HEAD requests)
  try {
    // Extract key terms for better search
    const getSearchTerms = (prompt: string) => {
      const keywords = prompt.toLowerCase();
      
      // Exercise-specific terms
      if (keywords.includes('push') || keywords.includes('pushup')) return 'pushup,exercise,fitness';
      if (keywords.includes('squat')) return 'squat,exercise,gym';
      if (keywords.includes('plank')) return 'plank,core,exercise';
      if (keywords.includes('lunge')) return 'lunge,exercise,workout';
      if (keywords.includes('burpee')) return 'burpee,cardio,exercise';
      if (keywords.includes('mountain climber')) return 'cardio,exercise,fitness';
      if (keywords.includes('tricep')) return 'tricep,exercise,gym';
      if (keywords.includes('pike')) return 'exercise,shoulder,fitness';
      if (keywords.includes('glute bridge')) return 'glute,exercise,fitness';
      if (keywords.includes('calf raise')) return 'calf,exercise,gym';
      if (keywords.includes('russian twist')) return 'core,exercise,workout';
      if (keywords.includes('high knees')) return 'cardio,exercise,fitness';
      
      // Food-specific terms
      if (keywords.includes('breakfast') || keywords.includes('oatmeal')) return 'breakfast,healthy,oatmeal';
      if (keywords.includes('lunch') || keywords.includes('chicken')) return 'chicken,lunch,healthy';
      if (keywords.includes('dinner') || keywords.includes('salmon')) return 'salmon,dinner,healthy';
      if (keywords.includes('snack') || keywords.includes('yogurt')) return 'yogurt,snack,healthy';
      if (keywords.includes('protein') && keywords.includes('shake')) return 'protein,shake,smoothie';
      if (keywords.includes('scramble')) return 'eggs,breakfast,scramble';
      if (keywords.includes('bowl') && keywords.includes('veggie')) return 'vegetables,bowl,healthy';
      if (keywords.includes('wrap')) return 'wrap,lunch,healthy';
      if (keywords.includes('cod') || keywords.includes('fish')) return 'fish,dinner,healthy';
      
      // Generic terms
      if (keywords.includes('exercise') || keywords.includes('workout')) return 'fitness,exercise,workout';
      if (keywords.includes('meal') || keywords.includes('food')) return 'healthy,food,meal';
      if (keywords.includes('healthy')) return 'healthy,nutrition,wellness';
      
      // Default: use first few words
      return prompt.split(' ').slice(0, 2).join(',');
    };
    
    const searchTerm = getSearchTerms(prompt);
    // Comprehensive exercise-specific images
    const exerciseImages = {
      'push-ups': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80',
      'pushup': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80',
      'push up': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80',
      'squats': 'https://images.unsplash.com/photo-1566351671647-63d7e2bfba74?w=400&h=300&fit=crop&crop=center&q=80',
      'squat': 'https://images.unsplash.com/photo-1566351671647-63d7e2bfba74?w=400&h=300&fit=crop&crop=center&q=80',
      'plank': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&crop=center&q=80',
      'plank hold': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&crop=center&q=80',
      'lunges': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop&crop=center&q=80',
      'lunge': 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400&h=300&fit=crop&crop=center&q=80',
      'burpees': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80',
      'burpee': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80',
      'mountain climber': 'https://images.unsplash.com/photo-1587223962930-cb7ee86b0bf9?w=400&h=300&fit=crop&crop=center&q=80',
      'mountain climbers': 'https://images.unsplash.com/photo-1587223962930-cb7ee86b0bf9?w=400&h=300&fit=crop&crop=center&q=80',
      'tricep dips': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop&crop=center&q=80',
      'tricep': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=400&h=300&fit=crop&crop=center&q=80',
      'pike push': 'https://images.unsplash.com/photo-1596357395217-80de13130e92?w=400&h=300&fit=crop&crop=center&q=80',
      'glute bridge': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop&crop=center&q=80',
      'glute': 'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=400&h=300&fit=crop&crop=center&q=80',
      'calf raise': 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?w=400&h=300&fit=crop&crop=center&q=80',
      'calf': 'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?w=400&h=300&fit=crop&crop=center&q=80',
      'russian twist': 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop&crop=center&q=80',
      'high knees': 'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=300&fit=crop&crop=center&q=80',
      'jumping jacks': 'https://images.unsplash.com/photo-1549476464-37392f717541?w=400&h=300&fit=crop&crop=center&q=80',
      'sit-ups': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80',
      'deadlift': 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&h=300&fit=crop&crop=center&q=80',
      'pull-ups': 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400&h=300&fit=crop&crop=center&q=80',
      'pull up': 'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=400&h=300&fit=crop&crop=center&q=80'
    };
    
    // Comprehensive food-specific images  
    const foodImages = {
      'oatmeal': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop&crop=center&q=80',
      'greek yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&crop=center&q=80',
      'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop&crop=center&q=80',
      'scrambled eggs': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&crop=center&q=80',
      'eggs': 'https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=300&fit=crop&crop=center&q=80',
      'chicken breast': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&crop=center&q=80',
      'chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&crop=center&q=80',
      'grilled chicken': 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop&crop=center&q=80',
      'quinoa': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&crop=center&q=80',
      'brown rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop&crop=center&q=80',
      'veggie bowl': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&q=80',
      'vegetables': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop&crop=center&q=80',
      'mediterranean wrap': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center&q=80',
      'wrap': 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=300&fit=crop&crop=center&q=80',
      'salmon': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center&q=80',
      'fish': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center&q=80',
      'cod': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center&q=80',
      'fish & veggies': 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400&h=300&fit=crop&crop=center&q=80',
      'protein shake': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop&crop=center&q=80',
      'smoothie': 'https://images.unsplash.com/photo-1610970881699-44a5587cabec?w=400&h=300&fit=crop&crop=center&q=80',
      'nut mix': 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop&crop=center&q=80',
      'nuts': 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop&crop=center&q=80',
      'almonds': 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=400&h=300&fit=crop&crop=center&q=80',
      'berries': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop&crop=center&q=80',
      'apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop&crop=center&q=80',
      'banana': 'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&h=300&fit=crop&crop=center&q=80'
    };
    
    const promptLower = prompt.toLowerCase();
    // First check if this is clearly an exercise prompt
    if (promptLower.includes('exercise') || promptLower.includes('workout') || promptLower.includes('fitness') || promptLower.includes('gym')) {
      for (const [key, url] of Object.entries(exerciseImages)) {
        if (promptLower.includes(key)) {
          return url;
        }
      }
      // Default exercise fallback
      return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80';
    }
    
    // Then check if this is clearly a food prompt  
    if (promptLower.includes('food') || promptLower.includes('meal') || promptLower.includes('healthy') || promptLower.includes('delicious')) {
      for (const [key, url] of Object.entries(foodImages)) {
        if (promptLower.includes(key)) {
          return url;
        }
      }
      // Default food fallback
      return 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop&crop=center&q=80';
    }
    
    // If not clearly categorized, try both but prioritize exact matches
    for (const [key, url] of Object.entries(exerciseImages)) {
      if (promptLower.includes(key)) {
        return url;
      }
    }
    
    for (const [key, url] of Object.entries(foodImages)) {
      if (promptLower.includes(key)) {
        return url;
      }
    }
    
    // No specific match found, using generic fitness image
    // Generic fitness fallback
    return 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=300&fit=crop&crop=center&q=80';
  } catch {
    // Return a fallback image URL
    return 'https://source.unsplash.com/400x300/?fitness';
  }
};

export const generateMotivationQuote = async (): Promise<string> => {
  const prompt = "Generate a short, inspiring fitness or wellness motivation quote (under 100 characters). Return only the quote text, no attribution or extra text.";
  
  try {
    if (OPENAI_API_KEY) {
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.8,
          max_tokens: 50,
        }),
      });

      const data = await response.json();
      return data.choices[0]?.message?.content?.trim() || "Every step forward is progress!";
    }
    
    // Fallback quotes
    const quotes = [
      "Every step forward is progress!",
      "Your only limit is you.",
      "Strong body, strong mind.",
      "Progress not perfection.",
      "Make it happen!"
    ];
    
    return quotes[Math.floor(Math.random() * quotes.length)];
  } catch (error) {
    console.error('Error generating motivation quote:', error);
    return "Stay strong, stay focused!";
  }
};

// Enhanced demo response function with better personalization
const generateEnhancedDemoResponse = (userDetails: UserDetails): AIResponse => {
  // Generate multiple workout days based on user input
  const generateWorkouts = () => {
    const workoutTemplates = [
      {
        focus: "Full Body",
        exercises: [
          {
            name: "Push-ups",
            sets: 3,
            reps: "8-15",
            restTime: "60 seconds",
            instructions: "Start in plank position, lower chest to ground, push back up. Keep core tight.",
            muscleGroups: ["Chest", "Shoulders", "Triceps"],
            equipment: "None"
          },
          {
            name: "Squats",
            sets: 3,
            reps: "12-20",
            restTime: "60 seconds",
            instructions: "Stand feet shoulder-width apart, lower hips back and down, return to standing.",
            muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
            equipment: "None"
          },
          {
            name: "Plank Hold",
            sets: 3,
            reps: "30-60 seconds",
            restTime: "45 seconds",
            instructions: "Hold push-up position with forearms on ground. Keep body straight.",
            muscleGroups: ["Core", "Shoulders"],
            equipment: "None"
          }
        ]
      },
      {
        focus: "Upper Body",
        exercises: [
          {
            name: "Pike Push-ups",
            sets: 3,
            reps: "8-12",
            restTime: "60 seconds",
            instructions: "Start in downward dog position, lower head towards hands, push back up.",
            muscleGroups: ["Shoulders", "Triceps", "Upper Chest"],
            equipment: "None"
          },
          {
            name: "Tricep Dips",
            sets: 3,
            reps: "10-15",
            restTime: "60 seconds",
            instructions: "Use chair or bench, lower body by bending arms, push back up.",
            muscleGroups: ["Triceps", "Shoulders"],
            equipment: "Chair/Bench"
          },
          {
            name: "Mountain Climbers",
            sets: 3,
            reps: "20-30",
            restTime: "60 seconds",
            instructions: "From plank position, alternate bringing knees to chest quickly.",
            muscleGroups: ["Core", "Cardiovascular"],
            equipment: "None"
          }
        ]
      },
      {
        focus: "Lower Body",
        exercises: [
          {
            name: "Lunges",
            sets: 3,
            reps: "10 each leg",
            restTime: "60 seconds",
            instructions: "Step forward, lower body until both knees at 90 degrees, return to start.",
            muscleGroups: ["Quadriceps", "Glutes", "Hamstrings"],
            equipment: "None"
          },
          {
            name: "Glute Bridges",
            sets: 3,
            reps: "15-20",
            restTime: "45 seconds",
            instructions: "Lie on back, lift hips by squeezing glutes, hold briefly, lower.",
            muscleGroups: ["Glutes", "Hamstrings", "Core"],
            equipment: "None"
          },
          {
            name: "Calf Raises",
            sets: 3,
            reps: "15-25",
            restTime: "45 seconds",
            instructions: "Rise up on balls of feet, hold briefly, lower with control.",
            muscleGroups: ["Calves"],
            equipment: "None"
          }
        ]
      },
      {
        focus: "Core & Cardio",
        exercises: [
          {
            name: "Burpees",
            sets: 3,
            reps: "8-12",
            restTime: "90 seconds",
            instructions: "Squat down, jump back to plank, do push-up, jump feet to hands, jump up.",
            muscleGroups: ["Full Body", "Cardiovascular"],
            equipment: "None"
          },
          {
            name: "Russian Twists",
            sets: 3,
            reps: "20-30",
            restTime: "60 seconds",
            instructions: "Sit leaning back, lift feet, rotate torso side to side.",
            muscleGroups: ["Core", "Obliques"],
            equipment: "None"
          },
          {
            name: "High Knees",
            sets: 3,
            reps: "30 seconds",
            restTime: "60 seconds",
            instructions: "Run in place lifting knees as high as possible.",
            muscleGroups: ["Cardiovascular", "Core"],
            equipment: "None"
          }
        ]
      }
    ];

    const workouts = [];
    for (let i = 0; i < userDetails.planDays; i++) {
      const template = workoutTemplates[i % workoutTemplates.length];
      workouts.push({
        day: `Day ${i + 1}`,
        focus: template.focus,
        warmup: ["5 minutes light cardio", "Dynamic stretching", "Arm circles"],
        duration: "30-45 minutes",
        exercises: template.exercises,
        cooldown: ["5 minutes light stretching", "Deep breathing", "Cool-down walk"]
      });
    }
    return workouts;
  };

  // Generate multiple meal days based on user input
  const generateMeals = () => {
    const mealTemplates = [
      {
        breakfast: {
          name: "Power Breakfast",
          ingredients: ["Oatmeal", "Banana", "Almonds"],
          calories: 475,
          protein: 14,
          carbs: 83,
          fats: 12
        },
        lunch: {
          name: "Protein Lunch",
          ingredients: ["Grilled Chicken", "Brown Rice", "Mixed Vegetables"],
          calories: 497,
          protein: 50,
          carbs: 55,
          fats: 7
        },
        dinner: {
          name: "Balanced Dinner",
          ingredients: ["Salmon Fillet", "Sweet Potato", "Broccoli"],
          calories: 343,
          protein: 27,
          carbs: 31,
          fats: 12
        },
        snacks: [{
          name: "Healthy Snack",
          ingredients: ["Greek Yogurt", "Berries"],
          calories: 150,
          protein: 15,
          carbs: 20,
          fats: 2
        }]
      },
      {
        breakfast: {
          name: "Protein Scramble",
          ingredients: ["Eggs", "Spinach", "Whole Wheat Toast"],
          calories: 420,
          protein: 25,
          carbs: 35,
          fats: 18
        },
        lunch: {
          name: "Veggie Bowl",
          ingredients: ["Quinoa", "Black Beans", "Avocado", "Bell Peppers"],
          calories: 485,
          protein: 18,
          carbs: 65,
          fats: 16
        },
        dinner: {
          name: "Lean Protein",
          ingredients: ["Turkey Breast", "Roasted Vegetables", "Wild Rice"],
          calories: 380,
          protein: 35,
          carbs: 40,
          fats: 8
        },
        snacks: [{
          name: "Protein Shake",
          ingredients: ["Protein Powder", "Banana", "Almond Milk"],
          calories: 200,
          protein: 25,
          carbs: 18,
          fats: 4
        }]
      },
      {
        breakfast: {
          name: "Healthy Bowl",
          ingredients: ["Greek Yogurt", "Granola", "Mixed Berries"],
          calories: 390,
          protein: 20,
          carbs: 45,
          fats: 12
        },
        lunch: {
          name: "Mediterranean Wrap",
          ingredients: ["Whole Wheat Tortilla", "Hummus", "Cucumber", "Turkey"],
          calories: 465,
          protein: 28,
          carbs: 48,
          fats: 18
        },
        dinner: {
          name: "Fish & Veggies",
          ingredients: ["Cod Fillet", "Asparagus", "Quinoa"],
          calories: 365,
          protein: 30,
          carbs: 35,
          fats: 10
        },
        snacks: [{
          name: "Nut Mix",
          ingredients: ["Mixed Nuts", "Dried Fruit"],
          calories: 180,
          protein: 6,
          carbs: 12,
          fats: 14
        }]
      }
    ];

    const meals = [];
    for (let i = 0; i < userDetails.planDays; i++) {
      const template = mealTemplates[i % mealTemplates.length];
      const totalCalories = template.breakfast.calories + template.lunch.calories + template.dinner.calories + template.snacks[0].calories;
      const totalProtein = template.breakfast.protein + template.lunch.protein + template.dinner.protein + template.snacks[0].protein;
      const totalCarbs = template.breakfast.carbs + template.lunch.carbs + template.dinner.carbs + template.snacks[0].carbs;
      const totalFats = template.breakfast.fats + template.lunch.fats + template.dinner.fats + template.snacks[0].fats;

      meals.push({
        day: `Day ${i + 1}`,
        totalCalories,
        totalProtein,
        totalCarbs,
        totalFats,
        breakfast: template.breakfast,
        lunch: template.lunch,
        dinner: template.dinner,
        snacks: template.snacks
      });
    }
    return meals;
  };

  return {
    workoutPlan: {
      title: `${userDetails.planDays}-Day ${userDetails.fitnessGoal.replace('_', ' ')} Plan`,
      duration: `${userDetails.planDays} days`,
      daysPerWeek: Math.min(userDetails.planDays, 6),
      workouts: generateWorkouts()
    },
    dietPlan: {
      title: `${userDetails.planDays}-Day ${userDetails.fitnessGoal.replace('_', ' ')} Nutrition Plan`,
      duration: `${userDetails.planDays} days`,
      dailyCalories: userDetails.fitnessGoal === 'weight_loss' ? 1800 : userDetails.fitnessGoal === 'muscle_gain' ? 2400 : 2100,
      macroSplit: {
        protein: userDetails.fitnessGoal === 'muscle_gain' ? 35 : 25,
        carbs: userDetails.fitnessGoal === 'weight_loss' ? 35 : 45,
        fats: userDetails.fitnessGoal === 'weight_loss' ? 40 : 30
      },
      meals: generateMeals()
    },
    tips: [
      "Stay hydrated - drink at least 8 glasses of water daily",
      "Get 7-9 hours of quality sleep each night",
      "Warm up before exercising and cool down afterward",
      "Listen to your body and rest when needed",
      "Track your progress with photos and measurements",
      "Be consistent - small daily actions lead to big results",
      `Plan ahead - you have ${userDetails.planDays} days to build healthy habits!`,
      "Meal prep on weekends to stay consistent with your nutrition"
    ],
    motivation: `Great job starting your ${userDetails.planDays}-day ${userDetails.fitnessGoal.replace('_', ' ')} journey! Remember, every expert was once a beginner. Stay consistent, be patient with yourself, and celebrate small wins along the way. You've got this!`
  };
};