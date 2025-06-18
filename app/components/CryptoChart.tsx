import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
} from 'recharts';

interface ChartData {
	date: string;
	close: number;
}

interface CryptoChartProps {
	data: ChartData[];
	symbol: string;
}

export default function CryptoChart({ data, symbol }: CryptoChartProps) {
	if (!data || data.length === 0) {
		return (
			<div className='flex items-center justify-center h-64 bg-gray-50 dark:bg-gray-800 rounded-lg'>
				<p className='text-gray-500 dark:text-gray-400'>
					No chart data available
				</p>
			</div>
		);
	}

	// Format the date for display
	const formatDate = (dateStr: string) => {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
		});
	};

	// Format price for display
	const formatPrice = (price: number) => {
		if (price < 0.01) {
			return `$${price.toFixed(6)}`;
		} else if (price < 1) {
			return `$${price.toFixed(4)}`;
		} else {
			return `$${price.toLocaleString()}`;
		}
	};

	return (
		<div className='w-full'>
			<div className='mb-4'>
				<h3 className='text-lg font-semibold text-gray-800 dark:text-white'>
					{symbol} Price History (Last Week)
				</h3>
				<p className='text-sm text-gray-600 dark:text-gray-400'>
					Historical price data from LunarCrush Topic_Time_Series
				</p>
			</div>

			<div className='h-64 w-full'>
				<ResponsiveContainer width='100%' height='100%'>
					<LineChart
						data={data}
						margin={{
							top: 5,
							right: 30,
							left: 20,
							bottom: 5,
						}}>
						<CartesianGrid
							strokeDasharray='3 3'
							stroke='#374151'
							opacity={0.3}
						/>
						<XAxis
							dataKey='date'
							tickFormatter={formatDate}
							stroke='#6B7280'
							fontSize={12}
						/>
						<YAxis tickFormatter={formatPrice} stroke='#6B7280' fontSize={12} />
						<Tooltip
							labelFormatter={(label) => `Date: ${formatDate(label)}`}
							formatter={(value: number) => [formatPrice(value), 'Price']}
							contentStyle={{
								backgroundColor: '#1F2937',
								border: '1px solid #374151',
								borderRadius: '6px',
								color: '#F9FAFB',
							}}
						/>
						<Line
							type='monotone'
							dataKey='close'
							stroke='#3B82F6'
							strokeWidth={2}
							dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
							activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>

			<div className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
				Data points: {data.length} | Range:{' '}
				{formatPrice(Math.min(...data.map((d) => d.close)))} -{' '}
				{formatPrice(Math.max(...data.map((d) => d.close)))}
			</div>
		</div>
	);
}
