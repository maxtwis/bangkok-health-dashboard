import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatYear } from '../DataUtils';

const SexComparisonChart = ({ data, indicatorName = 'Alcohol Drinking Rate' }) => {
  // Check if the data includes lgbt category
  const hasLgbt = data.some(item => 'lgbt' in item && item.lgbt !== null && item.lgbt !== undefined);

  return (
    <div className="h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
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
            formatter={(value) => [`${value}%`, indicatorName]}
            labelFormatter={(year) => `Year: ${formatYear(year)}`}
          />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Bar dataKey="male" name="Male" fill="#8884d8" />
          <Bar dataKey="female" name="Female" fill="#82ca9d" />
          {hasLgbt && <Bar dataKey="lgbt" name="LGBT" fill="#ffc658" />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SexComparisonChart;