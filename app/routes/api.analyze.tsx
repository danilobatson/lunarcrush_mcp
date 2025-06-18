/**
 * API Route: Analyze Cryptocurrency
 *
 * This route demonstrates the power of MCP + AI integration:
 * 1. Uses LunarCrush MCP for real-time social data
 * 2. Processes data with Google Gemini AI
 * 3. Returns actionable trading signals
 */

import { json, type ActionFunctionArgs } from '@remix-run/node';
import LunarCrushMCPService from '~/services/lunarcrush-mcp';
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

		console.log(`🚀 Starting analysis for ${symbol.toUpperCase()}`);

		// Initialize services
		const mcpService = new LunarCrushMCPService(lunarcrushKey);
		const aiService = new GeminiAIService(geminiKey);

		try {
			// Step 1: Connect to LunarCrush MCP
			await mcpService.initializeConnection();

			// Step 2: Fetch cryptocurrency data via MCP
			const cryptoData = await mcpService.getCryptocurrencyData(symbol);

			// Step 3: Analyze with Gemini AI
			const tradingSignal = await aiService.analyzeCrypto(cryptoData);

			console.log(
				`✅ Analysis complete for ${symbol}: ${tradingSignal.recommendation}`
			);

			return json({
				success: true,
				signal: tradingSignal,
				timestamp: new Date().toISOString(),
			});
		} finally {
			// Always clean up MCP connection
			mcpService.disconnect();
		}
	} catch (error) {
		console.error('❌ Analysis error:', error);

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
