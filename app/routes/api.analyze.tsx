/**
 * API Route: Analyze Cryptocurrency
 *
 * This route demonstrates the NEW architecture:
 * 1. User queries for a coin (e.g., "BTC")
 * 2. Google Gemini AI orchestrates which LunarCrush MCP tools to use
 * 3. Gemini calls MCP tools, gathers data, and provides comprehensive analysis
 * 4. Returns complete trading analysis with AI reasoning
 */

import { json, type ActionFunctionArgs } from '@remix-run/node';
import GeminiAIService from '~/services/gemini-ai';

export async function action({ request }: ActionFunctionArgs) {
	try {
		const formData = await request.formData();
		const symbol = formData.get('symbol') as string;

		if (!symbol) {
			return json({ error: 'Symbol is required' }, { status: 400 });
		}

		// Get API keys from environment
		const lunarcrushKey = process.env.LUNARCRUSH_API_KEY;
		const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;

		if (!lunarcrushKey || !geminiKey) {
			return json({ error: 'API keys not configured' }, { status: 500 });
		}

		console.log(
			`🚀 Starting AI-orchestrated analysis for ${symbol.toUpperCase()}`
		);

		// Initialize Gemini AI service (which handles MCP internally)
		const aiService = new GeminiAIService(geminiKey, lunarcrushKey);

		// Let Gemini orchestrate the entire analysis
		const analysis = await aiService.analyzeCryptocurrency(symbol);

		console.log(
			`✅ AI-orchestrated analysis complete for ${symbol}: ${analysis.recommendation}`
		);

		return json({
			success: true,
			analysis: analysis,
			timestamp: new Date().toISOString(),
		});
	} catch (error) {
		console.error('❌ AI orchestration error:', error);

		return json(
			{
				error: error instanceof Error ? error.message : 'Analysis failed',
				success: false,
			},
			{ status: 500 }
		);
	}
}

// Handle GET requests (not used but good practice)
export async function loader() {
	return json(
		{ message: 'Use POST to analyze cryptocurrency' },
		{ status: 405 }
	);
}
