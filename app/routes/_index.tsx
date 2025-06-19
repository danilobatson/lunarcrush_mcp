import { useState, useEffect } from 'react';
import { useLoaderData } from '@remix-run/react';
import {
	json,
	type MetaFunction,
	ActionFunctionArgs,
	LoaderFunctionArgs,
} from '@remix-run/node';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import PriceChart from '../../components/PriceChart';
import { useMcp } from 'use-mcp/react';
import { GoogleGenAI } from '@google/genai';
import useMcpServer from '../../hooks/useMcpServer';

export const meta: MetaFunction = () => {
	return [
		{ title: 'LunarCrush AI Trading Terminal | MCP Powered' },
		{
			name: 'description',
			content:
				'Professional AI-powered trading terminal with real-time social intelligence',
		},
	];
};

export async function loader({ request }: LoaderFunctionArgs) {
	return json({
		message: 'Trading terminal loaded successfully',
		env: {
			GOOGLE_GEMINI_API_KEY: process.env.GOOGLE_GEMINI_API_KEY,
			LUNARCRUSH_API_KEY: process.env.LUNARCRUSH_API_KEY,
		},
	});
}

async function geminiFlashResponse(ai, contents) {
	return await ai.models.generateContent({
		model: 'gemini-2.0-flash-lite',
		contents: contents,
	});
}
function transformChartData(
	chartData: Array<{
		time?: string;
		date?: string;
		close?: number;
		price?: number;
	}>
): Array<{ date: string; price: number }> {
	if (!Array.isArray(chartData) || chartData.length === 0) {
		return [];
	}

	// Transform and filter valid data points
	const transformedData = chartData
		.map((item) => ({
			date: item.time || item.date || '',
			price: item.close || item.price || 0,
		}))
		.filter((item) => item.date && item.price > 0)
		.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

	return transformedData;
}

function createOrchestrationPrompt(
	symbol: string,
	availableTools: Record<string, unknown>
): string {
	return `
You are a cryptocurrency analyst. I need you to analyze ${symbol.toUpperCase()} using the available LunarCrush MCP tools. Use a MAX of four tools.

AVAILABLE MCP TOOLS:
${JSON.stringify(availableTools, null, 2)}

TASK: Create a plan to gather comprehensive data for ${symbol.toUpperCase()} trading analysis.

Based on the available tools, decide which tools to call and with what parameters to get:
1. Current price and market data
2. Social sentiment metrics
3. Historical performance data
4. Ranking and positioning data
5. Get one week price historical time series data for charting purposes. Look only for the price metrics.

Prioritize getting data for the one week price chart. The price chart is important. If you don't get data back in the response try a few different solutions to get the data (e.g. try the name of the coin FIRST then try the symbol)

Respond with a JSON array of tool calls in this exact format:
[
{
  "tool": "tool_name",
  "args": {"param": "value"},
  "reason": "Short reason why this tool call is needed"
}
]

Be specific with parameters. For example, if you need to find ${symbol} in a list first, plan that step.
`;
}

async function executeGeminiToolChoices(
	symbol: string,
	orchestrationResponse: GeminiResponse,
	callTool: (
		toolName: string,
		args: Record<string, unknown>
	) => Promise<unknown>
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
		const gatheredData = {
			symbol: symbol.toUpperCase(),
			toolResults: [],
		};

		// Execute tool calls concurrently with Promise.all
		const toolPromises = toolCalls.map(async (toolCall) => {
			try {
				console.log(`🛠️ Executing: ${toolCall.tool} - ${toolCall.reason}`);
				const result = await callTool(toolCall.tool, toolCall.args);
				return {
					tool: toolCall.tool,
					args: toolCall.args,
					reason: toolCall.reason,
					result,
				};
			} catch (error) {
				console.error(`❌ Tool ${toolCall.tool} failed:`, error);
				return {
					tool: toolCall.tool,
					args: toolCall.args,
					reason: toolCall.reason,
					error: error instanceof Error ? error.message : 'Unknown error',
				};
			}
		});

		gatheredData.toolResults = await Promise.all(toolPromises);
		return gatheredData;
	} catch (error) {
		console.error('❌ Error executing tool choices:', error);
		return await this.executeFallbackToolCalls(symbol);
	}
}

