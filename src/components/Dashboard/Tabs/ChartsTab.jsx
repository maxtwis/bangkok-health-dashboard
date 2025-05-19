import React from 'react';
import OverallTrendChart from '../Charts/OverallTrendChart';
import SexComparisonChart from '../Charts/SexComparisonChart';

const ChartsTab = ({ 
  filteredData, 
  sexComparisonData, 
  selectedIndicator, 
  indicatorName,
  selectedGeographyType, 
  selectedArea, 
  years 
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {indicatorName} - 
        {selectedGeographyType === 'bangkok' ? ' Bangkok' : ` ${selectedArea}`} 
        ({years[0]} - {years[years.length - 1]})
      </h2>
      
      {/* Overall Trend Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">Overall Trend</h3>
        <OverallTrendChart data={filteredData} indicatorName={indicatorName} />
      </div>
      
      {/* Sex Comparison Chart */}
      <div>
        <h3 className="text-lg font-medium mb-2">Comparison by Sex</h3>
        <SexComparisonChart data={sexComparisonData} indicatorName={indicatorName} />
      </div>
    </div>
  );
};

export default ChartsTab;