import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Map } from 'lucide-react';
import useSDHEData from '../hooks/useSDHEData';
import BangkokMap from '../components/Dashboard/BangkokMap';
import { LoadingScreen } from '../components/Loading/LoadingSpinner';
import { DOMAINS, POPULATION_GROUPS } from '../constants/dashboardConstants';
import { getDataState } from '../utils/dashboardUtils';

const GeographicPage = () => {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState('economic_security');
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  
  const { 
    isLoading, 
    error, 
    data,
    getIndicatorData 
  } = useSDHEData();

  const dataState = React.useMemo(() => 
    getDataState(isLoading, error, data), 
    [isLoading, error, data]
  );

  const handleBack = () => {
    navigate('/');
  };

  const handleDistrictClick = (districtName) => {
    navigate(`/analysis?domain=${selectedDomain}&district=${encodeURIComponent(districtName)}&group=${selectedGroup}`);
  };

  // Loading state
  if (dataState.isLoading) {
    return <LoadingScreen message="Loading geographic data..." />;
  }

  // Error state
  if (dataState.hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <Map className="w-6 h-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Geographic View
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Map Filters</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Domain Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Health Domain
              </label>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DOMAINS.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Population Group Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Population Group
              </label>
              <select
                value={selectedGroup}
                onChange={(e) => setSelectedGroup(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {POPULATION_GROUPS.map(g => (
                  <option key={g.value} value={g.value}>
                    {g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <BangkokMap
            domain={selectedDomain}
            indicator={selectedIndicator}
            populationGroup={selectedGroup}
            getIndicatorData={getIndicatorData}
            onDistrictClick={handleDistrictClick}
          />
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">How to use the map:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Hover over districts to see health indicator values</li>
            <li>• Click on a district to view detailed analysis for that area</li>
            <li>• Use the filters above to change the health domain and population group</li>
            <li>• Colors indicate performance levels (green = better outcomes, red = areas needing attention)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default GeographicPage;