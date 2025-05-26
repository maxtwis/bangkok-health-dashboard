import React from 'react';
import OverallTrendChart from '../Charts/OverallTrendChart';
import SexComparisonChart from '../Charts/SexComparisonChart';
import NoSexDataMessage from '../NoSexDataMessage';
import { formatYear } from '../DataUtils';

const ChartsTab = ({ 
  filteredData, 
  sexComparisonData, 
  selectedIndicator, 
  indicatorName,
  selectedGeographyType, 
  selectedArea, 
  years,
  hasSexData = true
}) => {
  // Get the year range for display
  const getYearRangeDisplay = () => {
    if (!years || years.length === 0) return '';
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);
    return minYear === maxYear ? 
      `${formatYear(minYear)}` : 
      `${formatYear(minYear)} - ${formatYear(maxYear)}`;
  };

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {indicatorName} - 
        {selectedGeographyType === 'bangkok' ? ' Bangkok' : ` ${selectedArea}`} 
        {years.length > 0 && (
          <span className="text-base font-normal text-gray-600">
            {' '}({getYearRangeDisplay()})
          </span>
        )}
      </h2>
      
      {years.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <p className="text-yellow-800">No data available for {indicatorName} in the selected area.</p>
        </div>
      ) : (
        <>
          {/* Overall Trend Chart */}
          <div className="mb-8">
            <h3 className="text-lg font-medium mb-2">Overall Trend</h3>
            <OverallTrendChart 
              data={filteredData} 
              indicatorName={indicatorName} 
              selectedIndicator={selectedIndicator}
            />
          </div>
          
          {/* Sex Comparison Chart or Message */}
          <div>
            <h3 className="text-lg font-medium mb-2">Comparison by Sex</h3>
            {hasSexData ? (
              <SexComparisonChart 
                data={sexComparisonData} 
                indicatorName={indicatorName} 
                selectedIndicator={selectedIndicator}
              />
            ) : (
              <NoSexDataMessage indicatorName={indicatorName} />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChartsTab;