import React, { useMemo } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatYear } from '../DataUtils';

const OverallTrendChart = ({ data, indicatorName = 'Alcohol Drinking Rate', selectedIndicator }) => {
  // Calculate dynamic Y-axis domain based on data
  const yAxisConfig = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        domain: [0, 50],
        label: 'Percentage (%)',
        tickFormatter: (value) => `${value}%`
      };
    }

    const values = data.map(d => d.value).filter(v => v !== null && v !== undefined && !isNaN(v));
    
    if (values.length === 0) {
      return {
        domain: [0, 50],
        label: 'Percentage (%)',
        tickFormatter: (value) => `${value}%`
      };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Determine appropriate scale based on indicator type
    let domain, label, tickFormatter;
    
    if (selectedIndicator === 'traffic_death_rate') {
      // Traffic death rate is typically much lower and uses different units
      const padding = (max - min) * 0.2 || 1; // 20% padding or minimum 1
      domain = [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
      label = 'Rate per 100,000 population';
      tickFormatter = (value) => `${value}`;
    } else {
      // Percentage-based indicators (alcohol, smoking, obesity)
      const padding = (max - min) * 0.2 || 2; // 20% padding or minimum 2%
      const minDomain = Math.max(0, Math.floor(min - padding));
      const maxDomain = Math.min(100, Math.ceil(max + padding)); // Cap at 100% for percentages
      domain = [minDomain, maxDomain];
      label = 'Percentage (%)';
      tickFormatter = (value) => `${value}%`;
    }

    return { domain, label, tickFormatter };
  }, [data, selectedIndicator]);

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
              value: yAxisConfig.label, 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
              dx: -10
            }}
            tickFormatter={yAxisConfig.tickFormatter}
            domain={yAxisConfig.domain}
            allowDecimals={false}
            padding={{ top: 20 }}
          />
          <Tooltip 
            formatter={(value) => {
              const unit = selectedIndicator === 'traffic_death_rate' ? '' : '%';
              return [`${value}${unit}`, indicatorName];
            }}
            labelFormatter={(year) => `Year: ${formatYear(year)}`}
          />
          <Legend wrapperStyle={{ paddingTop: 10 }} />
          <Line 
            type="monotone" 
            dataKey="value" 
            name={indicatorName} 
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