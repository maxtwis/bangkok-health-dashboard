import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import useBasicSDHEData from '../../hooks/useBasicSDHEData';
import useIndicatorDetails from '../../hooks/useIndicatorDetails';
import PopulationGroupSpiderChart from './PopulationGroupSpiderChart';
import IndicatorAnalysis from './IndicatorAnalysis';
import IndicatorDetailPage from './IndicatorDetailPage';
import BangkokMap from './BangkokMap';
import Papa from 'papaparse';

const Dashboard = () => {
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
  } = useBasicSDHEData();
  const { getIndicatorName, loading: indicatorDetailsLoading } = useIndicatorDetails();
  
  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedPopulationGroup, setSelectedPopulationGroup] = useState('informal_workers');
  const [selectedDistrict, setSelectedDistrict] = useState('Bangkok Overall');
  const [selectedDomain, setSelectedDomain] = useState('economic_security');
  const [viewMode, setViewMode] = useState('overview');
  
  // States for indicator detail page
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  // Define which indicators are "reverse" (bad when high)
  const reverseIndicators = {
    // Economic Security - mostly reverse (bad when high)
    unemployment_rate: true,
    vulnerable_employment: true,
    food_insecurity_moderate: true,
    food_insecurity_severe: true,
    work_injury_fatal: true,
    work_injury_non_fatal: true,
    catastrophic_health_spending_household: true,
    health_spending_over_10_percent: true,
    health_spending_over_25_percent: true,
    
    // Healthcare Access - mixed
    medical_consultation_skip_cost: true,
    medical_treatment_skip_cost: true,
    prescribed_medicine_skip_cost: true,
    
    // Physical Environment - mixed
    housing_overcrowding: true,
    disaster_experience: true,
    
    // Social Context - mostly reverse
    violence_physical: true,
    violence_psychological: true,
    violence_sexual: true,
    discrimination_experience: true,
    community_murder: true,
    
    // Health Behaviors - mixed
    alcohol_consumption: true,
    tobacco_use: true,
    obesity: true,

    // Health Outcomes - ALL REVERSE (diseases are bad when high)
    any_chronic_disease: true,
    diabetes: true,
    hypertension: true,
    gout: true,
    chronic_kidney_disease: true,
    cancer: true,
    high_cholesterol: true,
    ischemic_heart_disease: true,
    liver_disease: true,
    stroke: true,
    hiv: true,
    mental_health: true,
    allergies: true,
    bone_joint_disease: true,
    respiratory_disease: true,
    emphysema: true,
    anemia: true,
    stomach_ulcer: true,
    epilepsy: true,
    intestinal_disease: true,
    paralysis: true,
    dementia: true,
    cardiovascular_diseases: true,
    metabolic_diseases: true,
    multiple_chronic_conditions: true
  };

  // WHO Benchmarks for Healthcare Supply Indicators
  const getHealthcareSupplyColor = (value, indicator) => {
    const benchmarks = {
      doctor_per_population: { good: 2.5, fair: 1.0, poor: 0.5 },
      nurse_per_population: { good: 8.0, fair: 3.0, poor: 1.5 },
      healthworker_per_population: { good: 40, fair: 20, poor: 10 },
      community_healthworker_per_population: { good: 5.0, fair: 2.0, poor: 1.0 },
      health_service_access: { good: 50, fair: 20, poor: 10 },
      bed_per_population: { good: 30, fair: 15, poor: 10 }
    };
    
    const benchmark = benchmarks[indicator];
    if (!benchmark) return 'bg-gray-100 text-gray-600';
    
    if (value >= benchmark.good) return 'bg-green-100 text-green-800';
    if (value >= benchmark.fair) return 'bg-yellow-100 text-yellow-800';  
    if (value >= benchmark.poor) return 'bg-orange-100 text-orange-800';
    return 'bg-red-100 text-red-800';
  };

  // Handle map district click
  const handleMapDistrictClick = (districtName) => {
    setSelectedDistrict(districtName);
  };

  // Handle indicator click
  const handleIndicatorClick = (indicator) => {
    setSelectedIndicator(indicator);
    setShowDetailPage(true);
  };

  // Handle back from detail page
  const handleBackFromDetail = () => {
    setShowDetailPage(false);
    setSelectedIndicator(null);
  };

  // Safe function to format sample size
  const formatSampleSize = (sampleSize) => {
    if (sampleSize === null || sampleSize === undefined || isNaN(sampleSize)) {
      return 'N/A';
    }
    return Number(sampleSize).toLocaleString();
  };

  // Safe function to format value - Updated for healthcare supply indicators
  const formatValue = (value, indicator) => {
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
  };

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
    const isReverse = reverseIndicators[indicator];
    
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
    const isReverse = reverseIndicators[indicator];
    
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
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('ui.loading')}</h2>
          <p className="text-gray-500">{t('ui.loadingDescription')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">{t('ui.error')}</h2>
          <p className="text-gray-500 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {t('ui.retry')}
          </button>
        </div>
      </div>
    );
  }

  // Show indicator detail page
  if (showDetailPage) {
    return (
      <IndicatorDetailPage
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
  const uniqueDistricts = [...new Set(availableDistricts)];ts();
  const availableDomains = getAvailableDomains();
  const currentIndicatorData = getIndicatorData(selectedDomain, selectedDistrict, selectedPopulationGroup);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('appTitle')}</h1>
              <p className="text-sm text-gray-600">{t('appSubtitle')}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md font-medium"
              >
                {language === 'en' ? 'ไทย' : 'EN'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Navigation Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === 'analysis'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('sdheAnalysis')}
              </button>
              <button
                onClick={() => setActiveTab('hot-issues')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
            {/* Control Panel */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Population Group */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ui.populationGroup')}
                  </label>
                  <select
                    value={selectedPopulationGroup}
                    onChange={(e) => setSelectedPopulationGroup(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="informal_workers">{t('populationGroups.informal_workers')}</option>
                    <option value="elderly">{t('populationGroups.elderly')}</option>
                    <option value="disabled">{t('populationGroups.disabled')}</option>
                    <option value="lgbtq">{t('populationGroups.lgbtq')}</option>
                    <option value="normal_population">{t('populationGroups.normal_population')}</option>
                  </select>
                </div>

                {/* District */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ui.district')}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {uniqueDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                {/* Domain */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('ui.indicator')} Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {availableDomains.map(domain => (
                      <option key={domain} value={domain}>
                        {t(`domains.${domain}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* View Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    View Mode
                  </label>
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="overview">Overview</option>
                    <option value="indicators">Indicators</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Overview Mode */}
            {viewMode === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Spider Chart */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Population Group Comparison
                  </h3>
                  <PopulationGroupSpiderChart 
                    selectedDomain={selectedDomain}
                    selectedDistrict={selectedDistrict}
                    getIndicatorData={getIndicatorData}
                  />
                </div>

                {/* Map */}
                <div className="bg-white rounded-lg shadow-sm dashboard-map-section">
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

            {/* Indicators Mode */}
            {viewMode === 'indicators' && (
              <div className="space-y-6">
                {/* Indicators Table */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {t(`domains.${selectedDomain}`)} - {t(`populationGroups.${selectedPopulationGroup}`)} 
                      {selectedDistrict !== 'Bangkok Overall' && ` - ${selectedDistrict}`}
                    </h3>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {currentIndicatorData && currentIndicatorData.length > 0 ? (
                      <div className="p-6">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 bg-gray-50">
                              <th className="text-left py-3 px-4 font-medium text-gray-700">
                                {t('ui.indicator')}
                              </th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">
                                {t('ui.score')}
                              </th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">
                                {t('ui.sampleSize')}
                              </th>
                              <th className="text-center py-3 px-4 font-medium text-gray-700">
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
                                    className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                                    onClick={() => handleIndicatorClick(indicator)}
                                  >
                                    {/* Indicator Name Column */}
                                    <td className="py-3 px-4">
                                      <div className="flex items-center">
                                        <span className="font-medium text-gray-900 hover:text-blue-600">
                                          {getIndicatorName(indicator, language) || item.label}
                                        </span>
                                        <svg className="w-4 h-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                      </div>
                                    </td>

                                    {/* Score Column */}
                                    <td className="text-center py-3 px-4">
                                      {item.noData || value === null || value === undefined ? (
                                        <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                                          N/A
                                        </span>
                                      ) : (
                                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getScoreColor(value, indicator)}`}>
                                          {formatValue(value, indicator)}
                                        </span>
                                      )}
                                    </td>

                                    {/* Sample Size Column */}
                                    <td className="text-center py-3 px-4 text-gray-600">
                                      {(() => {
                                        if (item.noData) {
                                          return language === 'th' ? 'ไม่มีข้อมูล' : 'No data';
                                        }
                                        
                                        return formatSampleSize(item.sample_size);
                                      })()}
                                    </td>

                                    {/* Performance Bar Column */}
                                    <td className="text-center py-3 px-4">
                                      {item.noData || value === null || value === undefined ? (
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div className="h-2 rounded-full bg-gray-300" style={{ width: '0%' }}></div>
                                        </div>
                                      ) : (
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                          <div 
                                            className={`h-2 rounded-full ${getPerformanceBarColor(value, indicator)}`}
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
                      <div className="text-center py-8 text-gray-500">
                        <p>{t('ui.noData')}</p>
                        <p className="text-sm mt-1">{t('ui.tryDifferent')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Full-width Map for indicators view */}
            {viewMode === 'indicators' && (
              <div className="bg-white rounded-lg shadow-sm" style={{ height: '500px' }}>
                <BangkokMap
                  selectedDomain={selectedDomain}
                  selectedPopulationGroup={selectedPopulationGroup}
                  selectedDistrict={selectedDistrict}
                  onDistrictClick={handleMapDistrictClick}
                  getIndicatorData={getIndicatorData}
                />
              </div>
            )}

            {/* Footer Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
              <h4 className="font-medium text-gray-800 mb-2">{t('ui.aboutSDHE')}</h4>
              <p className="text-sm text-gray-600 mb-2">
                {t('ui.aboutDescription')}
              </p>
              
              {/* Special note for Health Outcomes */}
              {selectedDomain === 'health_outcomes' && (
                <div className="bg-orange-50 border border-orange-200 rounded p-3 mb-4">
                  <p className="text-sm text-orange-800">
                    <strong>{t('ui.healthOutcomesNote')}</strong> {t('ui.healthOutcomesDescription')}
                  </p>
                </div>
              )}

              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-1"></div>
                  <span>{t('ui.excellent')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-100 border border-yellow-300 rounded mr-1"></div>
                  <span>{t('ui.good')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-orange-100 border border-orange-300 rounded mr-1"></div>
                  <span>{t('ui.fair')}</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-1"></div>
                  <span>{t('ui.poor')}</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                {t('ui.colorNote')}
              </p>
            </div>
          </>
        )}

        {/* Hot Issues Tab */}
        {activeTab === 'hot-issues' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <IndicatorAnalysis />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;