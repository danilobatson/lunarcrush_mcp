/**
 * Google Gemini AI Service
 *
 * This service handles AI analysis of cryptocurrency data using Google Gemini.
 * It generates trading recommendations based on social sentiment and market data.
 */

import { CryptoData, TradingSignal } from './lunarcrush-mcp';

interface GeminiResponse {
	candidates: Array<{
		content: {
			parts: Array<{
				text: string;
			}>;
		};
	}>;
}

class GeminiAIService {
	private apiKey: string;
	private baseUrl =
		'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

	constructor(apiKey: string) {
		this.apiKey = apiKey;
	}

	/**
	 * Analyze cryptocurrency data and generate trading signals
	 */
	async analyzeCrypto(cryptoData: CryptoData): Promise<TradingSignal> {
		try {
			console.log(`🤖 Analyzing ${cryptoData.symbol} with Gemini AI...`);

			const prompt = this.createAnalysisPrompt(cryptoData);
			const response = await this.callGemini(prompt);

			return this.parseGeminiResponse(response, cryptoData);
		} catch (error) {
			console.error('❌ Gemini AI error:', error);
			throw error;
		}
	}

	/**
	 * Create a comprehensive analysis prompt for Gemini
	 */
	private createAnalysisPrompt(data: CryptoData): string {
		return `
You are an expert cryptocurrency analyst. Analyze the following data for ${
			data.symbol
		} and provide a trading recommendation.

MARKET DATA:
- Symbol: ${data.symbol}
- Name: ${data.name}
- Current Price: $${data.price || 'N/A'}
- 24h Volume: $${data.volume_24h || 'N/A'}
- Market Cap: $${data.market_cap || 'N/A'}

SOCIAL INTELLIGENCE DATA (from LunarCrush):
- Galaxy Score: ${data.galaxy_score || 'N/A'}/100 (social and market health)
- AltRank: ${data.alt_rank || 'N/A'} (price movement + social activity)
- Social Mentions (24h): ${data.social_mentions || 'N/A'}
- Social Engagements: ${data.social_engagements || 'N/A'}
- Social Dominance: ${data.social_dominance || 'N/A'}%

ANALYSIS REQUIREMENTS:
1. Provide a clear BUY, SELL, or HOLD recommendation
2. Give a confidence score from 0-100
3. Explain your reasoning in 2-3 sentences
4. Classify social sentiment as bullish, bearish, or neutral

Please respond in this exact JSON format:
{
  "recommendation": "BUY|SELL|HOLD",
  "confidence": 0-100,
  "reasoning": "Your analysis explanation here",
  "social_sentiment": "bullish|bearish|neutral"
}

Focus on:
- Social sentiment trends (mentions, engagements, dominance)
- Galaxy Score and AltRank indicators
- Volume and market cap relative to social activity
- Overall market positioning

Be concise but thorough in your analysis.
`;
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
					temperature: 0.3,
					topK: 40,
					topP: 0.95,
					maxOutputTokens: 1024,
				},
			}),
		});

		if (!response.ok) {
			throw new Error(
				`Gemini API error: ${response.status} ${response.statusText}`
			);
		}

		return await response.json();
	}

	/**
	 * Parse Gemini response and create trading signal
	 */
	private parseGeminiResponse(
		response: GeminiResponse,
		cryptoData: CryptoData
	): TradingSignal {
		try {
			const text = response.candidates[0].content.parts[0].text;

			// Extract JSON from response
			const jsonMatch = text.match(/\{[\s\S]*\}/);
			if (!jsonMatch) {
				throw new Error('No JSON found in Gemini response');
			}

			const analysis = JSON.parse(jsonMatch[0]);

			return {
				symbol: cryptoData.symbol,
				recommendation: analysis.recommendation as 'BUY' | 'SELL' | 'HOLD',
				confidence: Math.min(100, Math.max(0, analysis.confidence)),
				reasoning: analysis.reasoning,
				social_sentiment: analysis.social_sentiment as
					| 'bullish'
					| 'bearish'
					| 'neutral',
				data: cryptoData,
			};
		} catch (error) {
			console.error('❌ Error parsing Gemini response:', error);

			// Fallback analysis
			return {
				symbol: cryptoData.symbol,
				recommendation: 'HOLD',
				confidence: 50,
				reasoning:
					'Unable to complete full AI analysis. Recommending HOLD for safety.',
				social_sentiment: 'neutral',
				data: cryptoData,
			};
		}
	}
}

export default GeminiAIService;
