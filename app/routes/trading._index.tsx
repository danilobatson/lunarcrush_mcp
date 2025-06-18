import { useState } from 'react';
import { useFetcher } from '@remix-run/react';
import { json, type MetaFunction } from '@remix-run/node';
import { Input } from '@heroui/input';
import { Button } from '@heroui/button';
import { Card, CardHeader, CardBody } from '@heroui/card';
import { Chip } from '@heroui/chip';
import PriceChart from '../../components/PriceChart';

export const meta: MetaFunction = () => {
	return [
		{ title: 'Social Intelligence Trading | MCP Powered' },
		{
			name: 'description',
			content:
				'AI-powered trading signals using LunarCrush MCP and Google Gemini',
		},
	];
};

export async function loader() {
	return json({ message: 'Trading page loaded successfully' });
}

export default function TradingIndex() {
	const [searchTerm, setSearchTerm] = useState('');
	const fetcher = useFetcher();

	const loading = fetcher.state === 'submitting';

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
		<div className='min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800'>
			{/* Hero Section */}
			<section className='flex flex-col items-center justify-center px-6 py-20 text-center'>
				<div className='max-w-4xl'>
					<h1 className='text-4xl font-bold mb-4'>
						Social Intelligence Trading
					</h1>
					<h2 className='text-lg text-gray-600 mb-8'>
						AI-powered trading signals using{' '}
						<span className='text-blue-600 font-semibold'>LunarCrush MCP</span>{' '}
						and{' '}
						<span className='text-green-600 font-semibold'>Google Gemini</span>
					</h2>

					{/* Key Benefits */}
					<div className='grid md:grid-cols-3 gap-6 mb-12 text-left'>
						<Card className='p-4'>
							<CardHeader>
								<h3 className='text-lg font-semibold text-blue-600'>
									🔄 Real-time MCP
								</h3>
							</CardHeader>
							<CardBody>
								<p className='text-sm'>
									Direct protocol connection for instant data access with full
									transparency
								</p>
							</CardBody>
						</Card>

						<Card className='p-4'>
							<CardHeader>
								<h3 className='text-lg font-semibold text-green-600'>
									🤖 AI Analysis
								</h3>
							</CardHeader>
							<CardBody>
								<p className='text-sm'>
									Google Gemini processes social patterns for BUY/SELL/HOLD
									recommendations
								</p>
							</CardBody>
						</Card>

						<Card className='p-4'>
							<CardHeader>
								<h3 className='text-lg font-semibold text-purple-600'>
									📊 Any Coin
								</h3>
							</CardHeader>
							<CardBody>
								<p className='text-sm'>
									Search any cryptocurrency or stock, not limited to preset
									options
								</p>
							</CardBody>
						</Card>
					</div>

					{/* Search Interface */}
					<div className='max-w-2xl mx-auto'>
						<Card className='p-8 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70'>
							<CardHeader>
								<h3 className='text-xl font-semibold mb-4'>
									Get Trading Signals
								</h3>
							</CardHeader>
							<CardBody>
								<div className='flex gap-4 mb-6'>
									<Input
										placeholder='Search any coin (e.g., BTC, ETH, DOGE)...'
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
										size='lg'
										variant='bordered'
										className='flex-1'
									/>
									<Button
										color='primary'
										size='lg'
										onPress={handleSearch}
										isLoading={loading}
										className='px-8'>
										Analyze
									</Button>
								</div>

								{/* Quick Search Chips */}
								<div className='flex flex-wrap gap-2 justify-center'>
									<span className='text-sm text-gray-600 mr-2'>
										Quick search:
									</span>
									{['BTC', 'ETH', 'SOL', 'ADA', 'DOGE'].map((coin) => (
										<Chip
											key={coin}
											variant='flat'
											color='primary'
											className='cursor-pointer hover:bg-primary-100'
											onClick={() => setSearchTerm(coin)}>
											{coin}
										</Chip>
									))}
								</div>
							</CardBody>
						</Card>

						{/* Loading State */}
						{loading && (
							<Card className='mt-6 p-6'>
								<div className='text-center'>
									<div className='animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4'></div>
									<p>Analyzing social sentiment and market data via MCP...</p>
									<p className='text-sm text-gray-600 mt-2'>
										🔄 Connecting to LunarCrush MCP → 📊 Fetching data → 🤖 AI
										Analysis
									</p>
								</div>
							</Card>
						)}

						{/* Results Display - Enhanced for new analysis format */}
						{fetcher.data && (
							<Card className='mt-6 p-6'>
								<CardHeader>
									<h3 className='text-xl font-semibold'>
										{fetcher.data.success
											? 'AI Trading Analysis'
											: 'Analysis Error'}
									</h3>
								</CardHeader>
								<CardBody>
									{fetcher.data.success && fetcher.data.analysis ? (
										<div className='space-y-6'>
											{/* Trading Recommendation */}
											<div className='text-center p-6 rounded-lg bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20'>
												<div className='flex items-center justify-center gap-4 mb-4'>
													<span className='text-2xl font-bold text-gray-800 dark:text-white'>
														{fetcher.data.analysis.symbol}
													</span>
													<Chip
														size='lg'
														color={
															fetcher.data.analysis.recommendation === 'BUY'
																? 'success'
																: fetcher.data.analysis.recommendation ===
																  'SELL'
																? 'danger'
																: 'warning'
														}
														variant='solid'
														className='text-white font-bold'>
														{fetcher.data.analysis.recommendation}
													</Chip>
												</div>
												<div className='flex items-center justify-center gap-6 text-sm'>
													<div>
														<span className='text-gray-600 dark:text-gray-400'>
															Confidence:
														</span>
														<span className='ml-2 font-semibold'>
															{fetcher.data.analysis.confidence}%
														</span>
													</div>
													<div>
														<span className='text-gray-600 dark:text-gray-400'>
															Social Sentiment:
														</span>
														<span className='ml-2 font-semibold capitalize'>
															{fetcher.data.analysis.social_sentiment}
														</span>
													</div>
												</div>
											</div>

											{/* Price Chart */}
											{fetcher.data.analysis.chart_data &&
												fetcher.data.analysis.chart_data.length > 0 && (
													<Card className='p-4'>
														<PriceChart
															data={fetcher.data.analysis.chart_data}
															symbol={fetcher.data.analysis.symbol}
														/>
													</Card>
												)}

											{/* AI Analysis - Chart Description */}
											{fetcher.data.analysis.ai_analysis?.chart_description && (
												<div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
													<h5 className='font-semibold text-blue-800 dark:text-blue-200 mb-2'>
														Chart Analysis
													</h5>
													<p className='text-sm leading-relaxed'>
														{
															fetcher.data.analysis.ai_analysis
																.chart_description
														}
													</p>
												</div>
											)}

											{/* Key Metrics */}
											{fetcher.data.analysis.key_metrics && (
												<div>
													<h4 className='text-lg font-semibold mb-3'>
														Key Metrics
													</h4>
													<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
														{Object.entries(fetcher.data.analysis.key_metrics)
															.filter(
																([, value]) =>
																	value !== null && value !== undefined
															)
															.map(([key, value]) => (
																<div
																	key={key}
																	className='p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
																	<div className='text-xs text-gray-600 dark:text-gray-400 uppercase tracking-wide'>
																		{key.replace(/_/g, ' ')}
																	</div>
																	<div className='text-sm font-semibold mt-1'>
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
																	</div>
																</div>
															))}
													</div>
												</div>
											)}

											{/* AI Analysis */}
											<div>
												<h4 className='text-lg font-semibold mb-3'>
													AI Analysis
												</h4>
												{/* Check if we have structured AI analysis */}
												{fetcher.data.analysis.ai_analysis &&
												typeof fetcher.data.analysis.ai_analysis === 'object' &&
												fetcher.data.analysis.ai_analysis.summary ? (
													<div className='space-y-4'>
														{/* Summary */}
														<div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
															<h5 className='font-semibold text-blue-800 dark:text-blue-200 mb-2'>
																Summary
															</h5>
															<p className='text-sm leading-relaxed'>
																{fetcher.data.analysis.ai_analysis.summary}
															</p>
														</div>

														{/* Pros and Cons */}
														<div className='grid md:grid-cols-2 gap-4'>
															{/* Pros */}
															{fetcher.data.analysis.ai_analysis.pros &&
																fetcher.data.analysis.ai_analysis.pros.length >
																	0 && (
																	<div className='p-4 bg-green-50 dark:bg-green-900/20 rounded-lg'>
																		<h5 className='font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center'>
																			✅ Positives
																		</h5>
																		<ul className='space-y-2'>
																			{fetcher.data.analysis.ai_analysis.pros.map(
																				(pro, index) => (
																					<li
																						key={index}
																						className='text-sm flex items-start'>
																						<span className='text-green-600 mr-2'>
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
															{fetcher.data.analysis.ai_analysis.cons &&
																fetcher.data.analysis.ai_analysis.cons.length >
																	0 && (
																	<div className='p-4 bg-red-50 dark:bg-red-900/20 rounded-lg'>
																		<h5 className='font-semibold text-red-800 dark:text-red-200 mb-3 flex items-center'>
																			⚠️ Risks
																		</h5>
																		<ul className='space-y-2'>
																			{fetcher.data.analysis.ai_analysis.cons.map(
																				(con, index) => (
																					<li
																						key={index}
																						className='text-sm flex items-start'>
																						<span className='text-red-600 mr-2'>
																							•
																						</span>
																						<span>{con}</span>
																					</li>
																				)
																			)}
																		</ul>
																	</div>
																)}
														</div>

														{/* Key Factors */}
														{fetcher.data.analysis.ai_analysis.key_factors &&
															fetcher.data.analysis.ai_analysis.key_factors
																.length > 0 && (
																<div className='p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg'>
																	<h5 className='font-semibold text-purple-800 dark:text-purple-200 mb-3'>
																		🎯 Key Factors to Watch
																	</h5>
																	<ul className='space-y-2'>
																		{fetcher.data.analysis.ai_analysis.key_factors.map(
																			(factor, index) => (
																				<li
																					key={index}
																					className='text-sm flex items-start'>
																					<span className='text-purple-600 mr-2'>
																						•
																					</span>
																					<span>{factor}</span>
																				</li>
																			)
																		)}
																	</ul>
																</div>
															)}
													</div>
												) : (
													/* Fallback for simple text analysis */
													<div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg'>
														<p className='text-sm leading-relaxed'>
															{fetcher.data.analysis.reasoning}
														</p>
														{fetcher.data.analysis.ai_analysis &&
															typeof fetcher.data.analysis.ai_analysis ===
																'string' &&
															fetcher.data.analysis.ai_analysis !==
																fetcher.data.analysis.reasoning && (
																<div className='mt-3 pt-3 border-t border-blue-200 dark:border-blue-700'>
																	<p className='text-sm leading-relaxed'>
																		{fetcher.data.analysis.ai_analysis}
																	</p>
																</div>
															)}
													</div>
												)}
											</div>

											{/* Technical Details */}
											<details className='text-sm'>
												<summary className='cursor-pointer font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'>
													Technical Details
												</summary>
												<div className='mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg'>
													<div className='grid grid-cols-2 gap-4 text-xs'>
														<div>
															<span className='text-gray-600 dark:text-gray-400'>
																Timestamp:
															</span>
															<div className='font-mono'>
																{new Date(
																	fetcher.data.analysis.timestamp
																).toLocaleString()}
															</div>
														</div>
														<div>
															<span className='text-gray-600 dark:text-gray-400'>
																Analysis Method:
															</span>
															<div>Gemini AI + LunarCrush MCP</div>
														</div>
													</div>
												</div>
											</details>
										</div>
									) : (
										<div className='text-red-600 dark:text-red-400'>
											<p className='font-semibold'>Error:</p>
											<p className='text-sm'>
												{fetcher.data.error || 'Unknown error occurred'}
											</p>
										</div>
									)}
								</CardBody>
							</Card>
						)}
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className='text-center py-8 px-6 border-t border-gray-200 dark:border-gray-700'>
				<p className='text-sm text-gray-600 dark:text-gray-400'>
					Powered by <span className='font-semibold'>LunarCrush MCP</span> •{' '}
					<span className='font-semibold'>Google Gemini</span> •{' '}
					<span className='font-semibold'>Model Context Protocol</span>
				</p>
				<p className='text-xs text-gray-500 mt-2'>
					Educational demonstration of MCP protocol benefits vs traditional API
					integration
				</p>
			</footer>
		</div>
	);
}
