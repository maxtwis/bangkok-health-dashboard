import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatYear } from '../DataUtils';

const SexComparisonChart = ({ data, indicatorName = 'Alcohol Drinking Rate' }) => {
  const [processedData, setProcessedData] = useState([]);
  const [maxValue, setMaxValue] = useState(20); // Default reasonable max for percentage

  // Check if the data includes lgbt category
  const hasLgbt = data.some(item => 'lgbt' in item && item.lgbt !== null && item.lgbt !== undefined);

  useEffect(() => {
    // Clean and normalize the data
    const cleanData = () => {
      // First, create a deep copy to avoid modifying the original data
      const cleanedData = data.map(item => {
        const newItem = { ...item };
        
        // Handle male data
        if (typeof newItem.male === 'number') {
          // Cap extremely high values (likely errors)
          if (newItem.male > 100) {
            newItem.male = Math.min(newItem.male, 100);
          }
          // Handle negative values
          if (newItem.male < 0) {
            newItem.male = 0;
          }
          // Fix any NaN values
          if (isNaN(newItem.male)) {
            newItem.male = 0;
          }
        } else {
          newItem.male = 0;
        }
        
        // Handle female data
        if (typeof newItem.female === 'number') {
          if (newItem.female > 100) {
            newItem.female = Math.min(newItem.female, 100);
          }
          if (newItem.female < 0) {
            newItem.female = 0;
          }
          if (isNaN(newItem.female)) {
            newItem.female = 0;
          }
        } else {
          newItem.female = 0;
        }
        
        // Handle LGBT data if present
        if (hasLgbt) {
          if (typeof newItem.lgbt === 'number') {
            if (newItem.lgbt > 100) {
              newItem.lgbt = Math.min(newItem.lgbt, 100);
            }
            if (newItem.lgbt < 0) {
              newItem.lgbt = 0;
            }
            if (isNaN(newItem.lgbt)) {
              newItem.lgbt = 0;
            }
          } else {
            newItem.lgbt = 0;
          }
        }
        
        return newItem;
      });
      
      // Find the maximum value for better scaling
      let max = 0;
      cleanedData.forEach(item => {
        if (item.male > max) max = item.male;
        if (item.female > max) max = item.female;
        if (hasLgbt && item.lgbt > max) max = item.lgbt;
      });
      
      // Set a reasonable max value with a ceiling of 100 (it's a percentage)
      // Add 10% padding for better visualization
      setMaxValue(Math.min(Math.ceil(max * 1.1), 100));
      
      // Set the processed data
      setProcessedData(cleanedData);
    };
    
    cleanData();
  }, [data, hasLgbt]);

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
              value: 'Percentage (%)', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' },
              dx: -10
            }}
            tickFormatter={(value) => `${value}`}
            domain={[0, maxValue]}
            allowDecimals={false}
            padding={{ top: 20 }}
          />
          <Tooltip 
            formatter={(value) => [`${typeof value === 'number' ? value.toFixed(2) : '0'}%`, indicatorName]}
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