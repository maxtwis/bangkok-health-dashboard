import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, UserCheck, UserX, Baby, Plane } from 'lucide-react';
import useSDHEData from '../hooks/useSDHEData';
import PopulationGroupSpiderChart from '../components/Dashboard/PopulationGroupSpiderChart';
import { LoadingScreen } from '../components/Loading/LoadingSpinner';
import { DOMAINS, POPULATION_GROUPS } from '../constants/dashboardConstants';
import { getDataState } from '../utils/dashboardUtils';

const ComparisonPage = () => {
  const navigate = useNavigate();
  const [selectedDomain, setSelectedDomain] = useState('economic_security');
  const [selectedDistrict, setSelectedDistrict] = useState('Bangkok Overall');
  
  const { 
    isLoading, 
    error, 
    data,
    getAvailableDistricts,
    getIndicatorData 
  } = useSDHEData();

  const dataState = React.useMemo(() => 
    getDataState(isLoading, error, data), 
    [isLoading, error, data]
  );

  const handleBack = () => {
    navigate('/');
  };

  // Get icon for population group
  const getPopulationGroupIcon = (groupValue) => {
    const iconProps = { className: "w-5 h-5" };
    switch (groupValue) {
      case 'all':
        return <Users {...iconProps} />;
      case 'informal_workers':
        return <UserCheck {...iconProps} />;
      case 'elderly':
        return <Users {...iconProps} />;
      case 'unemployed':
        return <UserX {...iconProps} />;
      case 'youth':
        return <Baby {...iconProps} />;
      case 'migrants':
        return <Plane {...iconProps} />;
      default:
        return <Users {...iconProps} />;
    }
  };

  // Loading state
  if (dataState.isLoading) {
    return <LoadingScreen message="Loading comparison data..." />;
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
              <Users className="w-6 h-6 text-green-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Population Group Comparison
              </h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Comparison Settings</h2>
          
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

            {/* District Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                District
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getAvailableDistricts().map(d => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Population Group Performance Comparison
            </h3>
            <div className="text-sm text-gray-500">
              {DOMAINS.find(d => d.id === selectedDomain)?.name} • {selectedDistrict}
            </div>
          </div>

          <PopulationGroupSpiderChart
            domain={selectedDomain}
            district={selectedDistrict}
            populationGroup="all"
            getIndicatorData={getIndicatorData}
          />
        </div>

        {/* Population Group Overview */}
        <div className="mt-6 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Population Groups
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {POPULATION_GROUPS.map(group => (
              <button
                key={group.value}
                onClick={() => navigate(`/analysis?domain=${selectedDomain}&district=${selectedDistrict}&group=${group.value}`)}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    {getPopulationGroupIcon(group.value)}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{group.label}</h4>
                    <p className="text-sm text-gray-500">Click to view detailed analysis</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-purple-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-purple-900 mb-2">Understanding the comparison:</h3>
          <ul className="text-sm text-purple-800 space-y-1">
            <li>• The radar chart shows performance across all indicators in the selected domain</li>
            <li>• Each colored line represents a different population group</li>
            <li>• Larger areas indicate better overall health outcomes for that group</li>
            <li>• Click on any population group card to view detailed analysis</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ComparisonPage;