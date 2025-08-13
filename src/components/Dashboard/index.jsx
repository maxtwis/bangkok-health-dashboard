// Updated Dashboard with Language Support - src/components/Dashboard/index.jsx
import React, { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import useBasicSDHEData from '../../hooks/useBasicSDHEData';
import PopulationGroupSpiderChart from './PopulationGroupSpiderChart';
import IndicatorAnalysis from './IndicatorAnalysis';

const BasicSDHEDashboard = () => {
  const { language, toggleLanguage, t } = useLanguage();
  const { isLoading, error, data, getAvailableDistricts, getAvailableDomains, getIndicatorData } = useBasicSDHEData();
  
  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedPopulationGroup, setSelectedPopulationGroup] = useState('informal_workers');
  const [selectedDistrict, setSelectedDistrict] = useState('Bangkok Overall');
  const [selectedDomain, setSelectedDomain] = useState('economic_security');

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

  // Set Bangkok Overall as default when data first loads
  React.useEffect(() => {
    if (data) {
      const districts = getAvailableDistricts();
      if (districts.length > 0 && districts.includes('Bangkok Overall') && !selectedDistrict) {
        setSelectedDistrict('Bangkok Overall');
      }
    }
  }, [data]);

  // Set default domain when data loads
  React.useEffect(() => {
    if (data) {
      const domains = getAvailableDomains();
      if (domains.length > 0 && !domains.includes(selectedDomain)) {
        setSelectedDomain(domains[0]);
      }
    }
  }, [data, selectedDomain, getAvailableDomains]);

  // Safe function to format sample size
  const formatSampleSize = (sampleSize) => {
    if (sampleSize === null || sampleSize === undefined || isNaN(sampleSize)) {
      return 'N/A';
    }
    return Number(sampleSize).toLocaleString();
  };

  // Safe function to format value
  const formatValue = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
    return `${Number(value).toFixed(1)}%`;
  };

  const getScoreColor = (value, indicator) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-lg font-medium">{t('ui.loading')}</div>
          </div>
          <p className="text-gray-600">{t('ui.loadingDescription')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">{t('ui.error')}</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {t('ui.retry')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const districts = getAvailableDistricts();
  const domains = getAvailableDomains();
  const indicatorData = getIndicatorData(selectedDomain, selectedDistrict, selectedPopulationGroup);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('appTitle')}</h1>
              <p className="text-gray-600 mt-1">{t('appSubtitle')}</p>
            </div>
            
            {/* Language Toggle */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleLanguage}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                </svg>
                <span className="text-sm font-medium">
                  {language === 'en' ? 'ไทย' : 'English'}
                </span>
              </button>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('analysis')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'analysis'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('sdheAnalysis')}
              </button>
              <button
                onClick={() => setActiveTab('hotissues')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'hotissues'
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {t('hotIssues')}
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'analysis' && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Spider Chart for Population Group Comparison */}
          <PopulationGroupSpiderChart 
            getIndicatorData={getIndicatorData}
            selectedDistrict={selectedDistrict}
          />

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Population Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ui.populationGroup')}
                </label>
                <select 
                  value={selectedPopulationGroup}
                  onChange={(e) => setSelectedPopulationGroup(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="informal_workers">{t('populationGroups.informal_workers')}</option>
                  <option value="elderly">{t('populationGroups.elderly')}</option>
                  <option value="disabled">{t('populationGroups.disabled')}</option>
                  <option value="lgbtq">{t('populationGroups.lgbtq')}</option>
                </select>
              </div>

              {/* District Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ui.district')}
                </label>
                <select 
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {districts.map(district => (
                    <option key={district} value={district}>
                      {district === 'Bangkok Overall' && language === 'th' 
                        ? t('ui.bangkokOverall')
                        : district
                      }
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Domain Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-4 px-6 overflow-x-auto">
                {domains.map(domain => (
                  <button
                    key={domain}
                    onClick={() => setSelectedDomain(domain)}
                    className={`py-4 px-3 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      selectedDomain === domain
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span>{t(`domains.${domain}`)}</span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Indicators Table */}
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  <span>
                    {language === 'th' 
                      ? `ตัวชี้วัดด้าน${t(`domains.${selectedDomain}`)}`
                      : `${t(`domains.${selectedDomain}`)} Indicators`
                    }
                  </span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t(`populationGroups.${selectedPopulationGroup}`)} - {
                    selectedDistrict === 'Bangkok Overall' && language === 'th' 
                      ? t('ui.bangkokOverall')
                      : selectedDistrict
                  }
                </p>
                
                {/* Health Outcomes Domain Description */}
                {selectedDomain === 'health_outcomes' && (
                  <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <div className="text-blue-600 mt-0.5">ℹ</div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-1">
                          {t('domains.health_outcomes')}
                        </h4>
                        <p className="text-xs text-blue-800">
                          {t('ui.healthOutcomesDescription')}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {indicatorData && indicatorData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200 bg-gray-50">
                        <th className="text-left py-3 px-4 font-medium text-gray-700">{t('ui.indicator')}</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">
                          {selectedDomain === 'health_outcomes' ? t('ui.prevalence') : t('ui.score')}
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">{t('ui.sampleSize')}</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-700">
                          {selectedDomain === 'health_outcomes' ? t('ui.diseaseBurden') : t('ui.performance')}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {indicatorData
                        .filter(item => {
                          const label = item?.label ?? 'Unknown Indicator';
                          const indicator = item?.indicator;
                          
                          return (
                            label !== 'Unknown Indicator' && 
                            label !== '' && 
                            indicator !== null && 
                            indicator !== undefined &&
                            indicator !== ''
                          );
                        })
                        .map((item, index) => {
                          const value = item?.value ?? 0;
                          const sampleSize = item?.sample_size ?? 0;
                          const isDomainScore = item?.isDomainScore ?? false;
                          const indicator = item?.indicator;
                          
                          // Get translated label
                          const translatedLabel = isDomainScore 
                            ? (language === 'th' 
                                ? `คะแนนรวมตัวชี้วัดด้าน${t(`domains.${selectedDomain}`)}`
                                : `${t(`domains.${selectedDomain}`)} Score`)
                            : t(`indicators.${indicator}`) !== `indicators.${indicator}` 
                              ? t(`indicators.${indicator}`)
                              : item?.label ?? 'Unknown Indicator';
                          
                          return (
                            <tr 
                              key={item?.indicator || index} 
                              className={`border-b border-gray-100 ${
                                isDomainScore ? 'bg-blue-50 font-medium' : 
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                              }`}
                            >
                              <td className="py-3 px-4">
                                <div className="flex items-center space-x-2">
                                  {isDomainScore && (
                                    <span className="text-blue-600 font-bold">■</span>
                                  )}
                                  <span className={isDomainScore ? 'font-bold text-blue-800' : ''}>
                                    {translatedLabel}
                                  </span>
                                  {/* Special highlighting for severe diseases in health outcomes */}
                                  {selectedDomain === 'health_outcomes' && !isDomainScore && (
                                    ['cancer', 'hiv', 'stroke', 'ischemic_heart_disease', 'chronic_kidney_disease'].includes(indicator) && (
                                      <span className="text-red-500 text-xs">!</span>
                                    )
                                  )}
                                </div>
                              </td>
                              <td className="text-center py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  getScoreColor(value, indicator)
                                }`}>
                                  {formatValue(value)}
                                </span>
                              </td>
                              <td className="text-center py-3 px-4 text-gray-600">
                                {formatSampleSize(sampleSize)}
                              </td>
                              <td className="text-center py-3 px-4">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className={`h-2 rounded-full ${
                                      getPerformanceBarColor(value, indicator)
                                    }`}
                                    style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }}
                                  ></div>
                                </div>
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

          {/* Footer Info */}
          <div className="bg-white rounded-lg shadow-sm p-6">
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
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-500 mt-4">
              <div><span className="inline-block w-3 h-3 bg-green-500 rounded mr-1"></span><strong>{t('ui.excellent')}:</strong> {t('ui.bestOutcomes')}</div>
              <div><span className="inline-block w-3 h-3 bg-yellow-500 rounded mr-1"></span><strong>{t('ui.good')}:</strong> {t('ui.aboveAverage')}</div>
              <div><span className="inline-block w-3 h-3 bg-orange-500 rounded mr-1"></span><strong>{t('ui.fair')}:</strong> {t('ui.belowAverage')}</div>
              <div><span className="inline-block w-3 h-3 bg-red-500 rounded mr-1"></span><strong>{t('ui.poor')}:</strong> {t('ui.worstOutcomes')}</div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              <strong>{t('ui.colorNote')}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Hot Issues Tab Content */}
      {activeTab === 'hotissues' && (
        <IndicatorAnalysis />
      )}
    </div>
  );
};

export default BasicSDHEDashboard;