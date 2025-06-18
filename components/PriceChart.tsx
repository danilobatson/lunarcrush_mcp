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

	return (
		<div className='w-full h-64'>
			<h4 className='text-lg font-semibold mb-3 text-center'>
				{symbol} Price Chart - Last Week
			</h4>
			<ResponsiveContainer width='100%' height='100%'>
				<LineChart
					data={data}
					margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
					<CartesianGrid strokeDasharray='3 3' />
					<XAxis
						dataKey='date'
						tick={{ fontSize: 12 }}
						tickFormatter={(date) =>
							new Date(date).toLocaleDateString('en-US', {
								month: 'short',
								day: 'numeric',
							})
						}
					/>
					<YAxis
						tick={{ fontSize: 12 }}
						tickFormatter={(value) => `$${value.toLocaleString()}`}
					/>
					<Tooltip
						labelFormatter={(date) => new Date(date).toLocaleDateString()}
						formatter={(value: number) => [
							`$${value.toLocaleString()}`,
							'Price',
						]}
					/>
					<Line
						type='monotone'
						dataKey='price'
						stroke='#2563eb'
						strokeWidth={2}
						dot={{ r: 4 }}
						activeDot={{ r: 6 }}
					/>
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
}
