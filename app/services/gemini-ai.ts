/**
 * Google Gemini AI Service with LunarCrush MCP Integration
 *
 * This service uses Google Gemini as the orchestrator to decide which 
 * LunarCrush MCP tools to call and generate comprehensive trading analysis.
 * 
 * Architecture:
 * 1. User queries for a coin (e.g., "BTC")
 * 2. Gemini AI decides which MCP tools to use
 * 3. Gemini calls LunarCrush MCP tools to gather data
 * 4. Gemini processes all data and returns trading analysis
 */

import LunarCrushMCPService from './lunarcrush-mcp';

export interface TradingAnalysis {
	symbol: string;
	recommendation: 'BUY' | 'SELL' | 'HOLD';
	confidence: number;
	reasoning: string;
	social_sentiment: 'bullish' | 'bearish' | 'neutral';
	key_metrics: {
		price?: number;
		galaxy_score?: number;
		alt_rank?: number;
		social_dominance?: number;
		market_cap?: number;
		volume_24h?: number;
	};
	ai_analysis: string;
	timestamp: string;
}

interface GeminiResponse {
	candidates: Array<{
		content: {
			parts: Array<{
				text: string;
			}>;
		};
	}>;
}

export default class GeminiAIService {
	private apiKey: string;
	private baseUrl =
		'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';
	private mcpService: LunarCrushMCPService;

	constructor(apiKey: string, lunarcrushApiKey: string) {
		this.apiKey = apiKey;
		this.mcpService = new LunarCrushMCPService(lunarcrushApiKey);
	}

	/**
	 * Main method: Analyze cryptocurrency using AI-orchestrated MCP calls
	 */
	async analyzeCryptocurrency(symbol: string): Promise<TradingAnalysis> {
		try {
			console.log(`🚀 Starting AI-orchestrated analysis for ${symbol.toUpperCase()}`);

			// Initialize MCP connection
			await this.mcpService.initializeConnection();

			// Let Gemini decide what data to gather and analyze
			const analysis = await this.orchestrateAnalysis(symbol);

			return analysis;
		} catch (error) {
			console.error('❌ Gemini orchestration error:', error);
			throw error;
		} finally {
			// Clean up MCP connection
			this.mcpService.disconnect();
		}
	}

	/**
	 * Let Gemini AI orchestrate the analysis by deciding which MCP tools to use
	 */
	private async orchestrateAnalysis(symbol: string): Promise<TradingAnalysis> {
		// Step 1: Gather cryptocurrency data via MCP
		console.log(`📊 Gathering ${symbol} data via LunarCrush MCP...`);
		const cryptoData = await this.mcpService.getCryptocurrencyData(symbol);
		
		// Step 2: Let Gemini analyze all the data
		console.log(`🤖 Processing ${symbol} data with Gemini AI...`);
		const analysisPrompt = this.createComprehensiveAnalysisPrompt(symbol, cryptoData);
		const response = await this.callGemini(analysisPrompt);
		
		return this.parseAnalysisResponse(response, symbol, cryptoData);
	}

	/**
	 * Create comprehensive analysis prompt with all gathered data
	 */
	private createComprehensiveAnalysisPrompt(symbol: string, cryptoData: any): string {
		return `
You are an expert cryptocurrency analyst. Analyze the following data for ${symbol.toUpperCase()} and provide a comprehensive trading recommendation.

GATHERED DATA FROM LUNARCRUSH MCP:
${JSON.stringify(cryptoData, null, 2)}

ANALYSIS REQUIREMENTS:
Based on the above data, provide a detailed trading analysis. Consider:

1. SOCIAL SENTIMENT ANALYSIS:
   - Social mentions, engagements, and dominance trends
   - Galaxy Score (0-100) indicating social and market health
   - AltRank positioning relative to other cryptocurrencies

2. MARKET METRICS:
   - Current price action and volume
   - Market cap positioning
   - Technical indicators if available

3. RISK ASSESSMENT:
   - Social sentiment volatility
   - Market positioning risks
   - Overall confidence level

REQUIRED JSON RESPONSE FORMAT:
{
  "recommendation": "BUY|SELL|HOLD",
  "confidence": 0-100,
  "reasoning": "Detailed 3-4 sentence explanation of your analysis",
  "social_sentiment": "bullish|bearish|neutral",
  "key_metrics": {
    "price": number or null,
    "galaxy_score": number or null,
    "alt_rank": number or null,
    "social_dominance": number or null,
    "market_cap": number or null,
    "volume_24h": number or null
  },
  "ai_analysis": "Comprehensive 2-3 paragraph analysis including social trends, market positioning, and future outlook"
}

Be thorough in your analysis but concise in your reasoning. Focus on actionable insights.
`;
	}

	/**
	 * Parse Gemini's analysis response and format for our app
	 */
	private parseAnalysisResponse(response: GeminiResponse, symbol: string, cryptoData: any): TradingAnalysis {
		try {
			const text = response.candidates[0]?.content?.parts[0]?.text;
			if (!text) {
				throw new Error('No response from Gemini');
			}

			console.log('🤖 Gemini raw response:', text);

			// Extract JSON from response
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error('No JSON found in Gemini response');
			}

			const analysis = JSON.parse(jsonMatch[0]);

			// Validate and format response
			return {
				symbol: symbol.toUpperCase(),
				recommendation: analysis.recommendation || 'HOLD',
				confidence: analysis.confidence || 50,
				reasoning: analysis.reasoning || 'Analysis completed',
				social_sentiment: analysis.social_sentiment || 'neutral',
				key_metrics: analysis.key_metrics || this.extractMetrics(cryptoData),
				ai_analysis: analysis.ai_analysis || analysis.reasoning || 'AI analysis completed',
				timestamp: new Date().toISOString()
			};
		} catch (error) {
			console.error('❌ Error parsing Gemini response:', error);
			
			// Fallback response
			return {
				symbol: symbol.toUpperCase(),
				recommendation: 'HOLD',
				confidence: 50,
				reasoning: 'Analysis completed with limited data',
				social_sentiment: 'neutral',
				key_metrics: this.extractMetrics(cryptoData),
				ai_analysis: 'Unable to complete full AI analysis. Please try again.',
				timestamp: new Date().toISOString()
			};
		}
	}

	/**
	 * Extract key metrics from crypto data
	 */
	private extractMetrics(cryptoData: any) {
		return {
			price: cryptoData?.price || null,
			galaxy_score: cryptoData?.galaxy_score || null,
			alt_rank: cryptoData?.alt_rank || null,
			social_dominance: cryptoData?.social_dominance || null,
			market_cap: cryptoData?.market_cap || null,
			volume_24h: cryptoData?.volume_24h || null
		};
	}

	/**
	 * Call Google Gemini API
	 */
	private async callGemini(prompt: string): Promise<GeminiResponse> {
		const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [
							{
								text: prompt,
							},
						],
					},
				],
				generationConfig: {
					temperature: 0.7,
					topK: 40,
					topP: 0.95,
					maxOutputTokens: 2048,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
		}

		return response.json();
	}
}
