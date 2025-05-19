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
  years
}) => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set default selected year to the most recent year immediately
  useEffect(() => {
    if (years && years.length > 0 && !selectedYear) {
      const mostRecentYear = years[years.length - 1];
      console.log('Setting initial year to most recent:', mostRecentYear);
      setSelectedYear(mostRecentYear);
    }
  }, [years, selectedYear]);

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

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {indicatorName} - District Map
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
        >
          {selectedYear === null && <option value="">Select Year</option>}
          {years.map(year => (
            <option key={year} value={year}>
              {formatYear(year)} (B.E. {year})
            </option>
          ))}
        </select>
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
            {selectedYear && (
              <DistrictMap
                geoJsonData={districtGeoJson}
                rateData={rateData}
                selectedYear={selectedYear}
                selectedIndicator={selectedIndicator}
                indicatorName={indicatorName}
              />
            )}
            {!selectedYear && (
              <div className="h-96 flex justify-center items-center bg-gray-100 rounded-lg">
                <p>Please select a year to view the map</p>
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
          Each district is colored according to the percentage, with darker colors indicating higher rates.
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