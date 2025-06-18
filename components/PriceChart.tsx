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
	const priceChangePercent = firstPrice ? (priceChange / firstPrice) * 100 : 0;
	const isPositive = priceChange >= 0;

	// Dynamic color based on price trend
	const lineColor = isPositive ? '#10b981' : '#ef4444'; // green or red
	const gradientColor = isPositive ? '#10b981' : '#ef4444';

	return (
		<div className='w-full'>
			{/* Header with price info */}
			<div className='flex justify-between items-center mb-4'>
				<h4 className='text-lg font-semibold'>{symbol} Price Chart</h4>
				<div className='text-right'>
					<div className='text-2xl font-bold'>
						$
						{lastPrice.toLocaleString(undefined, {
							minimumFractionDigits: 2,
							maximumFractionDigits: 2,
						})}
					</div>
					<div
						className={`text-sm font-medium ${
							isPositive ? 'text-green-600' : 'text-red-600'
						}`}>
						{isPositive ? '+' : ''}
						{priceChangePercent.toFixed(2)}% ({isPositive ? '+' : ''}$
						{priceChange.toFixed(2)})
					</div>
				</div>
			</div>

			{/* Chart */}
			<div className='h-80 w-full'>
				<ResponsiveContainer width='100%' height='100%'>
					<AreaChart
						data={optimizedData}
						margin={{ top: 10, right: 30, left: 20, bottom: 20 }}>
						<defs>
							<linearGradient id='colorGradient' x1='0' y1='0' x2='0' y2='1'>
								<stop offset='5%' stopColor={gradientColor} stopOpacity={0.3} />
								<stop
									offset='95%'
									stopColor={gradientColor}
									stopOpacity={0.0}
								/>
							</linearGradient>
						</defs>
						<CartesianGrid strokeDasharray='3 3' opacity={0.3} />
						<XAxis
							dataKey='date'
							tick={{ fontSize: 11 }}
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
							tick={{ fontSize: 11 }}
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
								backgroundColor: 'rgba(255, 255, 255, 0.95)',
								border: '1px solid #e5e7eb',
								borderRadius: '8px',
								boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
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
								r: 6,
								fill: lineColor,
								strokeWidth: 2,
								stroke: '#ffffff',
							}}
						/>
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	);
}
