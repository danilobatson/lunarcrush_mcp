import { useState, useEffect } from 'react';
import { useFetcher } from '@remix-run/react';
import { json, type MetaFunction } from '@remix-run/node';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Card, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import PriceChart from '../../components/PriceChart';

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

export async function loader() {
	return json({ message: 'Trading terminal loaded successfully' });
}

export default function TradingIndex() {
	const [searchTerm, setSearchTerm] = useState('');
	const [progressStep, setProgressStep] = useState(0);
	const [progressPercent, setProgressPercent] = useState(0);
	const [subStepMessage, setSubStepMessage] = useState('');
	const fetcher = useFetcher();

	const loading = fetcher.state === 'submitting';

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

		if (loading) {
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
					// Each step represents equal progress up to 95%
					const progressByStep = Math.round(
						(finalStep + 1) * (95 / progressSteps.length)
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
	}, [loading, progressSteps.length]); // Only depend on loading state

	const handleSearch = () => {
		if (!searchTerm.trim()) return;

		const formData = new FormData();
		formData.append('symbol', searchTerm.trim());

		fetcher.submit(formData, {
			method: 'post',
			action: '/api/analyze',
		});
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
							<div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
							<span className='text-sm text-slate-300'>MCP Connected</span>
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
									onPress={handleSearch}
									isLoading={loading}
									className='px-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'>
									{loading ? 'Analyzing...' : 'Analyze'}
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
				{loading && (
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
				{fetcher.data && fetcher.data.success && fetcher.data.analysis && (
					<div className='grid lg:grid-cols-3 gap-6'>
						{/* Left Column - Main Analysis */}
						<div className='lg:col-span-2 space-y-6'>
							{/* Signal Card */}
							<Card className='bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'>
								<CardBody className='p-6'>
									<div className='flex items-center justify-between mb-6'>
										<div>
											<h2 className='text-2xl font-bold text-white mb-1'>
												{fetcher.data.analysis.symbol}
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
													fetcher.data.analysis.recommendation === 'BUY'
														? 'bg-gradient-to-r from-green-500 to-emerald-600'
														: fetcher.data.analysis.recommendation === 'SELL'
														? 'bg-gradient-to-r from-red-500 to-rose-600'
														: 'bg-gradient-to-r from-yellow-500 to-orange-600'
												}`}>
												{fetcher.data.analysis.recommendation}
											</Chip>
											<div className='text-slate-300 text-sm mt-2'>
												{fetcher.data.analysis.confidence}% Confidence
											</div>
										</div>
									</div>

									{/* Reasoning */}
									<div className='bg-slate-700/30 rounded-lg p-4 mb-6'>
										<h4 className='text-white font-semibold mb-2'>
											Analysis Reasoning
										</h4>
										<p className='text-slate-300 text-sm leading-relaxed'>
											{fetcher.data.analysis.reasoning}
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
												fetcher.data.analysis.social_sentiment === 'bullish'
													? 'bg-green-500/20 text-green-400 border-green-500/30'
													: fetcher.data.analysis.social_sentiment === 'bearish'
													? 'bg-red-500/20 text-red-400 border-red-500/30'
													: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
											}`}>
											{fetcher.data.analysis.social_sentiment.toUpperCase()}
										</Chip>
									</div>
								</CardBody>
							</Card>

							{/* Price Chart */}
							{fetcher.data.analysis.chart_data &&
								fetcher.data.analysis.chart_data.length > 0 && (
									<Card className='bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'>
										<CardBody className='p-6'>
											<PriceChart
												data={fetcher.data.analysis.chart_data}
												symbol={fetcher.data.analysis.symbol}
											/>
										</CardBody>
									</Card>
								)}

							{/* AI Analysis */}
							{fetcher.data.analysis.ai_analysis &&
								typeof fetcher.data.analysis.ai_analysis === 'object' && (
									<Card className='bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'>
										<CardBody className='p-6'>
											<h4 className='text-white font-semibold mb-4'>
												AI Deep Analysis
											</h4>

											{/* Summary */}
											{fetcher.data.analysis.ai_analysis.summary && (
												<div className='mb-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg'>
													<h5 className='text-blue-400 font-medium mb-2'>
														Executive Summary
													</h5>
													<p className='text-slate-300 text-sm leading-relaxed'>
														{fetcher.data.analysis.ai_analysis.summary}
													</p>
												</div>
											)}

											{/* Pros and Cons */}
											<div className='grid md:grid-cols-2 gap-4'>
												{/* Pros */}
												{fetcher.data.analysis.ai_analysis.pros && (
													<div className='p-4 bg-green-500/10 border border-green-500/20 rounded-lg'>
														<h5 className='text-green-400 font-medium mb-3 flex items-center gap-2'>
															<span className='w-2 h-2 bg-green-400 rounded-full'></span>
															Bullish Factors
														</h5>
														<ul className='space-y-2'>
															{fetcher.data.analysis.ai_analysis.pros.map(
																(pro, index) => (
																	<li
																		key={index}
																		className='text-slate-300 text-sm flex items-start gap-2'>
																		<span className='text-green-400 mt-1'>
																			•
																		</span>
																		<span>{pro}</span>
																	</li>
																)
															)}
														</ul>
													</div>
												)}

												{/* Cons */}
												{fetcher.data.analysis.ai_analysis.cons && (
													<div className='p-4 bg-red-500/10 border border-red-500/20 rounded-lg'>
														<h5 className='text-red-400 font-medium mb-3 flex items-center gap-2'>
															<span className='w-2 h-2 bg-red-400 rounded-full'></span>
															Risk Factors
														</h5>
														<ul className='space-y-2'>
															{fetcher.data.analysis.ai_analysis.cons.map(
																(con, index) => (
																	<li
																		key={index}
																		className='text-slate-300 text-sm flex items-start gap-2'>
																		<span className='text-red-400 mt-1'>•</span>
																		<span>{con}</span>
																	</li>
																)
															)}
														</ul>
													</div>
												)}
											</div>

											{/* Key Factors */}
											{fetcher.data.analysis.ai_analysis.key_factors && (
												<div className='mt-4 p-4 bg-purple-500/10 border border-purple-500/20 rounded-lg'>
													<h5 className='text-purple-400 font-medium mb-3'>
														Key Factors to Monitor
													</h5>
													<div className='flex flex-wrap gap-2'>
														{fetcher.data.analysis.ai_analysis.key_factors.map(
															(factor, index) => (
																<Chip
																	key={index}
																	variant='flat'
																	className='bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs'>
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
							{fetcher.data.analysis.key_metrics && (
								<Card className='bg-slate-800/50 border-slate-700/50 backdrop-blur-xl'>
									<CardBody className='p-6'>
										<h4 className='text-white font-semibold mb-4'>
											Market Metrics
										</h4>
										<div className='space-y-4'>
											{Object.entries(fetcher.data.analysis.key_metrics)
												.filter(
													([, value]) => value !== null && value !== undefined
												)
												.map(([key, value]) => (
													<div
														key={key}
														className='flex items-center justify-between py-2 border-b border-slate-700/50 last:border-b-0'>
														<span className='text-slate-400 text-sm capitalize'>
															{key.replace(/_/g, ' ')}
														</span>
														<span className='text-white font-medium text-sm'>
															{typeof value === 'number'
																? key.includes('price') ||
																  key.includes('cap') ||
																  key.includes('volume')
																	? `$${value.toLocaleString()}`
																	: key.includes('mentions') ||
																	  key.includes('engagements') ||
																	  key.includes('creators')
																	? `${value.toLocaleString()}`
																	: value.toLocaleString()
																: value}
														</span>
													</div>
												))}
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
				{fetcher.data && !fetcher.data.success && (
					<Card className='bg-red-500/10 border-red-500/20 backdrop-blur-xl'>
						<CardBody className='p-6'>
							<h3 className='text-red-400 font-semibold mb-2'>
								Analysis Error
							</h3>
							<p className='text-red-300 text-sm'>
								{fetcher.data.error ||
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
