# 💪 AI Fitness Coach App

An AI-powered fitness assistant built with React and Vite that generates personalized workout and diet plans using Large Language Models (LLMs).

## 🚀 Features

### 🧠 AI-Powered Plan Generation
- **Personalized Workout Plans**: Daily exercise routines with sets, reps, and rest times
- **Custom Diet Plans**: Meal breakdowns for breakfast, lunch, dinner, and snacks  
- **AI Tips & Motivation**: Lifestyle tips and motivational messages tailored to your goals
- **Multiple AI Providers**: Support for OpenAI GPT-4, Google Gemini, and more

### 👤 User Personalization
- **Complete Profile Setup**: Name, age, gender, height, weight
- **Fitness Goals**: Weight loss, muscle gain, maintenance, endurance, strength
- **Fitness Levels**: Beginner, intermediate, advanced
- **Location Preferences**: Home, gym, outdoor workouts
- **Dietary Preferences**: Vegetarian, non-vegetarian, vegan, keto, paleo
- **Optional Details**: Medical history, stress levels, sleep hours, water intake

### 🔊 Voice Features
- **Text-to-Speech**: Uses ElevenLabs API to read workout and diet plans aloud
- **Section Selection**: Choose to listen to workout, diet, or tips sections
- **Voice Controls**: Play, pause, and stop functionality

### 🖼️ AI Image Generation
- **Exercise Visuals**: Generate realistic images of workout exercises
- **Meal Photos**: Create food-style images for meals and recipes
- **Multiple Providers**: Support for Replicate, OpenAI Images, and fallback placeholders

### ⚡ Additional Features
- **📄 PDF Export**: Export complete fitness plans as formatted PDFs
- **🌗 Dark/Light Mode**: Toggle between themes with system preference detection
- **💾 Local Storage**: Save and retrieve fitness plans locally
- **🎨 Smooth Animations**: Powered by Framer Motion for enhanced UX
- **💬 Daily Motivation**: AI-generated inspirational quotes
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | Tailwind CSS, Custom CSS Variables |
| **UI Components** | Custom components with Radix UI primitives |
| **Animations** | Framer Motion |
| **Forms** | React Hook Form, Zod validation |
| **AI APIs** | OpenAI GPT-4, Google Gemini |
| **Voice** | ElevenLabs Text-to-Speech |
| **Images** | Replicate AI, OpenAI DALL-E |
| **PDF Export** | jsPDF |
| **Icons** | Lucide React |
| **State Management** | React Context, Local Storage |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- API keys for AI services (optional for demo)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai-fitness
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your API keys:
   ```env
   # AI API Keys (Add your API keys here)
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   VITE_GEMINI_API_KEY=your_gemini_api_key_here

   # Voice API Keys  
   VITE_ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
   VITE_ELEVENLABS_VOICE_ID=EXAVITQu4vr4xnSDxMaL

   # Image Generation API Keys
   VITE_REPLICATE_API_TOKEN=your_replicate_api_token_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Navigate to `http://localhost:5174/`

### Building for Production

```bash
npm run build
npm run preview
```

## 📖 How to Use

### 1. **Fill Out Your Profile**
   - Enter personal details (name, age, gender, height, weight)
   - Select your fitness goal and current fitness level
   - Choose workout location and dietary preferences
   - Optionally add medical history and lifestyle details

### 2. **Generate Your Plan**
   - Click "Generate My Plan" to create personalized plans
   - Wait for AI to process your information (30-60 seconds)
   - Plans are automatically saved to local storage

### 3. **Explore Your Plans**
   - **Workout Plan**: View daily exercises with sets, reps, and instructions
   - **Diet Plan**: See meal plans with calories and macro breakdown
   - **Tips**: Read personalized advice and motivation

### 4. **Use Additional Features**
   - **🔊 Voice Reader**: Listen to your plans with text-to-speech
   - **📄 Export PDF**: Download complete plans as PDF documents
   - **🖼️ Generate Images**: Click image icons to visualize exercises/meals
   - **🌓 Theme Toggle**: Switch between light and dark modes

## 🔧 API Configuration

### OpenAI Setup
1. Get API key from [OpenAI Platform](https://platform.openai.com/)
2. Add to `.env` as `VITE_OPENAI_API_KEY=sk-...`

### Google Gemini Setup  
1. Get API key from [Google AI Studio](https://makersuite.google.com/)
2. Add to `.env` as `VITE_GEMINI_API_KEY=...`

### ElevenLabs Setup
1. Get API key from [ElevenLabs](https://elevenlabs.io/)
2. Add to `.env` as `VITE_ELEVENLABS_API_KEY=...`

### Replicate Setup
1. Get API token from [Replicate](https://replicate.com/)
2. Add to `.env` as `VITE_REPLICATE_API_TOKEN=...`

## 🏗️ Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Reusable UI components
│   ├── Header.tsx      # App header with navigation
│   ├── UserForm.tsx    # User input form
│   ├── PlanDisplay.tsx # Main plan display
│   └── ...             # Other feature components
├── lib/                # Utility functions
│   ├── api.ts          # AI API integrations
│   ├── storage.ts      # Local storage utilities
│   └── utils.ts        # Helper functions
├── types/              # TypeScript type definitions
└── App.tsx             # Main application component
```

## 🎯 Features in Detail

### AI Plan Generation
- Uses advanced prompting to generate detailed, personalized plans
- Considers all user inputs for maximum customization
- Fallback mechanisms for different AI providers
- Error handling and user feedback

### Voice Features
- High-quality text-to-speech using ElevenLabs
- Configurable voice settings
- Section-specific reading (workout, diet, tips)
- Audio controls with play/pause/stop

### Image Generation
- Context-aware prompts for exercises and meals
- Caching to avoid duplicate generations
- Fallback placeholder images
- Loading states and error handling

### Data Persistence
- Automatic saving of generated plans
- Multiple plan storage and retrieval
- Theme preference persistence
- User preference caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for GPT-4 API
- Google for Gemini API
- ElevenLabs for text-to-speech
- Replicate for image generation
- Tailwind CSS for styling
- Framer Motion for animations
- React and Vite teams

## 📞 Support

If you have any questions or need help setting up the application, please:

1. Check the troubleshooting section in the docs
2. Open an issue on GitHub  
3. Contact the development team

---

**Built with ❤️ for fitness enthusiasts everywhere!**