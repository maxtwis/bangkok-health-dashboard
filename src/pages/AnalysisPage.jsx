import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Filter, BarChart3 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import useSDHEData from '../hooks/useSDHEData';
import PopulationGroupSpiderChart from '../components/Dashboard/PopulationGroupSpiderChart';
import IndicatorAnalysis from '../components/Dashboard/IndicatorAnalysis';
import { LoadingScreen } from '../components/Loading/LoadingSpinner';
import { DOMAINS, POPULATION_GROUPS } from '../constants/dashboardConstants';
import { getDataState } from '../utils/dashboardUtils';

const AnalysisPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t } = useLanguage();
  
  // Get URL parameters
  const domain = searchParams.get('domain') || 'economic_security';
  const district = searchParams.get('district') || 'Bangkok Overall';
  const group = searchParams.get('group') || 'all';
  
  const [activeTab, setActiveTab] = useState('indicators');
  
  const { 
    isLoading, 
    error, 
    data, 
    getAvailableDistricts, 
    getIndicatorData 
  } = useSDHEData();

  const dataState = useMemo(() => 
    getDataState(isLoading, error, data), 
    [isLoading, error, data]
  );

  // Update URL when filters change
  const updateFilters = (newFilters) => {
    const newParams = new URLSearchParams(searchParams);
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        newParams.set(key, value);
      } else {
        newParams.delete(key);
      }
    });
    setSearchParams(newParams);
  };

  const handleDomainChange = (newDomain) => {
    updateFilters({ domain: newDomain });
  };

  const handleDistrictChange = (newDistrict) => {
    updateFilters({ district: newDistrict });
  };

  const handleGroupChange = (newGroup) => {
    updateFilters({ group: newGroup });
  };

  const handleIndicatorClick = (indicatorName) => {
    navigate(`/detail/${indicatorName}?domain=${domain}&district=${district}&group=${group}`);
  };

  const handleBack = () => {
    navigate('/');
  };

  // Loading state
  if (dataState.isLoading) {
    return <LoadingScreen message={t('ui.loading')} />;
  }

  // Error state
  if (dataState.hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('ui.error')}</h3>
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
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {t(`domains.${domain}`) || DOMAINS.find(d => d.id === domain)?.name || 'Analysis'}
                </h1>
                <p className="text-sm text-gray-500">
                  {district} • {POPULATION_GROUPS.find(g => g.value === group)?.label || 'All Population'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Domain Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Health Domain
              </label>
              <select
                value={domain}
                onChange={(e) => handleDomainChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {DOMAINS.map(d => (
                  <option key={d.id} value={d.id}>
                    {t(`domains.${d.id}`) || d.name}
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
                value={district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {getAvailableDistricts().map(d => (
                  <option key={d} value={d}>
                    {d}
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
                value={group}
                onChange={(e) => handleGroupChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {POPULATION_GROUPS.map(g => (
                  <option key={g.value} value={g.value}>
                    {t(g.label) || g.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab('indicators')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'indicators'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Indicators
            </div>
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'comparison'
                ? 'bg-blue-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Population Comparison
          </button>
        </div>

        {/* Content */}
        {activeTab === 'indicators' && (
          <div className="bg-white rounded-lg shadow-sm">
            <IndicatorAnalysis 
              onIndicatorClick={handleIndicatorClick}
            />
          </div>
        )}

        {activeTab === 'comparison' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Population Group Comparison
            </h3>
            <PopulationGroupSpiderChart
              domain={domain}
              district={district}
              populationGroup={group}
              getIndicatorData={getIndicatorData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisPage;