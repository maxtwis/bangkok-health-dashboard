import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../contexts/LanguageContext';
import useSDHEData from '../../hooks/useSDHEData';
import useIndicators from '../../hooks/useIndicators';
import PopulationGroupSpiderChart from './PopulationGroupSpiderChart';
import IndicatorAnalysis from './IndicatorAnalysis';
import IndicatorDetail from './IndicatorDetail';
import BangkokMap from './BangkokMap';
import { LoadingScreen, LoadingCard } from '../Loading/LoadingSpinner';
import { 
  REVERSE_INDICATORS, 
  HEALTHCARE_SUPPLY_BENCHMARKS,
  POPULATION_GROUPS,
  DOMAINS,
  VIEW_TABS 
} from '../../constants/dashboardConstants';
import { 
  getPerformanceColor,
  getHealthcareSupplyColor,
  calculateDomainScore,
  formatNumber,
  getTopIndicators,
  getDataState
} from '../../utils/dashboardUtils';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const { 
    isLoading, 
    error, 
    data, 
    surveyData, 
    healthFacilitiesData, 
    getAvailableDistricts, 
    getAvailableDomains, 
    getIndicatorData 
  } = useSDHEData();
  const { getIndicatorName, loading: indicatorDetailsLoading } = useIndicators();
  
  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedPopulationGroup, setSelectedPopulationGroup] = useState('informal_workers');
  const [selectedDistrict, setSelectedDistrict] = useState('Bangkok Overall');
  const [selectedDomain, setSelectedDomain] = useState('economic_security');
  const [viewMode, setViewMode] = useState('overview');
  
  // States for indicator detail page
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  // Handle URL-based routing
  useEffect(() => {
    const pathname = location.pathname;
    const searchParams = new URLSearchParams(location.search);
    
    if (pathname === '/detail') {
      setShowDetailPage(true);
      setViewMode('indicators');
      const indicator = searchParams.get('indicator');
      if (indicator) {
        setSelectedIndicator(indicator);
      }
    } else if (pathname === '/analysis') {
      setShowDetailPage(false);
      setActiveTab('analysis');
      setViewMode('indicators');
    } else if (pathname === '/main' || pathname === '/') {
      setShowDetailPage(false);
      setActiveTab('analysis');
      setViewMode('overview');
    }
    
    // Update state from URL parameters
    const domain = searchParams.get('domain');
    const district = searchParams.get('district');
    const group = searchParams.get('group');
    
    if (domain) setSelectedDomain(domain);
    if (district) setSelectedDistrict(district);
    if (group) setSelectedPopulationGroup(group);
  }, [location]);

  // Data state helpers
  const dataState = useMemo(() => 
    getDataState(isLoading, error, data), 
    [isLoading, error, data]
  );

  // Memoized handlers to prevent unnecessary re-renders
  const handleIndicatorClick = useCallback((indicatorName) => {
    const params = new URLSearchParams();
    params.set('indicator', indicatorName);
    params.set('domain', selectedDomain);
    params.set('district', selectedDistrict);
    params.set('group', selectedPopulationGroup);
    navigate(`/detail?${params.toString()}`);
  }, [navigate, selectedDomain, selectedDistrict, selectedPopulationGroup]);

  const handleBackFromDetail = useCallback(() => {
    const params = new URLSearchParams();
    params.set('domain', selectedDomain);
    params.set('district', selectedDistrict);
    params.set('group', selectedPopulationGroup);
    navigate(`/analysis?${params.toString()}`);
  }, [navigate, selectedDomain, selectedDistrict, selectedPopulationGroup]);

  const handleTabChange = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const handlePopulationGroupChange = useCallback((group) => {
    setSelectedPopulationGroup(group);
    const params = new URLSearchParams(location.search);
    params.set('group', group);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [navigate, location]);

  const handleDistrictChange = useCallback((district) => {
    setSelectedDistrict(district);
    const params = new URLSearchParams(location.search);
    params.set('district', district);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [navigate, location]);

  const handleDomainChange = useCallback((domain) => {
    setSelectedDomain(domain);
    const params = new URLSearchParams(location.search);
    params.set('domain', domain);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [navigate, location]);

  const handleMapDistrictClick = useCallback((districtName) => {
    setSelectedDistrict(districtName);
  }, []);

  // Utility functions
  const formatSampleSize = useCallback((sampleSize) => {
    return formatNumber(sampleSize, 0);
  }, []);


  // Utility function for formatting values
  const formatValue = useCallback((value, indicator) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }

    // Format healthcare supply indicators with proper units
    const healthcareSupplyIndicators = [
      'doctor_per_population', 
      'nurse_per_population', 
      'healthworker_per_population', 
      'community_healthworker_per_population',
      'health_service_access',
      'bed_per_population'
    ];

    if (healthcareSupplyIndicators.indexOf(indicator) >= 0) {
      const valueNum = Number(value);
      
      // Define units for each healthcare supply indicator
      const unitMap = {
        'doctor_per_population': `${valueNum.toFixed(1)} per 1,000`,
        'nurse_per_population': `${valueNum.toFixed(1)} per 1,000`, 
        'healthworker_per_population': `${valueNum.toFixed(1)} per 10,000`,
        'community_healthworker_per_population': `${valueNum.toFixed(1)} per 1,000`,
        'health_service_access': `${valueNum.toFixed(1)} per 10,000`,
        'bed_per_population': `${valueNum.toFixed(1)} per 10,000`
      };

      return unitMap[indicator] || `${valueNum.toFixed(1)}%`;
    }

    // Regular percentage formatting for other indicators
    return `${Number(value).toFixed(1)}%`;
  }, []);

  const getScoreColor = (value, indicator) => {
    // Handle healthcare supply indicators with WHO benchmarks
    const healthcareSupplyIndicators = [
      'doctor_per_population', 
      'nurse_per_population', 
      'healthworker_per_population', 
      'community_healthworker_per_population',
      'health_service_access',
      'bed_per_population'
    ];
    
    if (healthcareSupplyIndicators.includes(indicator)) {
      return getHealthcareSupplyColor(value, indicator);
    }
    
    // Original logic for other indicators
    const isReverse = REVERSE_INDICATORS[indicator];
    
    if (isReverse) {
      if (value <= 20) return 'bg-green-100 text-green-800';
      if (value <= 40) return 'bg-yellow-100 text-yellow-800';
      if (value <= 60) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    } else {
      if (value >= 80) return 'bg-green-100 text-green-800';
      if (value >= 60) return 'bg-yellow-100 text-yellow-800';
      if (value >= 40) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    }
  };

  const getPerformanceBarColor = (value, indicator) => {
    const isReverse = REVERSE_INDICATORS[indicator];
    
    if (isReverse) {
      if (value <= 20) return 'bg-green-500';
      if (value <= 40) return 'bg-yellow-500';
      if (value <= 60) return 'bg-orange-500';
      return 'bg-red-500';
    } else {
      if (value >= 80) return 'bg-green-500';
      if (value >= 60) return 'bg-yellow-500';
      if (value >= 40) return 'bg-orange-500';
      return 'bg-red-500';
    }
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
          <div className="mb-4">
            <div className="mx-auto flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Error icon">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('ui.error')}</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={retry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {t('ui.retry')}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show indicator detail page
  if (showDetailPage) {
    return (
      <IndicatorDetail
        indicator={selectedIndicator}
        domain={selectedDomain}
        district={selectedDistrict}
        populationGroup={selectedPopulationGroup}
        onBack={handleBackFromDetail}
        getIndicatorData={getIndicatorData}
        surveyData={surveyData}
        healthFacilitiesData={healthFacilitiesData}
      />
    );
  }

  const availableDistricts = getAvailableDistricts();
  const availableDomains = getAvailableDomains();
  const currentIndicatorData = getIndicatorData(selectedDomain, selectedDistrict, selectedPopulationGroup);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Skip to main content for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      {/* Header with better spacing and visual hierarchy */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center py-8">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">{t('appTitle')}</h1>
              <p className="text-lg text-gray-600 font-medium">{t('appSubtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="px-6 py-3 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg shadow-md transition-all duration-200 transform hover:scale-105"
              >
                {language === 'en' ? 'ไทย' : 'EN'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with increased max width for less empty space */}
      <main id="main-content" className="max-w-[1600px] mx-auto px-4 lg:px-6 py-10">
        
        {/* Navigation Tabs with better styling */}
        <div className="mb-10">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-12">
              <button
                onClick={() => {
                  setActiveTab('analysis');
                  navigate('/main');
                }}
                className={`py-4 px-2 border-b-3 font-semibold text-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'analysis'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('sdheAnalysis')}
              </button>
              <button
                onClick={() => setActiveTab('hot-issues')}
                className={`py-4 px-2 border-b-3 font-semibold text-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'hot-issues'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('hotIssues')}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'analysis' && (
          <>
            {/* Control Panel with better spacing and visual design */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-10 border border-gray-100">
              <h3 className="text-xl font-semibold text-gray-800 mb-6">Dashboard Controls</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {/* Population Group */}
                <div className="space-y-3">
                  <label htmlFor="population-group-select" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('ui.populationGroup')}
                  </label>
                  <select
                    id="population-group-select"
                    value={selectedPopulationGroup}
                    onChange={(e) => setSelectedPopulationGroup(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-base focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    aria-describedby="population-group-description"
                  >
                    <option value="informal_workers">{t('populationGroups.informal_workers')}</option>
                    <option value="elderly">{t('populationGroups.elderly')}</option>
                    <option value="disabled">{t('populationGroups.disabled')}</option>
                    <option value="lgbtq">{t('populationGroups.lgbtq')}</option>
                    <option value="normal_population">{t('populationGroups.normal_population')}</option>
                  </select>
                </div>

                {/* District */}
                <div className="space-y-3">
                  <label htmlFor="district-select" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('ui.district')}
                  </label>
                  <select
                    id="district-select"
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-base focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    aria-describedby="district-description"
                  >
                    {availableDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                {/* Domain */}
                <div className="space-y-3">
                  <label htmlFor="domain-select" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('ui.indicator')} Domain
                  </label>
                  <select
                    id="domain-select"
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-base focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    aria-describedby="domain-description"
                  >
                    {availableDomains.map(domain => (
                      <option key={domain} value={domain}>
                        {t(`domains.${domain}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode */}
                <div className="space-y-3">
                  <label htmlFor="view-mode-select" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    View Mode
                  </label>
                  <select
                    id="view-mode-select"
                    value={viewMode}
                    onChange={(e) => {
                      setViewMode(e.target.value);
                      if (e.target.value === 'overview') {
                        navigate('/main');
                      } else if (e.target.value === 'indicators') {
                        navigate('/analysis');
                      }
                    }}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-base focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    aria-describedby="view-mode-description"
                  >
                    <option value="overview">Overview</option>
                    <option value="indicators">Indicators</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Overview Mode - UPDATED LAYOUT */}
            {viewMode === 'overview' && (
              <div className="space-y-6">
                {/* Spider Chart and Map - Side by side with wider containers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Spider Chart - Left side, with title and checkboxes INSIDE */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    {/* TITLE MOVED TO TOP INSIDE SPIDER CHART BOX */}
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {t('ui.spiderChartTitle')}
                      </h3>
                      <p className="text-sm text-gray-600 leading-relaxed">
                        {t('ui.spiderChartDescription')} {
                          selectedDistrict === 'Bangkok Overall' && language === 'th'
                            ? t('ui.bangkokOverall') 
                            : selectedDistrict
                        }
                      </p>
                    </div>

                    {/* POPULATION GROUP CHECKBOXES - MOVED ABOVE SPIDER CHART */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Checkboxes in single row - more compact */}
                        {[
                          { value: 'informal_workers', color: '#ef4444' },
                          { value: 'elderly', color: '#3b82f6' },
                          { value: 'disabled', color: '#10b981' },
                          { value: 'lgbtq', color: '#f59e0b' },
                          { value: 'normal_population', color: '#8b5cf6' }
                        ].map(group => (
                          <label key={group.value} className="flex items-center space-x-1.5 cursor-pointer hover:bg-white rounded px-2 py-1 transition-colors flex-shrink-0">
                            <input
                              id={`population-group-${group.value}`}
                              type="checkbox"
                              defaultChecked={true}
                              className="w-3.5 h-3.5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-1"
                              style={{ 
                                accentColor: group.color,
                                backgroundColor: group.color 
                              }}
                              aria-describedby={`population-group-${group.value}-description`}
                              onChange={(e) => {
                                // This will be handled by the spider chart component
                                const event = new CustomEvent('populationGroupToggle', {
                                  detail: { group: group.value, checked: e.target.checked }
                                });
                                window.dispatchEvent(event);
                              }}
                            />
                            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">
                              {t(`populationGroups.${group.value}`)}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Spider Chart Component - Now with hideCheckboxes=true since we handle them above */}
                    <PopulationGroupSpiderChart 
                      selectedDomain={selectedDomain}
                      selectedDistrict={selectedDistrict}
                      getIndicatorData={getIndicatorData}
                      hideCheckboxes={true}
                    />
                  </div>

                  {/* Map - Right side, full height */}
                  <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100" style={{ height: '700px' }}>
                    <div className="h-full">
                      <BangkokMap
                        selectedDomain={selectedDomain}
                        selectedPopulationGroup={selectedPopulationGroup}
                        selectedDistrict={selectedDistrict}
                        onDistrictClick={handleMapDistrictClick}
                        getIndicatorData={getIndicatorData}
                      />
                    </div>
                  </div>
                </div>

                {/* Domain Performance Rankings - Full width bottom */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="text-base font-semibold text-gray-800 mb-4">Domain Performance Rankings</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {[
                      { value: 'informal_workers', color: '#ef4444' },
                      { value: 'elderly', color: '#3b82f6' },
                      { value: 'disabled', color: '#10b981' },
                      { value: 'lgbtq', color: '#f59e0b' },
                      { value: 'normal_population', color: '#8b5cf6' }
                    ].map(group => {
                      // Calculate scores for this group across all domains
                      const domains = [
                        'economic_security', 'education', 'healthcare_access',
                        'physical_environment', 'social_context', 'health_behaviors'
                      ];
                      
                      const groupScores = domains.map(domain => {
                        try {
                          const indicatorData = getIndicatorData(domain, selectedDistrict, group.value);
                          const domainScore = indicatorData.find(item => 
                            item.isDomainScore || 
                            item.indicator === '_domain_score' || 
                            item.label?.toLowerCase().includes('score')
                          );
                          return {
                            domain: t(`domains.${domain}`),
                            score: domainScore?.value || 0
                          };
                        } catch {
                          return {
                            domain: t(`domains.${domain}`),
                            score: 0
                          };
                        }
                      }).sort((a, b) => b.score - a.score);

                      return (
                        <div key={group.value} className="bg-white rounded-md p-3 shadow-sm border border-gray-100">
                          <div className="flex items-center mb-2">
                            <div 
                              className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                              style={{ backgroundColor: group.color }}
                            ></div>
                            <h5 className="font-medium text-gray-800 text-sm">
                              {t(`populationGroups.${group.value}`)}
                            </h5>
                          </div>
                          <div className="space-y-1">
                            {groupScores.map((item, index) => (
                              <div key={item.domain} className="flex items-center text-xs">
                                <span className={`font-medium ${
                                  index < 2 ? 'text-green-700' : index >= 4 ? 'text-red-600' : 'text-gray-700'
                                }`} title={item.domain}>
                                  {index + 1}. {item.domain}
                                </span>
                                <span className="font-semibold text-gray-900 ml-3">{item.score.toFixed(0)}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Indicators Mode with better spacing */}
            {viewMode === 'indicators' && (
              <div className="space-y-10">
                {/* Indicators Table */}
                <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {t(`domains.${selectedDomain}`)} - {t(`populationGroups.${selectedPopulationGroup}`)} 
                      {selectedDistrict !== 'Bangkok Overall' && ` - ${selectedDistrict}`}
                    </h3>
                    <p className="text-gray-600">Detailed indicator breakdown for the selected parameters</p>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {currentIndicatorData && currentIndicatorData.length > 0 ? (
                      <div className="p-8">
                        <table className="w-full text-base">
                          <thead>
                            <tr className="border-b-2 border-gray-200">
                              <th className="text-left py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                                {t('ui.indicator')}
                              </th>
                              <th className="text-center py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                                {t('ui.score')}
                              </th>
                              <th className="text-center py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                                {t('ui.sampleSize')}
                              </th>
                              <th className="text-center py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                                {t('ui.performance')}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentIndicatorData
                              .filter(item => !item.isDomainScore)
                              .map((item, index) => {
                                const indicator = item.indicator;
                                const value = item.value;
                                
                                return (
                                  <tr 
                                    key={indicator} 
                                    className="border-b border-gray-100 hover:bg-blue-50/50 cursor-pointer transition-colors duration-200"
                                    onClick={() => handleIndicatorClick(indicator)}
                                  >
                                    {/* Indicator Name Column */}
                                    <td className="py-4 px-6">
                                      <div className="flex items-center">
                                        <span className="font-medium text-gray-900 hover:text-blue-600 transition-colors duration-200">
                                          {getIndicatorName(indicator, language) || item.label}
                                        </span>
                                        <svg className="w-5 h-5 ml-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="View details arrow">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </div>
                                    </td>

                                    {/* Score Column */}
                                    <td className="text-center py-4 px-6">
                                      {item.noData || value === null || value === undefined ? (
                                        <span className="inline-flex px-3 py-2 text-sm font-medium bg-gray-100 text-gray-600 rounded-full">
                                          N/A
                                        </span>
                                      ) : (
                                        <span className={`inline-flex px-3 py-2 text-sm font-medium rounded-full ${getScoreColor(value, indicator)}`}>
                                          {formatValue(value, indicator)}
                                        </span>
                                      )}
                                    </td>

                                    {/* Sample Size Column */}
                                    <td className="text-center py-4 px-6 text-gray-600">
                                      {(() => {
                                        if (item.noData) {
                                          return language === 'th' ? 'ไม่มีข้อมูล' : 'No data';
                                        }
                                        
                                        return formatSampleSize(item.sample_size);
                                      })()}
                                    </td>

                                    {/* Performance Bar Column */}
                                    <td className="text-center py-4 px-6">
                                      {item.noData || value === null || value === undefined ? (
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                          <div className="h-3 rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                                        </div>
                                      ) : (
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                          <div 
                                            className={`h-3 rounded-full ${getPerformanceBarColor(value, indicator)} transition-all duration-500`}
                                            style={{ width: `${Math.min(100, Math.max(0, parseFloat(value) || 0))}%` }}
                                          ></div>
                                        </div>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-16 text-gray-500">
                        <div className="mb-4">
                          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="No data available icon">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="text-lg font-medium">{t('ui.noData')}</p>
                        <p className="text-base mt-2">{t('ui.tryDifferent')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Full-width Map for indicators view */}
            {viewMode === 'indicators' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100" style={{ height: '600px' }}>
                <div className="h-full">
                  <BangkokMap
                    selectedDomain={selectedDomain}
                    selectedPopulationGroup={selectedPopulationGroup}
                    selectedDistrict={selectedDistrict}
                    onDistrictClick={handleMapDistrictClick}
                    getIndicatorData={getIndicatorData}
                  />
                </div>
              </div>
            )}

            {/* Footer Info with better design */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 mt-10 border border-blue-100">
              <h4 className="text-xl font-semibold text-gray-800 mb-4">{t('ui.aboutSDHE')}</h4>
              <p className="text-base text-gray-700 mb-6 leading-relaxed">
                {t('ui.aboutDescription')}
              </p>
              
              {/* Special note for Health Outcomes */}
              {selectedDomain === 'health_outcomes' && (
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-lg p-6 mb-6">
                  <p className="text-base text-orange-800 leading-relaxed">
                    <strong className="text-orange-900">{t('ui.healthOutcomesNote')}</strong> {t('ui.healthOutcomesDescription')}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded-full"></div>
                  <span className="font-medium">{t('ui.excellent')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded-full"></div>
                  <span className="font-medium">{t('ui.good')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-orange-100 border-2 border-orange-300 rounded-full"></div>
                  <span className="font-medium">{t('ui.fair')}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded-full"></div>
                  <span className="font-medium">{t('ui.poor')}</span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 leading-relaxed">
                {t('ui.colorNote')}
              </p>
            </div>
          </>
        )}

        {/* Hot Issues Tab with better spacing */}
        {activeTab === 'hot-issues' && (
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Hot Issues Analysis</h3>
              <p className="text-gray-600">Analyze critical health indicators across different districts and population groups</p>
            </div>
            <IndicatorAnalysis />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;