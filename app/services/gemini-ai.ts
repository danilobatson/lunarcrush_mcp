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
		mentions?: number;
		engagements?: number;
		creators?: number;
	};
	ai_analysis: {
		summary: string;
		pros: string[];
		cons: string[];
		key_factors: string[];
	};
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
			console.log(
				`🚀 Starting AI-orchestrated analysis for ${symbol.toUpperCase()}`
			);

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
	 * Let Gemini AI orchestrate the analysis by discovering and using MCP tools
	 */
	private async orchestrateAnalysis(symbol: string): Promise<TradingAnalysis> {
		// Step 1: Let Gemini discover available tools
		console.log('🔍 Letting Gemini discover available MCP tools...');
		const availableTools = await this.mcpService.listAvailableTools();

		// Step 2: Let Gemini decide which tools to use and how
		console.log(`🤖 Letting Gemini choose tools for ${symbol} analysis...`);
		const orchestrationPrompt = this.createOrchestrationPrompt(
			symbol,
			availableTools
		);
		const orchestrationResponse = await this.callGemini(orchestrationPrompt);

		// Step 3: Execute Gemini's tool choices to gather data
		const gatheredData = await this.executeGeminiToolChoices(
			symbol,
			orchestrationResponse
		);

		// Step 4: Let Gemini analyze all gathered data
		console.log(`📊 Gemini analyzing gathered data for ${symbol}...`);
		const analysisPrompt = this.createAnalysisPrompt(symbol, gatheredData);
		const analysisResponse = await this.callGemini(analysisPrompt);

		return this.parseAnalysisResponse(analysisResponse, symbol, gatheredData);
	}

	/**
	 * Create orchestration prompt for Gemini to choose tools
	 */
	private createOrchestrationPrompt(
		symbol: string,
		availableTools: Record<string, unknown>
	): string {
		return `
You are a cryptocurrency analyst. I need you to analyze ${symbol.toUpperCase()} using the available LunarCrush MCP tools.

AVAILABLE MCP TOOLS:
${JSON.stringify(availableTools, null, 2)}

TASK: Create a plan to gather comprehensive data for ${symbol.toUpperCase()} trading analysis.

Based on the available tools, decide which tools to call and with what parameters to get:
1. Current price and market data
2. Social sentiment metrics
3. Historical performance data
4. Ranking and positioning data

Respond with a JSON array of tool calls in this exact format:
[
  {
    "tool": "tool_name",
    "args": {"param": "value"},
    "reason": "Why this tool call is needed"
  }
]

Be specific with parameters. For example, if you need to find ${symbol} in a list first, plan that step.
`;
	}

	/**
	 * Execute Gemini's chosen tool calls
	 */
	private async executeGeminiToolChoices(
		symbol: string,
		orchestrationResponse: GeminiResponse
	): Promise<Record<string, unknown>> {
		try {
			const responseText =
				orchestrationResponse.candidates[0]?.content?.parts[0]?.text;
			console.log('🤖 Gemini orchestration response:', responseText);

			// Extract JSON array from response
			const jsonMatch = responseText.match(/\[[\s\S]*\]/);
			if (!jsonMatch) {
				console.log('⚠️ No JSON array found, using fallback tool calls');
				return await this.executeFallbackToolCalls(symbol);
			}

			const toolCalls = JSON.parse(jsonMatch[0]);
			const gatheredData: Record<string, unknown> = {
				symbol: symbol.toUpperCase(),
				toolResults: [],
			};

			// Execute each tool call
			for (const toolCall of toolCalls) {
				try {
					console.log(`🛠️ Executing: ${toolCall.tool} - ${toolCall.reason}`);
					const result = await this.mcpService.callTool(
						toolCall.tool,
						toolCall.args
					);
					gatheredData.toolResults.push({
						tool: toolCall.tool,
						args: toolCall.args,
						reason: toolCall.reason,
						result: result,
					});
				} catch (error) {
					console.error(`❌ Tool ${toolCall.tool} failed:`, error);
					gatheredData.toolResults.push({
						tool: toolCall.tool,
						args: toolCall.args,
						reason: toolCall.reason,
						error: error instanceof Error ? error.message : 'Unknown error',
					});
				}
			}

			return gatheredData;
		} catch (error) {
			console.error('❌ Error executing tool choices:', error);
			return await this.executeFallbackToolCalls(symbol);
		}
	}

	/**
	 * Fallback tool calls if orchestration fails
	 */
	private async executeFallbackToolCalls(
		symbol: string
	): Promise<Record<string, unknown>> {
		console.log('🔄 Using fallback tool calls...');
		const gatheredData: Record<string, unknown> = {
			symbol: symbol.toUpperCase(),
			toolResults: [],
		};

		// Try common tools that should exist
		const fallbackCalls = [
			{
				tool: 'cryptocurrencies',
				args: {},
				reason: 'Get list of cryptocurrencies',
			},
			{
				tool: 'topic',
				args: { topic: symbol.toLowerCase() },
				reason: 'Get topic data',
			},
		];

		for (const toolCall of fallbackCalls) {
			try {
				console.log(`🛠️ Fallback: ${toolCall.tool} - ${toolCall.reason}`);
				const result = await this.mcpService.callTool(
					toolCall.tool,
					toolCall.args
				);
				gatheredData.toolResults.push({
					tool: toolCall.tool,
					args: toolCall.args,
					reason: toolCall.reason,
					result: result,
				});
			} catch (error) {
				console.error(`❌ Fallback tool ${toolCall.tool} failed:`, error);
			}
		}

		return gatheredData;
	}

	/**
	 * Create analysis prompt with gathered data
	 */
	private createAnalysisPrompt(
		symbol: string,
		gatheredData: Record<string, unknown>
	): string {
		return `
You are an expert cryptocurrency analyst. Analyze the following data for ${symbol.toUpperCase()} gathered from LunarCrush MCP tools and provide a comprehensive trading recommendation.

GATHERED DATA FROM MCP TOOLS:
${JSON.stringify(gatheredData, null, 2)}

ANALYSIS REQUIREMENTS:
Based on the above data from the MCP tools, provide a detailed trading analysis. Look for:

1. CURRENT MARKET DATA:
   - Real current price (not demo data)
   - Market cap and volume
   - Recent performance metrics

2. SOCIAL SENTIMENT:
   - Social mentions and engagement
   - Galaxy Score and health indicators
   - Community sentiment trends

3. POSITIONING DATA:
   - AltRank and market positioning
   - Relative performance vs other cryptocurrencies

REQUIRED JSON RESPONSE FORMAT:
{
  "recommendation": "BUY|SELL|HOLD",
  "confidence": 0-100,
  "reasoning": "Brief explanation of the recommendation",
  "social_sentiment": "bullish|bearish|neutral",
  "key_metrics": {
    "price": "actual price from MCP data",
    "galaxy_score": "score from data",
    "alt_rank": "rank from data",
    "social_dominance": "dominance from data",
    "market_cap": "cap from data",
    "volume_24h": "volume from data",
    "mentions": "mentions from data",
    "engagements": "engagements/interactions from data",
    "creators": "creators from data"
  },
  "ai_analysis": {
    "summary": "1-2 sentence overview of the analysis",
    "pros": ["Positive factor 1", "Positive factor 2", "etc"],
    "cons": ["Risk factor 1", "Risk factor 2", "etc"],
    "key_factors": ["Important factor to monitor 1", "Important factor 2", "etc"]
  }
}

IMPORTANT:
- Use ONLY actual data from the MCP tools, not placeholder values
- Make the analysis beginner-friendly and educational
- Focus on explaining WHY the recommendation is made
- Extract real metrics from the gathered data
`;
	}

	/**
	 * Parse Gemini's analysis response and format for our app
	 */
	private parseAnalysisResponse(
		response: GeminiResponse,
		symbol: string,
		cryptoData: Record<string, unknown>
	): TradingAnalysis {
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
				ai_analysis:
					analysis.ai_analysis || analysis.reasoning || 'AI analysis completed',
				timestamp: new Date().toISOString(),
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
				timestamp: new Date().toISOString(),
			};
		}
	}

	/**
	 * Extract key metrics from crypto data
	 */
	private extractMetrics(cryptoData: Record<string, unknown>) {
		return {
			price: cryptoData?.price || null,
			galaxy_score: cryptoData?.galaxy_score || null,
			alt_rank: cryptoData?.alt_rank || null,
			social_dominance: cryptoData?.social_dominance || null,
			market_cap: cryptoData?.market_cap || null,
			volume_24h: cryptoData?.volume_24h || null,
			mentions: cryptoData?.mentions || null,
			engagements: cryptoData?.engagements || cryptoData?.interactions || null,
			creators: cryptoData?.creators || null,
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
			throw new Error(
				`Gemini API error: ${response.status} ${response.statusText}`
			);
		}

		return response.json();
	}
}
