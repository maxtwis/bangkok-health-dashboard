import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { formatYear } from '../DataUtils';

const PopulationComparisonChart = ({ data }) => {
  // Define colors for each population group
  const colors = {
    general: "#8884d8",
    elderly: "#82ca9d", 
    disabled: "#ffc658",
    lgbtq: "#ff8042",
    informal: "#a66bbe"
  };

  // Sample data structure (until real data is available)
  const sampleData = data && data.length > 0 ? data : [
    { year: 2566, general: 16.5, elderly: 9.2, disabled: 11.3, lgbtq: 18.7, informal: 21.4 },
    { year: 2567, general: 17.8, elderly: 9.7, disabled: 12.1, lgbtq: 19.2, informal: 22.6 },
    { year: 2568, general: 18.2, elderly: 10.1, disabled: 12.8, lgbtq: 19.5, informal: 23.1 }
  ];

  // Check which population groups are present in the data
  const hasGeneral = sampleData.some(item => 'general' in item && item.general !== null);
  const hasElderly = sampleData.some(item => 'elderly' in item && item.elderly !== null);
  const hasDisabled = sampleData.some(item => 'disabled' in item && item.disabled !== null);
  const hasLgbtq = sampleData.some(item => 'lgbtq' in item && item.lgbtq !== null);
  const hasInformal = sampleData.some(item => 'informal' in item && item.informal !== null);

  return (
    <div className="h-64 md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sampleData} margin={{ top: 10, right: 30, left: 10, bottom: 25 }}>
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
          {hasGeneral && <Bar dataKey="general" name="General Population" fill={colors.general} />}
          {hasElderly && <Bar dataKey="elderly" name="ผู้สูงอายุ (Elderly)" fill={colors.elderly} />}
          {hasDisabled && <Bar dataKey="disabled" name="ผู้พิการ (Disabled)" fill={colors.disabled} />}
          {hasLgbtq && <Bar dataKey="lgbtq" name="LGBTQ+" fill={colors.lgbtq} />}
          {hasInformal && <Bar dataKey="informal" name="แรงงานนอกระบบ (Informal Workers)" fill={colors.informal} />}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PopulationComparisonChart;