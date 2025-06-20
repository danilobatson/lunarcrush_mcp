import {
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	Area,
	AreaChart,
} from 'recharts';

interface ChartData {
	date: string;
	price: number;
}

interface PriceChartProps {
	data: ChartData[];
	symbol: string;
}

export default function PriceChart({ data, symbol }: PriceChartProps) {
	if (!data || data.length === 0) {
		return (
			<div className='p-6 text-center text-gray-500'>
				<p>No price chart data available</p>
			</div>
		);
	}

	// Filter out invalid data points
	const validData = data.filter(
		(item) => item.date && item.price && !isNaN(item.price) && item.price > 0
	);

	if (validData.length === 0) {
		return (
			<div className='p-6 text-center text-gray-500'>
				<p>No valid price data available for chart</p>
			</div>
		);
	}

	// Reduce data points for better UX - show every 3rd point if we have too many
	const optimizedData =
		validData.length > 20
			? validData.filter(
					(_, index) => index % Math.ceil(validData.length / 20) === 0
			)
			: validData;

	// Calculate price change for styling
	const firstPrice = optimizedData[0]?.price || 0;
	const lastPrice = optimizedData[optimizedData.length - 1]?.price || 0;
	const priceChange = lastPrice - firstPrice;
	// const priceChangePercent = firstPrice ? (priceChange / firstPrice) * 100 : 0;
	const isPositive = priceChange >= 0;

	// Dynamic color based on price trend
	const lineColor = isPositive ? '#10b981' : '#ef4444'; // green or red
	const gradientColor = isPositive ? '#10b981' : '#ef4444';

	return (
		<div className='w-full'>
			{/* Enhanced Header with price info */}
			<div className='flex justify-between items-start mb-6'>
				<div>
					<h4 className='text-2xl font-bold text-white mb-2 flex items-center gap-3'>
						<div className='w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center'>
							<span className='text-white text-sm'>📈</span>
						</div>
						{symbol} Price Chart
					</h4>
					<p className='text-slate-400'>
						Interactive price movement visualization
					</p>
				</div>

			</div>

			{/* Enhanced Chart */}
			<div className='h-96 w-full bg-slate-900/30 rounded-xl p-4 border border-slate-700/30'>
				<ResponsiveContainer width='100%' height='100%'>
					<AreaChart
						data={optimizedData}
						margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
						<defs>
							<linearGradient id='colorGradient' x1='0' y1='0' x2='0' y2='1'>
								<stop offset='5%' stopColor={gradientColor} stopOpacity={0.4} />
								<stop
									offset='95%'
									stopColor={gradientColor}
									stopOpacity={0.0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid
							strokeDasharray='3 3'
							stroke='#475569'
							opacity={0.2}
						/>
						<XAxis
							dataKey='date'
							tick={{ fontSize: 12, fill: '#94a3b8' }}
							axisLine={false}
							tickLine={false}
							tickFormatter={(date) => {
								try {
									const parsedDate = new Date(date);
									return parsedDate.toLocaleDateString('en-US', {
										month: 'short',
										day: 'numeric',
									});
								} catch {
									return date;
								}
							}}
						/>
						<YAxis
							tick={{ fontSize: 12, fill: '#94a3b8' }}
							axisLine={false}
							tickLine={false}
							domain={['dataMin - 50', 'dataMax + 50']}
							tickFormatter={(value) =>
								`$${value.toLocaleString(undefined, {
									minimumFractionDigits: 0,
									maximumFractionDigits: 0,
								})}`
							}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: 'rgba(15, 23, 42, 0.95)',
								border: '1px solid rgba(148, 163, 184, 0.3)',
								borderRadius: '12px',
								boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
								color: '#ffffff',
								fontSize: '14px',
								fontWeight: '500',
							}}
							labelFormatter={(date) => {
								try {
									return new Date(date).toLocaleString('en-US', {
										weekday: 'short',
										month: 'short',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit',
									});
								} catch {
									return date;
								}
							}}
							formatter={(value: number) => [
								`$${value.toLocaleString(undefined, {
									minimumFractionDigits: 2,
									maximumFractionDigits: 2,
								})}`,
								'Price',
							]}
						/>
						<Area
							type='monotone'
							dataKey='price'
							stroke={lineColor}
							strokeWidth={3}
							fill='url(#colorGradient)'
							dot={false}
							activeDot={{
								r: 8,
								fill: lineColor,
								strokeWidth: 3,
								stroke: '#ffffff',
								filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))',
							}}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