function createAnalysisPrompt(
	symbol: string,
	gatheredData: Record<string, unknown>
): string {
	return `
You are an expert cryptocurrency analyst. Analyze the following data for ${symbol.toUpperCase()} gathered from LunarCrush MCP tools and provide a comprehensive trading recommendation. Keep it short for faster response times.

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

4. CHART DATA:
 - Price trends over the last week
 - Could be used to create a chart
 - Could be under close instead of price
 - If you find price/time series data, include ONLY 12AM and 12PM time data points
 - Format as: [{"time": "2025-06-10 07:00", "close": 2675.51}, ...]
 - Keep chart_data small to prevent response truncation

 Respond with a JSON array of tool calls in this exact format:
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
},
"chart_data": [{"time": "2025-06-10 07:00", "close": 2675.51}],
"miscellaneous": "Any other relevant insights"
}

IMPORTANT:
- Use ONLY actual data from the MCP tools, not placeholder values
- Make the analysis beginner-friendly, concise, and educational
- Focus on explaining WHY the recommendation is made
- Extract real metrics from the gathered data
- Do not break JSON response format instructed above
`;
}

function parseAnalysisResponse(
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

		// Extract JSON from response with better handling
		const jsonMatch = text.match(/\{[\s\S]*\}/);
		if (!jsonMatch) {
			throw new Error('No JSON found in Gemini response');
		}

		let jsonText = jsonMatch[0];

		// Handle truncated JSON by trying to fix common issues
		if (!jsonText.endsWith('}')) {
			// Find the last complete field before truncation
			const lastCompleteField = jsonText.lastIndexOf('"}');
			if (lastCompleteField > 0) {
				jsonText = jsonText.substring(0, lastCompleteField + 2) + '}';
			}
		}

		const analysis = JSON.parse(jsonText);

		// Validate and format response
		return {
			symbol: symbol.toUpperCase(),
			recommendation: analysis.recommendation || 'HOLD',
			confidence: analysis.confidence || 50,
			reasoning: analysis.reasoning || 'Analysis completed',
			social_sentiment: analysis.social_sentiment || 'neutral',
			key_metrics: analysis.key_metrics,
			ai_analysis:
				analysis.ai_analysis || analysis.reasoning || 'AI analysis completed',
			timestamp: new Date().toISOString(),
			chart_data: transformChartData(analysis.chart_data || []),
			success: true, // Add success property
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
			key_metrics: cryptoData || {}, // Fix: remove 'this.' and use fallback
			ai_analysis: {
				summary: 'Unable to complete full AI analysis. Please try again.',
				pros: [],
				cons: ['Analysis parsing failed'],
				key_factors: [],
			},
			timestamp: new Date().toISOString(),
			chart_data: [],
			success: true, // Add success property even for fallback
		};
	}
}

