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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl p-12 shadow-xl">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t('ui.loading')}</h2>
          <p className="text-gray-600">{t('ui.loadingDescription')}</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-6">
        <div className="text-center bg-white p-12 rounded-2xl shadow-xl max-w-md">
          <div className="text-red-500 mb-6">
            <svg className="w-20 h-20 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">{t('ui.error')}</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg transition-colors font-medium"
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
  const availableDomains = getAvailableDomains();
  const currentIndicatorData = getIndicatorData(selectedDomain, selectedDistrict, selectedPopulationGroup);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
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
      <div className="max-w-[1600px] mx-auto px-4 lg:px-6 py-10">
        
        {/* Navigation Tabs with better styling */}
        <div className="mb-10">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-12">
              <button
                onClick={() => setActiveTab('analysis')}
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
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('ui.populationGroup')}
                  </label>
                  <select
                    value={selectedPopulationGroup}
                    onChange={(e) => setSelectedPopulationGroup(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-base focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('ui.district')}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => setSelectedDistrict(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-base focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  >
                    {availableDistricts.map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                  </select>
                </div>

                {/* Domain */}
                <div className="space-y-3">
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {t('ui.indicator')} Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-base focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
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
                  <label className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    View Mode
                  </label>
                  <select
                    value={viewMode}
                    onChange={(e) => setViewMode(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-base focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value="overview">Overview</option>
                    <option value="indicators">Indicators</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Overview Mode - Exact layout as requested */}
            {viewMode === 'overview' && (
              <div className="space-y-6">
                {/* Spider Chart and Map - Side by side with wider containers */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Spider Chart - Left side, with checkboxes inside */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                    {/* Population Group Checkboxes - Inside spider chart box */}
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
                              type="checkbox"
                              defaultChecked={true}
                              className="w-3.5 h-3.5 rounded border-2 border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-1"
                              style={{ 
                                accentColor: group.color,
                                backgroundColor: group.color 
                              }}
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

                    {/* Spider Chart Component */}
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
                                        <svg className="w-5 h-5 ml-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>
    </div>
  );
};

export default Dashboard;