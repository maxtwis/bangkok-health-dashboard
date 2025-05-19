import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatYear } from '../DataUtils';

const OverallTrendChart = ({ data }) => {
  return (
    <div className="h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="year" 
            tickFormatter={formatYear}
            angle={-45}
            textAnchor="end"
            height={70}
          />
          <YAxis 
            label={{ 
              value: 'Percentage (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
              dx: -10
            }}
            tickFormatter={(value) => `${value}`}
            domain={[0, 'dataMax + 5']}
            allowDecimals={false}
            padding={{ top: 20 }}
          />
          <Tooltip 
            formatter={(value) => [`${value}%`, 'Drinking Rate']}
            labelFormatter={(year) => `Year: ${formatYear(year)}`}
          />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Line 
            type="monotone" 
            dataKey="value" 
            name="Drinking Rate" 
            stroke="#8884d8" 
            activeDot={{ r: 8 }} 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default OverallTrendChart;