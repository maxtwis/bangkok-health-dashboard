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
  const { isLoading, error, data, getAvailableDistricts, getAvailableDomains, getIndicatorData } = useBasicSDHEData();
  const { getIndicatorName, loading: indicatorDetailsLoading } = useIndicatorDetails();
  
  const [activeTab, setActiveTab] = useState('analysis');
  const [selectedPopulationGroup, setSelectedPopulationGroup] = useState('informal_workers');
  const [selectedDistrict, setSelectedDistrict] = useState('Bangkok Overall');
  const [selectedDomain, setSelectedDomain] = useState('economic_security');
  const [viewMode, setViewMode] = useState('overview');
  
  // States for indicator detail page
  const [showDetailPage, setShowDetailPage] = useState(false);
  const [selectedIndicator, setSelectedIndicator] = useState(null);
  const [surveyData, setSurveyData] = useState(null);

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

  // Load survey data when component mounts
  React.useEffect(() => {
    const loadSurveyData = async () => {
      try {
        const response = await fetch('/data/survey_sampling.csv');
        if (!response.ok) return;
        
        const csvContent = await response.text();
        const parsed = Papa.parse(csvContent, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });

        // Process the data with same classification logic
        const districtCodeMap = {
          1001: "พระนคร", 1002: "ดุสิต", 1003: "หนองจอก", 1004: "บางรัก",
          1005: "บางเขน", 1006: "บางกะปิ", 1007: "ปทุมวัน", 1008: "ป้อมปราบศัตรูพ่าย",
          1009: "พระโขนง", 1010: "มีนบุรี", 1011: "ลาดกระบัง", 1012: "ยานนาวา",
          1013: "สัมพันธวงศ์", 1014: "พญาไท", 1015: "ธนบุรี", 1016: "บางกอกใหญ่",
          1017: "ห้วยขวาง", 1018: "คลองสาน", 1019: "ตลิ่งชัน", 1020: "บางกอกน้อย",
          1021: "บางขุนเทียน", 1022: "ภาษีเจริญ", 1023: "หนองแขม", 1024: "ราษฎร์บูรณะ",
          1025: "บางพลัด", 1026: "ดินแดง", 1027: "บึงกุ่ม", 1028: "สาทร",
          1029: "บางซื่อ", 1030: "จตุจักร", 1031: "บางคอแหลม", 1032: "ประเวศ",
          1033: "คลองเตย", 1034: "สวนหลวง", 1035: "จอมทอง", 1036: "ดอนเมือง",
          1037: "ราชเทวี", 1038: "ลาดพร้าว", 1039: "วัฒนา", 1040: "บางแค",
          1041: "หลักสี่", 1042: "สายไหม", 1043: "คันนายาว", 1044: "สะพานสูง",
          1045: "วังทองหลาง", 1046: "คลองสามวา", 1047: "บางนา", 1048: "ทวีวัฒนา",
          1049: "ทุ่งครุ", 1050: "บางบอน"
        };

        const classifyPopulationGroup = (record) => {
          if (record.sex === 'lgbt') return 'lgbtq';
          if (record.age >= 60) return 'elderly';  
          if (record.disable_status === 1) return 'disabled';
          if (record.occupation_status === 1 && record.occupation_contract === 0) return 'informal_workers';
          return 'normal_population';
        };

        const processedData = parsed.data.map(record => ({
          ...record,
          district_name: districtCodeMap[record.dname] || `District_${record.dname}`,
          population_group: classifyPopulationGroup(record)
        }));

        setSurveyData(processedData);
      } catch (error) {
        // Error loading survey data
      }
    };

    loadSurveyData();
  }, []);

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

  // Safe function to format value
  const formatValue = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }
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
      const colorClass = getHealthcareSupplyColor(value, indicator);
      if (colorClass.includes('green')) return 'bg-green-500';
      if (colorClass.includes('yellow')) return 'bg-yellow-500';
      if (colorClass.includes('orange')) return 'bg-orange-500';
      return 'bg-red-500';
    }
    
    // Original logic for other indicators
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

  // Show detail page if indicator is selected
  if (showDetailPage && selectedIndicator) {
    return (
      <IndicatorDetailPage
        indicator={selectedIndicator}
        domain={selectedDomain}
        district={selectedDistrict}
        populationGroup={selectedPopulationGroup}
        onBack={handleBackFromDetail}
        surveyData={surveyData}
        getIndicatorData={getIndicatorData}
      />
    );
  }

  if (isLoading || indicatorDetailsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-lg font-medium">{t('ui.loading')}</div>
          </div>
          <p className="text-gray-600">
            {indicatorDetailsLoading 
              ? (language === 'th' ? 'กำลังโหลดรายละเอียดตัวชี้วัด...' : 'Loading indicator details...')
              : t('ui.loadingDescription')
            }
          </p>
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

  const domains = getAvailableDomains();
  const indicatorData = getIndicatorData(selectedDomain, selectedDistrict, selectedPopulationGroup);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-[1600px] mx-auto px-4 py-6">
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
        <div className="max-w-[1600px] mx-auto px-4 py-6">
          
          {/* Control Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                  <option value="normal_population">{t('populationGroups.normal_population')}</option>
                </select>
              </div>

              {/* Domain Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'th' ? 'ประเด็นตัวชี้วัด' : 'Domain'}
                </label>
                <select 
                  value={selectedDomain}
                  onChange={(e) => setSelectedDomain(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {domains.map(domain => (
                    <option key={domain} value={domain}>
                      {t(`domains.${domain}`)}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Mode Toggle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {language === 'th' ? 'มุมมอง' : 'View Mode'}
                </label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('overview')}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                      viewMode === 'overview' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {language === 'th' ? 'ภาพรวม' : 'Overview'}
                  </button>
                  <button
                    onClick={() => setViewMode('indicators')}
                    className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                      viewMode === 'indicators' 
                        ? 'bg-white text-gray-900 shadow-sm' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {language === 'th' ? 'ตัวชี้วัด' : 'Indicators'}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Selected District Info */}
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                <span className="font-medium">{language === 'th' ? 'เขตที่เลือก:' : 'Selected District:'}</span> {
                  selectedDistrict === 'Bangkok Overall' && language === 'th' 
                    ? t('ui.bangkokOverall')
                    : selectedDistrict
                } • <span className="font-medium">{t(`populationGroups.${selectedPopulationGroup}`)}</span>
              </div>
            </div>

            {/* Normal Population Note */}
            {selectedPopulationGroup === 'normal_population' && (
              <div className="mt-3">
                <p className="text-xs text-gray-500">
                  <strong>{language === 'th' ? 'หมายเหตุ:' : 'Note:'}</strong> {
                    language === 'th' 
                      ? 'ข้อมูลประชากรทั่วไปรวมข้อมูลจาก 2 แหล่งที่มา: ข้อมูลสำรวจระดับเขต และข้อมูลที่คำนวณแล้วระดับกรุงเทพฯ (*)'
                      : 'General population data combines 2 sources: district-level survey data and pre-calculated Bangkok-wide data (*)'
                  }
                </p>
              </div>
            )}
          </div>

          {viewMode === 'overview' && (
            /* Overview Layout: Spider Chart + Map */
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              {/* Left: Spider Chart */}
              <div className="bg-white rounded-lg shadow-sm">
                <PopulationGroupSpiderChart 
                  getIndicatorData={getIndicatorData}
                  selectedDistrict={selectedDistrict}
                />
              </div>

              {/* Right: Map */}
              <div className="bg-white rounded-lg shadow-sm" style={{ height: '600px' }}>
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

          {viewMode === 'indicators' && (
            /* Indicators View: Detailed Table */
            <div className="bg-white rounded-lg shadow-sm mb-6">
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
                            // Safety check for valid items
                            if (!item || typeof item !== 'object') return false;
                            
                            const label = item.label;
                            const indicator = item.indicator;
                            
                            return (
                              label && label !== 'Unknown Indicator' && 
                              label !== '' && 
                              indicator !== null && 
                              indicator !== undefined &&
                              indicator !== ''
                            );
                          })
                          .map((item, index) => {
                            // Safety checks for all values
                            const value = typeof item.value === 'number' ? item.value : null;
                            const sampleSize = item.sample_size;
                            const isDomainScore = Boolean(item.isDomainScore);
                            const indicator = item.indicator;
                            
                            // Get translated label
                            const translatedLabel = isDomainScore 
                              ? (language === 'th' 
                                  ? `คะแนนรวมตัวชี้วัดด้าน${t(`domains.${selectedDomain}`)}`
                                  : `${t(`domains.${selectedDomain}`)} Score`)
                              : getIndicatorName(indicator, language) || item.label || 'Unknown Indicator';
                            
                            return (
                              <tr 
                                key={`${indicator}-${index}`} 
                                className={`border-b border-gray-100 ${
                                  isDomainScore ? 'bg-blue-50 font-medium' : 
                                  index % 2 === 0 ? 'bg-white' : 'bg-gray-25'
                                } ${!isDomainScore ? 'hover:bg-blue-50 transition-colors' : ''}`}
                              >
                                {/* Indicator Name Column */}
                                <td className="py-3 px-4">
                                  <div className="flex items-center space-x-2">
                                    {isDomainScore && (
                                      <span className="text-blue-600 font-bold">▊</span>
                                    )}
                                    {!isDomainScore ? (
                                      <button
                                        onClick={() => handleIndicatorClick(indicator)}
                                        className="text-left hover:text-blue-600 hover:underline focus:outline-none focus:text-blue-600 cursor-pointer"
                                      >
                                        {translatedLabel}
                                      </button>
                                    ) : (
                                      <span className="font-bold text-blue-800">
                                        {translatedLabel}
                                      </span>
                                    )}
                                    {/* Special highlighting for severe diseases in health outcomes */}
                                    {selectedDomain === 'health_outcomes' && !isDomainScore && (
                                      ['cancer', 'hiv', 'stroke', 'ischemic_heart_disease', 'chronic_kidney_disease'].includes(indicator) && (
                                        <span className="text-red-500 text-xs">!</span>
                                      )
                                    )}
                                  </div>
                                </td>

                                {/* Score/Value Column */}
                                <td className="text-center py-3 px-4">
                                  {(() => {
                                    // Handle no data case
                                    if (item.noData || value === null || value === undefined) {
                                      return (
                                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-600">
                                          {language === 'th' ? 'ไม่มีข้อมูล' : 'No data'}
                                        </span>
                                      );
                                    }
                                    
                                    // Handle combined indicators with detailed tooltip
                                    if (item.isCombined) {
                                      const surveyVal = typeof item.surveyValue === 'number' ? item.surveyValue : null;
                                      const bangkokVal = typeof item.preCalculatedValue === 'number' ? item.preCalculatedValue : null;
                                      const sampleSz = item.surveySampleSize || 0;
                                      
                                      const tooltipText = (() => {
                                        const survey = surveyVal ? surveyVal.toFixed(1) : 'N/A';
                                        const bangkok = bangkokVal ? bangkokVal.toFixed(1) : 'N/A';
                                        
                                        switch (item.combinationMethod) {
                                          case 'small_sample_fallback':
                                            return language === 'th' 
                                              ? `ตัวอย่างน้อย (${sampleSz}): สำรวจ ${survey}% + กทม ${bangkok}% → ใช้ 30%:70%`
                                              : `Small sample (${sampleSz}): Survey ${survey}% + BKK ${bangkok}% → 30%:70% weight`;
                                          case 'small_sample_balanced':
                                            return language === 'th'
                                              ? `ตัวอย่างน้อย (${sampleSz}): สำรวจ ${survey}% + กทม ${bangkok}% → ใช้ 40%:60%`
                                              : `Small sample (${sampleSz}): Survey ${survey}% + BKK ${bangkok}% → 40%:60% weight`;
                                          case 'high_variance':
                                            return language === 'th'
                                              ? `ส่วนต่างสูง: สำรวจ ${survey}% + กทม ${bangkok}% → ใช้ 60%:40%`
                                              : `High variance: Survey ${survey}% + BKK ${bangkok}% → 60%:40% weight`;
                                          case 'normal_combination':
                                            return language === 'th'
                                              ? `ปกติ: สำรวจ ${survey}% + กทม ${bangkok}% → ใช้ 70%:30%`
                                              : `Normal: Survey ${survey}% + BKK ${bangkok}% → 70%:30% weight`;
                                          default:
                                            return language === 'th' ? 'ข้อมูลผสม' : 'Combined data';
                                        }
                                      })();
                                      
                                      return (
                                        <span 
                                          className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(value, indicator)} cursor-help`}
                                          title={tooltipText}
                                        >
                                          {(() => {
                                            const isSupplyIndicator = [
                                              'doctor_per_population', 
                                              'nurse_per_population', 
                                              'healthworker_per_population', 
                                              'community_healthworker_per_population',
                                              'health_service_access',
                                              'bed_per_population'
                                            ].includes(indicator);
                                            
                                            if (isSupplyIndicator) {
                                              const unit = indicator === 'healthworker_per_population' ? '10,000' : 
                                                          indicator === 'health_service_access' ? '10,000' :
                                                          indicator === 'bed_per_population' ? '10,000' : '1,000';
                                              return `${parseFloat(value || 0).toFixed(1)} per ${unit}`;
                                            } else {
                                              return formatValue(value);
                                            }
                                          })()}
                                          <span className="ml-1 text-xs opacity-75">⚬</span>
                                        </span>
                                      );
                                    }
                                    
                                    // Handle pre-calculated indicators
                                    if (item.isPreCalculated) {
                                      return (
                                        <span 
                                          className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(value, indicator)}`}
                                          title={language === 'th' ? 'ข้อมูลจากการคำนวณระดับกรุงเทพฯ' : 'Bangkok-wide pre-calculated data'}
                                        >
                                          {(() => {
                                            const isSupplyIndicator = [
                                              'doctor_per_population', 
                                              'nurse_per_population', 
                                              'healthworker_per_population', 
                                              'community_healthworker_per_population',
                                              'health_service_access',
                                              'bed_per_population'
                                            ].includes(indicator);
                                            
                                            if (isSupplyIndicator) {
                                              const unit = indicator === 'healthworker_per_population' ? '10,000' : 
                                                          indicator === 'health_service_access' ? '10,000' :
                                                          indicator === 'bed_per_population' ? '10,000' : '1,000';
                                              return `${parseFloat(value || 0).toFixed(1)} per ${unit}`;
                                            } else {
                                              return formatValue(value);
                                            }
                                          })()}
                                          <span className="ml-1 text-xs opacity-75">*</span>
                                        </span>
                                      );
                                    }
                                    
                                    // Regular indicators
                                    return (
                                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreColor(value, indicator)}`}>
                                        {(() => {
                                          const isSupplyIndicator = [
                                            'doctor_per_population', 
                                            'nurse_per_population', 
                                            'healthworker_per_population', 
                                            'community_healthworker_per_population',
                                            'health_service_access',
                                            'bed_per_population'
                                          ].includes(indicator);
                                          
                                          if (isSupplyIndicator) {
                                            const unit = indicator === 'healthworker_per_population' ? '10,000' : 
                                                        indicator === 'health_service_access' ? '10,000' :
                                                        indicator === 'bed_per_population' ? '10,000' : '1,000';
                                            return `${parseFloat(value || 0).toFixed(1)} per ${unit}`;
                                          } else {
                                            return formatValue(value);
                                          }
                                        })()}
                                      </span>
                                    );
                                  })()}
                                </td>

                                {/* Sample Size Column */}
                                <td className="text-center py-3 px-4 text-gray-600">
                                  {(() => {
                                    // Check combination method for detailed display
                                    if (item.isCombined && item.combinationMethod) {
                                      const method = item.combinationMethod;
                                      let description = '';
                                      let color = 'text-blue-600';
                                      
                                      switch (method) {
                                        case 'small_sample_fallback':
                                          description = language === 'th' ? 'ตย.น้อย→BKK' : 'Small→BKK';
                                          color = 'text-orange-600';
                                          break;
                                        case 'small_sample_balanced':
                                          description = language === 'th' ? 'ตย.น้อย+BKK' : 'Small+BKK';
                                          color = 'text-yellow-600';
                                          break;
                                        case 'high_variance':
                                          description = language === 'th' ? 'ส.แตกต่าง' : 'High Var';
                                          color = 'text-purple-600';
                                          break;
                                        case 'normal_combination':
                                          description = language === 'th' ? 'ส.+BKK' : 'Survey+BKK';
                                          color = 'text-green-600';
                                          break;
                                        default:
                                          description = language === 'th' ? 'ข้อมูลรวม' : 'Combined';
                                      }
                                      
                                      return (
                                        <span className="text-xs">
                                          <span className={`font-medium ${color}`}>{description}</span>
                                          <span className="block text-gray-500 text-xs">
                                            {typeof item.sample_size === 'string' ? item.sample_size : formatSampleSize(item.sample_size)}
                                          </span>
                                        </span>
                                      );
                                    }
                                    
                                    // Check if this is a pre-calculated indicator for normal population
                                    if (item.sample_size === 'Bangkok-wide' || item.isPreCalculated) {
                                      return language === 'th' ? 'ข้อมูลกรุงเทพฯ' : 'Bangkok-wide';
                                    }
                                    
                                    // Check if no data available
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

export default Dashboard;