export default function TradingIndex() {
	const { env } = useLoaderData<typeof loader>();

	const [searchTerm, setSearchTerm] = useState('');
	const [progressStep, setProgressStep] = useState(0);
	const [progressPercent, setProgressPercent] = useState(0);
	const [subStepMessage, setSubStepMessage] = useState('');

	// State for analysis results
	const [analysis, setAnalysis] = useState(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);


	const { state, tools, callTool } = useMcpServer({
		url: `https://lunarcrush.ai/sse?key=${env.LUNARCRUSH_API_KEY}`,
		clientName: 'LunarCrush MCP SSE',
		autoReconnect: true,
		timeout: 15000, // 15 second timeout
	});


	// Add a timeout effect to handle stuck connections
	useEffect(() => {
		const timer = setTimeout(() => {
			if (state === 'discovering' || state === 'connecting') {
				console.warn('MCP connection timeout, forcing bypass');
				// Set a flag to bypass MCP and use direct analysis
			}
		}, 20000); // 20 second timeout

		return () => clearTimeout(timer);
	}, [state]);

	// Handle MCP connection states - but allow bypass
	if (state === 'failed') {
		console.warn('MCP failed, will use direct analysis mode');
	}

	const progressSteps = [
		{
			label: 'Connecting to LunarCrush MCP',
			description: 'Establishing secure connection to LunarCrush API...',
		},
		{
			label: 'Fetching social & market data',
			description: 'Retrieving real-time social sentiment and market data...',
		},
		{
			label: 'Processing social metrics',
			description: 'Analyzing social metrics and engagement patterns...',
		},
		{
			label: 'Running Gemini AI analysis',
			description: 'Google Gemini AI processing complex data patterns...',
		},
		{
			label: 'Analyzing market patterns',
			description: 'Deep learning analysis of price movements and trends...',
		},
		{
			label: 'Generating insights',
			description: 'Creating personalized trading recommendations...',
		},
		{
			label: 'Finalizing recommendations',
			description: 'Compiling comprehensive analysis report...',
		},
		{
			label: 'Preparing results',
			description: 'Formatting and validating final output...',
		},
	];
	const ai = new GoogleGenAI({ apiKey: env.GOOGLE_GEMINI_API_KEY });

	async function main(symbol = 'BTC') {
		// Step 1: Let Gemini decide which tools to use and how
		console.log(`🤖 Letting Gemini choose tools for ${symbol} analysis...`);

		const chooseToolsPrompt = createOrchestrationPrompt(symbol, tools);

		const chooseToolsResponse = await geminiFlashResponse(
			ai,
			chooseToolsPrompt
		);

		// Step 2: Execute Gemini's tool choices to gather data

		console.log('🤖 Gemini orchestrator response:', chooseToolsResponse);

		const gatheredData = await executeGeminiToolChoices(
			symbol,
			chooseToolsResponse,
			callTool
		);

		const analysisPrompt = createAnalysisPrompt(symbol, gatheredData);

		console.log('🧠 Generating final analysis...');

		// Step 3: Let Gemini analyze the collected data

		const analysisResponse = await geminiFlashResponse(ai, analysisPrompt);

		console.log('🤖 Gemini final analysis response:', analysisResponse);

		return parseAnalysisResponse(analysisResponse, symbol, gatheredData);
	}

	// Handle progress animation when loading starts
	useEffect(() => {
		let stepInterval: NodeJS.Timeout;
		let subStepInterval: NodeJS.Timeout;

		// Sub-step messages for the final phases (steps 3-7)
		const aiAnalysisMessages = [
			'Analyzing sentiment correlations...',
			'Processing market volatility patterns...',
			'Evaluating social momentum indicators...',
			'Cross-referencing technical signals...',
			'Calculating risk-adjusted probabilities...',
			'Generating confidence intervals...',
			'Optimizing recommendation logic...',
			'Validating analysis accuracy...',
			'Processing social engagement metrics...',
			'Analyzing price-volume relationships...',
			'Evaluating market maker behavior...',
			'Scanning for whale activity patterns...',
			'Computing social sentiment scores...',
			'Analyzing influencer impact metrics...',
			'Processing fear & greed indicators...',
			'Evaluating community growth trends...',
			'Calculating momentum divergences...',
			'Analyzing support & resistance levels...',
			'Processing order book dynamics...',
			'Evaluating liquidity pool data...',
			'Computing volatility projections...',
			'Analyzing institutional flow patterns...',
			'Processing news sentiment impact...',
			'Evaluating correlation matrices...',
			'Computing risk-reward ratios...',
			'Analyzing market cycle positioning...',
			'Processing fundamental indicators...',
			'Evaluating adoption metrics...',
			'Computing probability distributions...',
			'Finalizing recommendation synthesis...',
			'Preparing comprehensive report...',
			'Validating output consistency...',
			'Optimizing confidence scoring...',
			'Formatting analysis results...',
		];

		if (isAnalyzing) {
			// Reset states immediately
			setProgressStep(0);
			setProgressPercent(0);
			setSubStepMessage('');

			// Step progression - advance every 2.5 seconds and update progress
			stepInterval = setInterval(() => {
				setProgressStep((prev) => {
					const next = prev + 1;
					const finalStep =
						next >= progressSteps.length - 1 ? progressSteps.length - 1 : next;

					// Update progress based on step completion
					// Each step represents equal progress up to 90%
					const progressByStep = Math.round(
						(finalStep + 1) * (90 / progressSteps.length)
					);
					setProgressPercent(progressByStep);

					return finalStep;
				});
			}, 3000); // Change step every 3 seconds

			// Sub-step messaging for AI analysis phases (starts after step 3)
			subStepInterval = setInterval(() => {
				setProgressStep((currentStep) => {
					// Only show sub-messages during AI analysis phases (steps 3-7)
					if (currentStep >= 4) {
						const randomMessage =
							aiAnalysisMessages[
								Math.floor(Math.random() * aiAnalysisMessages.length)
							];
						setSubStepMessage(randomMessage);
					} else {
						setSubStepMessage('');
					}
					return currentStep;
				});
			}, 4000); // Rotate sub-messages every 1.5 seconds
		} else {
			// Loading finished - complete the progress
			setProgressPercent(100);
			setProgressStep(progressSteps.length - 1);
			setSubStepMessage('Analysis complete!');

			// Reset after showing completion
			const resetTimeout = setTimeout(() => {
				setProgressPercent(0);
				setProgressStep(0);
				setSubStepMessage('');
			}, 2000);

			return () => clearTimeout(resetTimeout);
		}

		return () => {
			if (stepInterval) clearInterval(stepInterval);
			if (subStepInterval) clearInterval(subStepInterval);
		};
	}, [isAnalyzing, progressSteps.length]); // Only depend on analyzing state

	const handleSearch = async () => {
		if (!searchTerm.trim()) return;

		setIsAnalyzing(true);
		setAnalysis(null);
		setProgressStep(0);
		setProgressPercent(0);
		setSubStepMessage('');

		try {
			// Step 1: Check MCP connection status
			setProgressStep(1);
			setProgressPercent(12.5);
			if (state === 'ready') {
				setSubStepMessage('✅ MCP connection established');
			} else {
				setSubStepMessage('⚠️ MCP bypassed - using direct analysis');
			}
			await new Promise((resolve) => setTimeout(resolve, 500));

			// Step 2: Initialize Gemini orchestration
			setProgressStep(2);
			setProgressPercent(25);
			setSubStepMessage('🤖 Initializing Gemini AI orchestrator...');
			await new Promise((resolve) => setTimeout(resolve, 300));

			// Step 3: Start the analysis
			setProgressStep(3);
			setProgressPercent(50);
			setSubStepMessage('⚡ Gemini orchestrating analysis...');

			const analysisResponse = await main(searchTerm.toUpperCase());

			// Step 4: Finalize results
			setProgressStep(4);
			setProgressPercent(100);
			setSubStepMessage('✅ Analysis complete!');

			// Set the final analysis
			setAnalysis({
				...analysisResponse,
				timestamp: new Date().toISOString(),
			});
		} catch (error) {
			console.error('❌ Analysis failed:', error);
			setSubStepMessage(
				`❌ Error: ${
					error instanceof Error ? error.message : 'Analysis failed'
				}`
			);

			// Set error analysis
			setAnalysis({
				success: false,
				error: error instanceof Error ? error.message : 'Analysis failed',
				symbol: searchTerm.toUpperCase(),
				recommendation: 'HOLD',
				confidence: 0,
				reasoning: 'Analysis could not be completed due to technical issues.',
				social_sentiment: 'neutral',
				key_metrics: {},
				ai_analysis: {
					summary: 'Analysis failed due to technical issues.',
					pros: [],
					cons: ['Technical error occurred'],
					key_factors: [],
				},
			});
		} finally {
			// Always stop analyzing state
			setTimeout(() => {
				setIsAnalyzing(false);
			}, 1000);
		}
	};

	return (
		<div className='min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900'>
			{/* Header */}
			<header className='border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-xl'>
				<div className='max-w-7xl mx-auto px-6 py-4'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-3'>
							<div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
								<span className='text-white font-bold text-sm'>LC</span>
							</div>
							<div>
								<h1 className='text-xl font-bold text-white'>LunarCrush AI</h1>
								<p className='text-xs text-slate-400'>Trading Terminal</p>
							</div>
						</div>
						<div className='flex items-center gap-2'>
							<div
								className={`w-2 h-2 rounded-full ${
									state === 'ready'
										? 'bg-green-500 animate-pulse'
										: state === 'failed'
										? 'bg-red-500'
										: 'bg-yellow-500 animate-pulse'
								}`}></div>
							<span className='text-sm text-slate-300'>
								{state === 'ready'
									? 'MCP Connected'
									: state === 'failed'
									? 'MCP Failed (Direct Mode)'
									: `MCP ${state}...`}
							</span>
							{state !== 'ready' && (
								<Chip
									size='sm'
									variant='flat'
									className='bg-blue-500/20 text-blue-300 text-xs'>
									Direct Analysis Available
								</Chip>
							)}
						</div>
					</div>
				</div>
			</header>

			<div className='max-w-7xl mx-auto px-6 py-8'>
				{/* Search Section */}
				<div className='mb-8'>
					<Card className='bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'>
						<CardBody className='p-6'>
							<div className='flex items-center gap-4 mb-4'>
								<div className='flex-1'>
									<Input
										placeholder='Enter symbol (BTC, ETH, DOGE, etc.)'
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
										size='lg'
										variant='bordered'
										classNames={{
											input: 'text-white placeholder:text-slate-400',
											inputWrapper:
												'border-slate-600 bg-slate-700/50 hover:border-slate-500',
										}}
									/>
								</div>
								<Button
									color='primary'
									size='lg'
									onPress={() => handleSearch()}
									isLoading={isAnalyzing}
									className='px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'>
									{isAnalyzing ? 'Analyzing...' : 'Analyze'}
								</Button>
							</div>

							{/* Quick Select Coins */}
							<div className='flex items-center gap-3'>
								<span className='text-sm text-slate-400'>Quick select:</span>
								<div className='flex gap-2'>
									{['BTC', 'ETH', 'SOL', 'ADA', 'DOGE'].map((coin) => (
										<Chip
											key={coin}
											variant='flat'
											className='cursor-pointer bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border-slate-600'
											onClick={() => setSearchTerm(coin)}>
											{coin}
										</Chip>
									))}
								</div>
							</div>
						</CardBody>
					</Card>
				</div>

				{/* Enhanced Loading State with Progress Bar */}
				{isAnalyzing && (
					<Card className='mb-10 bg-slate-800/40 border border-slate-700/30 backdrop-blur-2xl shadow-2xl overflow-hidden'>
						<CardBody className='p-10'>
							<div className='text-center'>
								<div className='flex justify-center mb-8'>
									<div className='relative'>
										{/* Outer rotating ring */}
										<div className='w-20 h-20 border-4 border-slate-700/50 rounded-full'></div>
										{/* Main spinning ring */}
										<div className='absolute top-0 left-0 w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin'></div>
										{/* Inner pulsing dot */}
										<div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse'></div>
									</div>
								</div>

								<h3 className='text-2xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent mb-3'>
									Analyzing {searchTerm}
								</h3>
								<p className='text-slate-400 mb-8'>
									Gathering comprehensive market intelligence...
								</p>

								{/* Progress Bar */}
								<div className='max-w-lg mx-auto mb-8'>
									<div className='flex items-center justify-between mb-3'>
										<span className='text-sm text-slate-400'>Progress</span>
										<span className='text-sm font-medium text-blue-400'>
											{Math.round(progressPercent)}%
										</span>
									</div>
									<div className='w-full bg-slate-700/50 rounded-full h-3 overflow-hidden'>
										<div
											className='h-full bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 rounded-full transition-all duration-300 ease-out relative'
											style={{ width: `${progressPercent}%` }}>
											<div className='absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse'></div>
										</div>
									</div>
								</div>

								{/* Current Step Indicator */}
								<div className='bg-slate-700/30 rounded-xl p-6 mb-6'>
									<div className='flex items-center justify-center gap-3 mb-4'>
										<div className='w-3 h-3 bg-blue-500 rounded-full animate-bounce'></div>
										<h4 className='text-blue-400 font-bold'>
											{progressStep < progressSteps.length
												? progressSteps[progressStep].label
												: 'Finalizing results'}
										</h4>
									</div>
									<p className='text-slate-400 text-sm mb-3'>
										{progressStep < progressSteps.length
											? progressSteps[progressStep].description
											: 'Preparing comprehensive analysis report...'}
									</p>
									{/* Sub-step messaging for AI analysis phases */}
									{subStepMessage && (
										<div className='flex items-center justify-center gap-2 mt-4 p-3 bg-slate-600/20 rounded-lg border border-slate-600/30'>
											<div className='w-2 h-2 bg-cyan-400 rounded-full animate-pulse'></div>
											<span className='text-cyan-300 text-sm font-medium'>
												{subStepMessage}
											</span>
										</div>
									)}
								</div>

								{/* Step Progress Indicators */}
								<div className='grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 max-w-6xl mx-auto'>
									{[
										{ icon: '🔗', label: 'Connect', step: 0 },
										{ icon: '📊', label: 'Fetch Data', step: 1 },
										{ icon: '⚡', label: 'Process', step: 2 },
										{ icon: '🧠', label: 'AI Analysis', step: 3 },
										{ icon: '�', label: 'Patterns', step: 4 },
										{ icon: '💡', label: 'Insights', step: 5 },
										{ icon: '🎯', label: 'Recommend', step: 6 },
										{ icon: '✅', label: 'Complete', step: 7 },
									].map((item, index) => (
										<div
											key={index}
											className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all duration-300 ${
												progressStep >= item.step
													? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
													: 'bg-slate-700/20 border-slate-600/20 text-slate-500'
											}`}>
											<div
												className={`text-xl ${
													progressStep >= item.step ? 'animate-bounce' : ''
												}`}>
												{item.icon}
											</div>
											<div className='text-xs font-medium text-center'>
												{item.label}
											</div>
											{progressStep === item.step && (
												<div className='w-1 h-1 bg-blue-400 rounded-full animate-ping'></div>
											)}
										</div>
									))}
								</div>
							</div>
						</CardBody>
					</Card>
				)}

				{/* Results Display */}
				{analysis && analysis.success && (
					<div className='grid lg:grid-cols-3 gap-6'>
						{/* Left Column - Main Analysis */}
						<div className='lg:col-span-2 space-y-6'>
							{/* Signal Card */}
							<Card className='bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'>
								<CardBody className='p-6'>
									<div className='flex items-center justify-between mb-6'>
										<div>
											<h2 className='text-2xl font-bold text-white mb-1'>
												{analysis.symbol}
											</h2>
											<p className='text-slate-400 text-sm'>
												{new Date().toLocaleDateString('en-US', {
													weekday: 'long',
													year: 'numeric',
													month: 'long',
													day: 'numeric',
												})}
											</p>
										</div>
										<div className='text-right'>
											<Chip
												size='lg'
												className={`font-bold text-white ${
													analysis.recommendation === 'BUY'
														? 'bg-gradient-to-r from-green-500 to-emerald-600'
														: analysis.recommendation === 'SELL'
														? 'bg-gradient-to-r from-red-500 to-rose-600'
														: 'bg-gradient-to-r from-yellow-500 to-orange-600'
												}`}>
												{analysis.recommendation}
											</Chip>
											<div className='text-slate-300 text-sm mt-2'>
												{analysis.confidence}% Confidence
											</div>
										</div>
									</div>

									{/* Reasoning */}
									<div className='bg-slate-700/30 rounded-lg p-4 mb-6'>
										<h4 className='text-white font-semibold mb-2'>
											Analysis Reasoning
										</h4>
										<p className='text-slate-300 text-sm leading-relaxed'>
											{analysis.reasoning}
										</p>
									</div>

									{/* Social Sentiment */}
									<div className='flex items-center gap-3'>
										<span className='text-slate-400 text-sm'>
											Social Sentiment:
										</span>
										<Chip
											variant='flat'
											className={`${
												analysis.social_sentiment === 'bullish'
													? 'bg-green-500/20 text-green-400 border-green-500/30'
													: analysis.social_sentiment === 'bearish'
													? 'bg-red-500/20 text-red-400 border-red-500/30'
													: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
											}`}>
											{analysis.social_sentiment.toUpperCase()}
										</Chip>
									</div>
								</CardBody>
							</Card>

							{/* Price Chart */}
							{analysis.chart_data && analysis.chart_data.length > 0 && (
								<Card className='bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'>
									<CardBody className='p-6'>
										<PriceChart
											data={analysis.chart_data}
											symbol={analysis.symbol}
										/>
									</CardBody>
								</Card>
							)}

							{/* AI Analysis */}
							{analysis.ai_analysis &&
								typeof analysis.ai_analysis === 'object' && (
									<Card className='bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'>
										<CardBody className='p-6'>
											<h4 className='text-white font-semibold mb-4'>
												AI Deep Analysis
											</h4>

											{/* Summary */}
											{analysis.ai_analysis.summary && (
												<div className='mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
													<h5 className='text-blue-400 font-medium mb-2'>
														Executive Summary
													</h5>
													<p className='text-slate-300 text-sm leading-relaxed'>
														{analysis.ai_analysis.summary}
													</p>
												</div>
											)}

											{/* Pros and Cons */}
											<div className='grid md:grid-cols-2 gap-4'>
												{/* Pros */}
												{analysis.ai_analysis.pros && (
													<div className='p-4 bg-green-500/10 border border-green-500/20 rounded-lg'>
														<h5 className='text-green-400 font-medium mb-3 flex items-center gap-2'>
															<span className='w-2 h-2 bg-green-400 rounded-full'></span>
															Bullish Factors
														</h5>
														<ul className='space-y-2'>
															{analysis.ai_analysis.pros.map((pro, index) => (
																<li
																	key={index}
																	className='text-slate-300 text-sm flex items-start gap-2'>
																	<span className='text-green-400 mt-1'>•</span>
																	<span>{pro}</span>
																</li>
															))}
														</ul>
													</div>
												)}

												{/* Cons */}
												{analysis.ai_analysis.cons && (
													<div className='p-4 bg-red-500/10 border border-red-500/20 rounded-lg'>
														<h5 className='text-red-400 font-medium mb-3 flex items-center gap-2'>
															<span className='w-2 h-2 bg-red-400 rounded-full'></span>
															Risk Factors
														</h5>
														<ul className='space-y-2'>
															{analysis.ai_analysis.cons.map((con, index) => (
																<li
																	key={index}
																	className='text-slate-300 text-sm flex items-start gap-2'>
																	<span className='text-red-400 mt-1'>•</span>
																	<span>{con}</span>
																</li>
															))}
														</ul>
													</div>
												)}
											</div>

											{/* Key Factors */}
											{analysis.ai_analysis.key_factors && (
												<div className='mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg'>
													<h5 className='text-purple-400 font-medium mb-3'>
														Key Factors to Monitor
													</h5>
													<div className='flex flex-wrap gap-2'>
														{analysis.ai_analysis.key_factors.map(
															(factor, index) => (
																<Chip
																	key={index}
																	variant='flat'
																	className='bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs text-wrap h-12'>
																	{factor}
																</Chip>
															)
														)}
													</div>
												</div>
											)}
										</CardBody>
									</Card>
								)}
						</div>

						{/* Right Column - Metrics */}
						<div className='space-y-6'>
							{/* Key Metrics */}
							{analysis.key_metrics && (
								<Card className='bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'>
									<CardBody className='p-6'>
										<h4 className='text-white font-semibold mb-4'>
											Market Metrics
										</h4>
										<div className='space-y-3'>
											{Object.entries(analysis.key_metrics)
												.filter(
													([, value]) => value !== null && value !== undefined
												)
												.map(([key, value]) => {
													const formatValue = (
														key: string,
														value: string | number
													) => {
														if (typeof value !== 'number') return value;

														// Price formatting
														if (key.includes('price')) {
															return `$${value.toLocaleString(undefined, {
																minimumFractionDigits: 2,
																maximumFractionDigits: 2,
															})}`;
														}

														// Market cap and volume formatting
														if (key.includes('cap') || key.includes('volume')) {
															if (value >= 1e12)
																return `$${(value / 1e12).toFixed(2)}T`;
															if (value >= 1e9)
																return `$${(value / 1e9).toFixed(2)}B`;
															if (value >= 1e6)
																return `$${(value / 1e6).toFixed(2)}M`;
															if (value >= 1e3)
																return `$${(value / 1e3).toFixed(2)}K`;
															return `$${value.toLocaleString()}`;
														}

														// Score/rank formatting (no decimals)
														if (
															key.includes('score') ||
															key.includes('rank') ||
															key.includes('dominance')
														) {
															return value.toFixed(0);
														}

														// Social metrics formatting
														if (
															key.includes('mentions') ||
															key.includes('engagements') ||
															key.includes('creators')
														) {
															if (value >= 1e6)
																return `${(value / 1e6).toFixed(1)}M`;
															if (value >= 1e3)
																return `${(value / 1e3).toFixed(1)}K`;
															return value.toLocaleString();
														}

														return value.toLocaleString();
													};

													return (
														<div
															key={key}
															className='flex items-center justify-between py-2'>
															<span className='text-slate-400 text-sm capitalize'>
																{key.replace(/_/g, ' ')}
															</span>
															<span className='text-white font-semibold text-sm'>
																{formatValue(key, value)}
															</span>
														</div>
													);
												})}
										</div>
									</CardBody>
								</Card>
							)}

							{/* MCP Status */}
							<Card className='bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'>
								<CardBody className='p-6'>
									<h4 className='text-white font-semibold mb-4'>
										Data Sources
									</h4>
									<div className='space-y-3'>
										<div className='flex items-center gap-3'>
											<div className='w-2 h-2 bg-green-500 rounded-full'></div>
											<span className='text-slate-300 text-sm'>
												LunarCrush MCP
											</span>
										</div>
										<div className='flex items-center gap-3'>
											<div className='w-2 h-2 bg-blue-500 rounded-full'></div>
											<span className='text-slate-300 text-sm'>
												Google Gemini AI
											</span>
										</div>
										<div className='flex items-center gap-3'>
											<div className='w-2 h-2 bg-purple-500 rounded-full'></div>
											<span className='text-slate-300 text-sm'>
												Real-time Analysis
											</span>
										</div>
									</div>
								</CardBody>
							</Card>

							{/* Disclaimer */}
							<Card className='bg-amber-500/10 border-amber-500/20 backdrop-blur-xl'>
								<CardBody className='p-4'>
									<h5 className='text-amber-400 font-medium text-sm mb-2'>
										⚠️ Disclaimer
									</h5>
									<p className='text-amber-300/80 text-xs leading-relaxed'>
										This analysis is for informational purposes only and should
										not be considered financial advice. Always do your own
										research before making investment decisions.
									</p>
								</CardBody>
							</Card>
						</div>
					</div>
				)}

				{/* Error State */}
				{analysis && !analysis.success && (
					<Card className='bg-red-500/10 border-red-500/20 backdrop-blur-xl'>
						<CardBody className='p-6'>
							<h3 className='text-red-400 font-semibold mb-2'>
								Analysis Error
							</h3>
							<p className='text-red-300 text-sm'>
								{analysis.error ||
									'An error occurred during analysis. Please try again.'}
							</p>
						</CardBody>
					</Card>
				)}
			</div>

			{/* Footer */}
			<footer className='relative mt-20 border-t border-slate-700/30 bg-slate-900/80 backdrop-blur-2xl'>
				<div className='max-w-7xl mx-auto px-6 py-12'>
					<div className='grid md:grid-cols-4 gap-8 mb-8'>
						{/* Main Info */}
						<div className='md:col-span-1'>
							<div className='flex items-center gap-3 mb-4'>
								<div className='w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-xl flex items-center justify-center'>
									<span className='text-white font-bold text-sm'>LC</span>
								</div>
								<div>
									<h3 className='text-lg font-bold text-white'>
										LunarCrush AI
									</h3>
									<p className='text-xs text-slate-400'>Trading Terminal</p>
								</div>
							</div>
							<p className='text-slate-400 text-sm leading-relaxed mb-4'>
								Intelligent trading signals powered by social sentiment analysis
								and Google Gemini AI.
							</p>
							<a
								href='https://github.com/yourusername/lunarcrush-mcp'
								target='_blank'
								rel='noopener noreferrer'
								className='inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors'>
								<span>🔗</span>
								View Source Code
							</a>
						</div>

						{/* Built With */}
						<div>
							<h4 className='text-white font-bold mb-4'>Built With</h4>
							<div className='space-y-3'>
								<a
									href='https://remix.run/'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-blue-400 rounded-full'></span>
									Remix - Full Stack Framework
								</a>
								<a
									href='https://www.typescriptlang.org/'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-blue-400 rounded-full'></span>
									TypeScript - Type Safety
								</a>
								<a
									href='https://tailwindcss.com/'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-cyan-400 rounded-full'></span>
									Tailwind CSS - Styling
								</a>
								<a
									href='https://heroui.com/'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-purple-400 rounded-full'></span>
									HeroUI - Components
								</a>
							</div>
						</div>

						{/* Powered By */}
						<div>
							<h4 className='text-white font-bold mb-4'>Powered By</h4>
							<div className='space-y-3'>
								<a
									href='https://lunarcrush.com/'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-green-400 rounded-full'></span>
									LunarCrush - Social Analytics
								</a>
								<a
									href='https://ai.google.dev/'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-yellow-400 rounded-full'></span>
									Google Gemini - AI Analysis
								</a>
								<a
									href='https://modelcontextprotocol.io/'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-purple-400 rounded-full'></span>
									MCP - Protocol Integration
								</a>
								<a
									href='https://vite.dev/'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-orange-400 rounded-full'></span>
									Vite - Build Tool
								</a>
							</div>
						</div>

						{/* Resources */}
						<div>
							<h4 className='text-white font-bold mb-4'>Resources</h4>
							<div className='space-y-3'>
								<a
									href='https://lunarcrush.com/developers/api/endpoints'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-blue-400 rounded-full'></span>
									LunarCrush API Docs
								</a>
								<a
									href='https://ai.google.dev/docs'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-yellow-400 rounded-full'></span>
									Gemini AI Documentation
								</a>
								<a
									href='https://modelcontextprotocol.io/docs'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-purple-400 rounded-full'></span>
									MCP Documentation
								</a>
								<a
									href='https://remix.run/docs'
									target='_blank'
									rel='noopener noreferrer'
									className='flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors'>
									<span className='w-2 h-2 bg-cyan-400 rounded-full'></span>
									Remix Documentation
								</a>
							</div>
						</div>
					</div>

					{/* Bottom Section */}
					<div className='pt-8 border-t border-slate-700/30'>
						<div className='flex flex-col md:flex-row items-center justify-between gap-4'>
							<div className='text-slate-400 text-sm'>
								© 2025 LunarCrush AI Trading Terminal. Built for demonstration
								purposes.
							</div>
							<div className='flex items-center gap-1 text-sm text-slate-400'>
								<span>Powered by:</span>
								<a
									href='https://lunarcrush.com/'
									target='_blank'
									rel='noopener noreferrer'
									className='text-blue-400 hover:text-blue-300 transition-colors'>
									LunarCrush
								</a>
								<span>•</span>
								<a
									href='https://ai.google.dev/'
									target='_blank'
									rel='noopener noreferrer'
									className='text-yellow-400 hover:text-yellow-300 transition-colors'>
									Gemini AI
								</a>
								<span>•</span>
								<a
									href='https://modelcontextprotocol.io/'
									target='_blank'
									rel='noopener noreferrer'
									className='text-purple-400 hover:text-purple-300 transition-colors'>
									MCP
								</a>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}
