import React, { useEffect, useState, useMemo } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatYear } from '../DataUtils';

const SexComparisonChart = ({ data, indicatorName = 'Alcohol Drinking Rate', selectedIndicator }) => {
  const [processedData, setProcessedData] = useState([]);

  // Check if the data includes lgbt category
  const hasLgbt = data.some(item => 'lgbt' in item && item.lgbt !== null && item.lgbt !== undefined);

  // Calculate dynamic Y-axis configuration
  const yAxisConfig = useMemo(() => {
    if (!processedData || processedData.length === 0) {
      return {
        domain: [0, 50],
        label: 'Percentage (%)',
        tickFormatter: (value) => `${value}%`
      };
    }

    // Collect all values from the processed data
    const allValues = [];
    processedData.forEach(item => {
      if (typeof item.male === 'number' && !isNaN(item.male)) allValues.push(item.male);
      if (typeof item.female === 'number' && !isNaN(item.female)) allValues.push(item.female);
      if (hasLgbt && typeof item.lgbt === 'number' && !isNaN(item.lgbt)) allValues.push(item.lgbt);
    });

    if (allValues.length === 0) {
      return {
        domain: [0, 50],
        label: 'Percentage (%)',
        tickFormatter: (value) => `${value}%`
      };
    }

    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    
    // Determine appropriate scale based on indicator type
    let domain, label, tickFormatter;
    
    if (selectedIndicator === 'traffic_death_rate') {
      // Traffic death rate uses different units and scale
      const padding = (max - min) * 0.2 || 1;
      domain = [Math.max(0, Math.floor(min - padding)), Math.ceil(max + padding)];
      label = 'Rate per 100,000 population';
      tickFormatter = (value) => `${value}`;
    } else {
      // Percentage-based indicators
      const padding = (max - min) * 0.2 || 2;
      const minDomain = Math.max(0, Math.floor(min - padding));
      const maxDomain = Math.min(100, Math.ceil(max + padding)); // Cap at 100% for percentages
      domain = [minDomain, maxDomain];
      label = 'Percentage (%)';
      tickFormatter = (value) => `${value}%`;
    }

    return { domain, label, tickFormatter };
  }, [processedData, hasLgbt, selectedIndicator]);

  useEffect(() => {
    // Clean and normalize the data
    const cleanData = () => {
      // First, create a deep copy to avoid modifying the original data
      const cleanedData = data.map(item => {
        const newItem = { ...item };
        
        // Helper function to clean individual values
        const cleanValue = (value) => {
          if (typeof value !== 'number' || isNaN(value)) return 0;
          if (value < 0) return 0;
          // For percentage indicators, cap at 100%, for traffic death rate, allow higher values
          if (selectedIndicator !== 'traffic_death_rate' && value > 100) return 100;
          return value;
        };
        
        // Clean all the values
        newItem.male = cleanValue(newItem.male);
        newItem.female = cleanValue(newItem.female);
        if (hasLgbt) {
          newItem.lgbt = cleanValue(newItem.lgbt);
        }
        
        return newItem;
      });
      
      // Set the processed data
      setProcessedData(cleanedData);
    };
    
    cleanData();
  }, [data, hasLgbt, selectedIndicator]);

  // If we have no data, show a placeholder message
  if (!processedData || processedData.length === 0) {
    return (
      <div className="h-64 md:h-80 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50">
        <div className="text-center p-6">
          <p className="text-gray-500">No data available for sex comparison chart.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={processedData} 
          margin={{ top: 10, right: 30, left: 10, bottom: 25 }}
        >
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
              return [`${typeof value === 'number' ? value.toFixed(2) : '0'}${unit}`, indicatorName];
            }}
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