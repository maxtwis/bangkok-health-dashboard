// src/components/Dashboard/Tabs/SummaryTab.jsx
import React from 'react';
import { formatYear } from '../DataUtils';

const SummaryTab = ({ 
  summaryData, 
  selectedGeographyType, 
  selectedArea 
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Summary - 
        {selectedGeographyType === 'bangkok' ? ' Bangkok' : ` ${selectedArea}`}
      </h2>
      
      {summaryData ? (
        <div className="bg-gray-50 p-4 rounded border">
          <h3 className="text-lg font-medium mb-4">
            Change between {formatYear(summaryData.baselineYear)} and {formatYear(summaryData.latestYear)}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Baseline ({formatYear(summaryData.baselineYear)})</p>
              <p className="text-2xl font-bold">{summaryData.baselineValue.toFixed(2)}%</p>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Latest ({formatYear(summaryData.latestYear)})</p>
              <p className="text-2xl font-bold">{summaryData.latestValue.toFixed(2)}%</p>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Absolute Change</p>
              <p className={`text-2xl font-bold ${summaryData.change < 0 ? 'text-green-600' : summaryData.change > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {summaryData.change > 0 ? '+' : ''}{summaryData.change.toFixed(2)}%
              </p>
            </div>
            
            <div className="bg-white p-4 rounded shadow">
              <p className="text-sm text-gray-500">Relative Change</p>
              <p className={`text-2xl font-bold ${summaryData.percentChange < 0 ? 'text-green-600' : summaryData.percentChange > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {summaryData.percentChange > 0 ? '+' : ''}{summaryData.percentChange}%
              </p>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-white rounded shadow">
            <h4 className="font-medium mb-2">Interpretation</h4>
            <p>
              The alcohol drinking rate in {summaryData.area} has 
              {summaryData.change === 0 
                ? ' remained stable' 
                : summaryData.change > 0 
                  ? ` increased by ${summaryData.change.toFixed(2)} percentage points (${summaryData.percentChange}%)` 
                  : ` decreased by ${Math.abs(summaryData.change).toFixed(2)} percentage points (${Math.abs(summaryData.percentChange)}%)`
              } 
              between {formatYear(summaryData.baselineYear)} and {formatYear(summaryData.latestYear)}.
              {summaryData.change > 0 
                ? ' This represents a negative trend in public health outcomes.'
                : summaryData.change < 0
                  ? ' This represents a positive trend in public health outcomes.'
                  : ''
              }
            </p>
          </div>
        </div>
      ) : (
        <p>Insufficient data to generate summary.</p>
      )}
    </div>
  );
};

export default SummaryTab;