import React from 'react';

const FilterPanel = ({
  selectedIndicator,
  setSelectedIndicator,
  selectedGeographyType,
  setSelectedGeographyType,
  selectedArea,
  setSelectedArea,
  districts
}) => {
  return (
    <div className="w-full md:w-64 bg-white p-4 rounded shadow-md">
      <h2 className="text-lg font-semibold border-b pb-2 mb-4">Filter Options</h2>
      
      {/* Indicator Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select indicator:
        </label>
        <select 
          className="w-full rounded border border-gray-300 p-2"
          value={selectedIndicator}
          onChange={(e) => setSelectedIndicator(e.target.value)}
        >
          <option value="drink_rate">Alcohol Drinking Rate</option>
          <option value="smoke_rate">Smoking Rate</option>
          <option value="traffic_death_rate">Traffic Death Rate</option>
        </select>
      </div>
      
      {/* Geography Type Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select geography type:
        </label>
        <select 
          className="w-full rounded border border-gray-300 p-2"
          value={selectedGeographyType}
          onChange={(e) => setSelectedGeographyType(e.target.value)}
        >
          <option value="bangkok">Bangkok Level</option>
          <option value="district">District Level</option>
        </select>
      </div>
      
      {/* Area Selection (only show if district level selected) */}
      {selectedGeographyType === 'district' && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select area:
          </label>
          <select 
            className="w-full rounded border border-gray-300 p-2"
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            {districts.map(district => (
              <option key={district} value={district}>{district}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default FilterPanel;