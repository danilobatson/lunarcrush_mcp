# LunarCrush AI Trading Terminal

A professional AI-powered cryptocurrency trading terminal built with **LunarCrush MCP**, **Google Gemini AI**, and **Remix**. Get real-time social intelligence, sentiment analysis, and AI-driven trading recommendations for any cryptocurrency.

![LunarCrush AI Trading Terminal](https://via.placeholder.com/800x400/1e293b/ffffff?text=LunarCrush+AI+Trading+Terminal)

## ✨ Features

### 🧠 **AI-Powered Analysis**
- **Google Gemini AI** integration for sophisticated market analysis
- **LunarCrush MCP** for real-time social sentiment data
- **BUY/SELL/HOLD** recommendations with confidence scores
- **Multi-factor analysis** combining technical and social indicators

### 📊 **Real-Time Data**
- **Social sentiment** tracking from Twitter, Reddit, and news
- **Market metrics** including price, volume, and volatility
- **Social engagement** metrics and influencer impact analysis
- **Fear & greed** indicators and community growth trends

### 🎨 **Modern UI/UX**
- **Glass morphism** design with gradient themes
- **Animated progress bar** with 8-step analysis breakdown
- **Dynamic sub-messages** showing real-time AI processing
- **Responsive design** optimized for all devices
- **Professional dark theme** with blue/purple gradients

### ⚡ **Enhanced User Experience**
- **Smart progress tracking** with meaningful step indicators
- **Anti-repetition messaging** system for dynamic feedback
- **Quick coin selection** for popular cryptocurrencies
- **Real-time loading states** with detailed progress updates

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **npm** or **yarn**
- **LunarCrush API Key** (free tier available)
- **Google Gemini API Key** (free tier available)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/lunarcrush-ai-terminal.git
cd lunarcrush-ai-terminal
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Environment Setup**
Create a `.env.local` file in the root directory:
```env
LUNARCRUSH_API_KEY=your_lunarcrush_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
```

4. **Start the development server**
```bash
npm run dev
# or
yarn dev
```

5. **Open your browser**
Navigate to `http://localhost:5173/trading`

## 🔧 Configuration

### API Keys Setup

#### LunarCrush API Key
1. Visit [LunarCrush](https://lunarcrush.com/)
2. Sign up for a free account
3. Navigate to API section
4. Generate your API key
5. Add to `.env.local` as `LUNARCRUSH_API_KEY`

#### Google Gemini API Key
1. Visit [Google AI Studio](https://ai.google.dev/)
2. Sign up and create a new project
3. Generate an API key
4. Add to `.env.local` as `GEMINI_API_KEY`

## 📁 Project Structure

```
lunarcrush-ai-terminal/
├── app/
│   ├── routes/
│   │   ├── trading._index.tsx      # Main trading terminal
│   │   └── api/
│   │       └── analyze.ts          # API endpoint for analysis
│   ├── services/
│   │   ├── gemini-ai.ts           # Gemini AI integration
│   │   └── lunarcrush.ts          # LunarCrush API client
│   ├── layout.tsx                 # App layout
│   └── globals.css               # Global styles
├── components/
│   └── PriceChart.tsx            # Cryptocurrency price charts
├── public/                       # Static assets
├── types/                        # TypeScript type definitions
└── config/                       # Configuration files
```

## 🎯 Usage

### Basic Analysis
1. **Enter a cryptocurrency symbol** (BTC, ETH, SOL, etc.)
2. **Click "Analyze"** to start the AI analysis
3. **Watch the progress** through 8 detailed steps
4. **Review results** including recommendation, confidence, and reasoning

### Progress Steps
The analysis goes through 8 detailed steps:

1. **🔗 Connect** - Connecting to LunarCrush MCP (12%)
2. **📊 Fetch Data** - Fetching social & market data (24%)
3. **⚡ Process** - Processing social metrics (36%)
4. **🧠 AI Analysis** - Running Gemini AI analysis (48%)
5. **📈 Patterns** - Analyzing market patterns (60%)
6. **💡 Insights** - Generating insights (72%)
7. **🎯 Recommend** - Finalizing recommendations (84%)
8. **✅ Complete** - Preparing results (95% → 100%)

### Advanced Features
- **Quick Select**: Click preset coins (BTC, ETH, SOL, ADA, DOGE)
- **Dynamic Messages**: Watch real-time AI processing updates
- **Confidence Scores**: Get percentage-based recommendation confidence
- **Detailed Reasoning**: Understand the AI's decision-making process

## 🔌 API Integration

### LunarCrush MCP Integration
```typescript
// Example: Fetching social sentiment data
const socialData = await lunarCrushClient.getSocialMetrics(symbol);
```

### Google Gemini AI Integration
```typescript
// Example: Getting AI analysis
const analysis = await geminiClient.analyzeMarket({
  symbol,
  socialData,
  marketData
});
```

## 🎨 Customization

### Styling
- Built with **Tailwind CSS** and **HeroUI**
- Easy theme customization in `tailwind.config.ts`
- Glass morphism effects with backdrop blur
- Responsive design with mobile-first approach

### Progress Messages
Customize AI analysis messages in `trading._index.tsx`:
```typescript
const aiAnalysisMessages = [
  "Your custom message...",
  "Another processing step...",
  // Add more messages
];
```

## 🚀 Deployment

### Vercel (Recommended)
1. **Connect your GitHub repo** to Vercel
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Other Platforms
- **Netlify**: Full support for Remix apps
- **Railway**: Easy deployment with environment variables
- **DigitalOcean**: App Platform deployment
- **Self-hosted**: Use `npm run build` and serve the `build` folder

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines
- Follow **TypeScript** best practices
- Use **ESLint** and **Prettier** for code formatting
- **Write meaningful commit messages**
- Test thoroughly before submitting PRs

## 📋 Requirements

### System Requirements
- **Node.js** 18.0.0 or higher
- **npm** 8.0.0 or higher (or yarn equivalent)
- **Modern browser** with ES2020 support

### Dependencies
- **@remix-run/react**: ^2.15.1
- **@heroui/system**: ^2.4.17  
- **react**: 18.3.1
- **tailwindcss**: Latest
- **typescript**: Latest

## 🐛 Troubleshooting

### Common Issues

#### API Key Errors
```
Error: Invalid API key
```
**Solution**: Verify your API keys in `.env.local` are correct and active

#### Build Errors
```
Module not found
```
**Solution**: Run `npm install` to ensure all dependencies are installed

#### Port Already in Use
```
Port 5173 is already in use
```
**Solution**: Kill the process or use a different port: `npm run dev -- --port 3000`

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Discord**: Join our community for real-time help

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[LunarCrush](https://lunarcrush.com/)** - Social intelligence data
- **[Google Gemini](https://ai.google.dev/)** - AI analysis capabilities  
- **[Remix](https://remix.run/)** - Full-stack web framework
- **[HeroUI](https://heroui.com/)** - Beautiful React components
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

## 🔗 Links

- **[Live Demo](https://your-demo-url.vercel.app)**
- **[Documentation](https://your-docs-url.com)**
- **[LunarCrush API Docs](https://lunarcrush.com/developers)**
- **[Gemini AI Docs](https://ai.google.dev/docs)**
- **[MCP Documentation](https://modelcontextprotocol.io/docs)**

---

⭐ **Star this repo** if you found it helpful!

Built with ❤️ using LunarCrush MCP, Google Gemini AI, and Remix
