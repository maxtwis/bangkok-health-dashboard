import React, { useState, useEffect } from 'react';
import DistrictMap from '../Maps/DistrictMap';
import { formatYear } from '../DataUtils';

const MapTab = ({
  rateData,
  districtGeoJson,
  selectedIndicator,
  indicatorName,
  selectedGeographyType,
  selectedArea,
  years,
  selectedYear,
  setSelectedYear
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default selected year to the most recent year when years change
  useEffect(() => {
    if (years && years.length > 0 && (!selectedYear || !years.includes(selectedYear))) {
      const mostRecentYear = Math.max(...years);
      console.log('Setting initial year to most recent:', mostRecentYear);
      setSelectedYear(mostRecentYear);
    }
  }, [years, selectedYear, setSelectedYear]);

  // Check for required data
  useEffect(() => {
    if (districtGeoJson) {
      console.log("GeoJSON data available with", districtGeoJson.features.length, "features");
      setIsLoading(false);
    } else {
      console.warn("GeoJSON data not available");
      setError("GeoJSON data not available. Please ensure district.geojson is in the public folder.");
      setIsLoading(false);
    }
  }, [districtGeoJson]);

  // Log every time component renders with current props
  useEffect(() => {
    console.log("MapTab render with props:", {
      hasData: rateData?.length > 0,
      hasGeoJson: !!districtGeoJson,
      selectedYear,
      availableYears: years,
      indicator: selectedIndicator
    });
  });

  const handleYearChange = (e) => {
    const year = parseInt(e.target.value);
    console.log('Year changed to:', year);
    setSelectedYear(year);
  };

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
        {indicatorName} - District Map
        {years.length > 0 && (
          <span className="text-base font-normal text-gray-600 ml-2">
            ({getYearRangeDisplay()})
          </span>
        )}
      </h2>

      {/* Year selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Select Year:
        </label>
        <select
          className="rounded border border-gray-300 p-2 w-full md:w-60"
          value={selectedYear || ''}
          onChange={handleYearChange}
          disabled={years.length === 0}
        >
          {selectedYear === null && years.length > 0 && <option value="">Select Year</option>}
          {years.map(year => (
            <option key={year} value={year}>
              {formatYear(year)} (B.E. {year})
            </option>
          ))}
        </select>
        {years.length === 0 && (
          <p className="text-sm text-gray-500 mt-1">No data available for this indicator</p>
        )}
      </div>

      {/* Map Component */}
      <div className="mb-8">
        {error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : (
          <>
            {selectedYear && years.includes(selectedYear) ? (
              <DistrictMap
                geoJsonData={districtGeoJson}
                rateData={rateData}
                selectedYear={selectedYear}
                selectedIndicator={selectedIndicator}
                indicatorName={indicatorName}
              />
            ) : (
              <div className="h-96 flex justify-center items-center bg-gray-100 rounded-lg">
                <p className="text-center">
                  {years.length === 0 ? 
                    'No data available for this indicator' : 
                    'Please select a year to view the map'
                  }
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Map information */}
      <div className="bg-gray-50 p-4 rounded border">
        <h3 className="text-lg font-medium mb-2">Map Information</h3>
        <p className="mb-3">
          This map visualizes the {indicatorName.toLowerCase()} across Bangkok's districts for the selected year.
          Each district is colored according to the {selectedIndicator === 'traffic_death_rate' ? 'rate per 100,000 population' : 'percentage'}, 
          with darker colors indicating higher rates.
        </p>
        <p className="mb-3">
          <span className="font-medium">Available Data:</span> This indicator has data for {years.length} year{years.length !== 1 ? 's' : ''}: {years.map(y => formatYear(y)).join(', ')}.
        </p>
        <p className="mb-3">
          <span className="font-medium">Interactions:</span>
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Hover over a district to see detailed information</li>
          <li>Click on a district to zoom in</li>
          <li>Use the controls on the top left to zoom in/out</li>
          <li>Drag the map to pan around</li>
        </ul>
        {selectedYear && (
          <p className="mt-3 text-sm text-gray-600">
            Data is based on district-level surveys conducted in Buddhist Era {selectedYear} (C.E. {formatYear(selectedYear)}).
          </p>
        )}
      </div>
    </div>
  );
};

export default MapTab;