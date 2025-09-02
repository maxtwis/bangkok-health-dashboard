import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Info, ChevronDown, AlertCircle, Brain } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import useIndicators from '../../hooks/useIndicators';
import { 
  calculateCorrelationMatrix, 
  getTopCorrelations,
  groupCorrelationsByDomain,
  calculateSignificance,
  getBasicCorrelationDescription
} from '../../utils/correlationUtils';
import { REVERSE_INDICATORS } from '../../constants/dashboardConstants';
import { INDICATOR_DOMAIN_MAP, getIndicatorDomain } from '../../utils/indicatorDomainMapping';

const CorrelationAnalysis = ({ 
  currentIndicator,
  surveyData,
  district,
  populationGroup,
  calculateIndicatorPositive
}) => {
  const { t, language } = useLanguage();
  const { getIndicatorInfo } = useIndicators();
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [minCorrelation, setMinCorrelation] = useState(0.0);
  const [showOnlySignificant, setShowOnlySignificant] = useState(false);

  // Get filtered survey data based on district and population group
  const filteredData = useMemo(() => {
    if (!surveyData || !Array.isArray(surveyData)) return [];
    
    let filtered = surveyData.filter(record => {
      // District filter - REMOVED for correlation analysis
      // We want to use all Bangkok data for better statistical significance
      // if (district !== 'Bangkok Overall' && record.district !== district) {
      //   return false;
      // }
      
      // Population group filter
      if (populationGroup === 'elderly') {
        return record.age >= 60;
      } else if (populationGroup === 'disabled') {
        return record.disable_status === 1;
      } else if (populationGroup === 'informal_workers') {
        return record.occupation_status === 1 && record.occupation_contract === 0;
      } else if (populationGroup === 'lgbtq') {
        return record.sex === 'lgbt';
      }
      
      return true; // normal_population includes everyone
    });
    
    return filtered;
  }, [surveyData, populationGroup]); // Removed district from dependencies

  // Get all available indicators for correlation analysis
  const availableIndicators = useMemo(() => {
    // Get all indicators from the domain mapping
    const allIndicators = Object.keys(INDICATOR_DOMAIN_MAP);
    
    // Filter out healthcare supply indicators as they don't have individual-level data
    const excludedIndicators = [
      'doctor_per_population', 'nurse_per_population', 'healthworker_per_population',
      'community_healthworker_per_population', 'health_service_access', 'bed_per_population'
    ];
    
    // Create indicator objects with domain information
    return allIndicators
      .filter(indicator => !excludedIndicators.includes(indicator))
      .map(indicator => ({
        indicator,
        domain: getIndicatorDomain(indicator)
      }));
  }, []);

  // Calculate correlations
  const correlationData = useMemo(() => {
    if (!filteredData.length || !currentIndicator) {
      console.log('No data or indicator:', filteredData.length, currentIndicator);
      return null;
    }
    
    try {
      // Always analyze all indicators for cross-domain correlations
      // The domain filter will be applied later for display purposes only
      let indicatorsToAnalyze = availableIndicators;
      
      const indicatorNames = indicatorsToAnalyze.map(ind => ind.indicator);
      console.log('Analyzing indicators:', indicatorNames.length, 'Sample size:', filteredData.length);
      
      // Calculate correlation matrix
      const matrix = calculateCorrelationMatrix(
        filteredData,
        indicatorNames,
        calculateIndicatorPositive
      );
      
      console.log('Correlation matrix calculated:', matrix);
      
      // Get top correlations for current indicator (increased to capture cross-domain relationships)
      const topCorrelations = getTopCorrelations(
        matrix,
        currentIndicator,
        50, // Get top 50 to include weaker cross-domain correlations
        minCorrelation
      );
      
      console.log('Top correlations found:', topCorrelations.length);
      console.log('Sample correlations:', topCorrelations.slice(0, 3).map(c => ({
        indicator: c.indicator, 
        correlation: c.correlation, 
        name: 'will be added'
      })));
      
      
      // Add metadata to correlations
      const enrichedCorrelations = topCorrelations.map(corr => {
        const indicatorMeta = indicatorsToAnalyze.find(ind => ind.indicator === corr.indicator);
        const significance = calculateSignificance(corr.correlation, filteredData.length);
        
        return {
          ...corr,
          name: indicatorMeta ? getIndicatorInfo(corr.indicator, language).name : corr.indicator,
          domain: indicatorMeta ? indicatorMeta.domain : 'unknown',
          domainName: indicatorMeta ? t(`domains.${indicatorMeta.domain}`) : 'Unknown',
          isReverse: REVERSE_INDICATORS[corr.indicator] || false,
          ...significance
        };
      });
      
      
      // Filter by significance if needed
      const significanceFilteredCorrelations = showOnlySignificant 
        ? enrichedCorrelations.filter(c => c.significant)
        : enrichedCorrelations;
      
      // Apply domain filter for display (show correlations WITH indicators from selected domain)
      const finalCorrelations = selectedDomain === 'all' 
        ? significanceFilteredCorrelations
        : significanceFilteredCorrelations.filter(c => c.domain === selectedDomain);
      
      return {
        correlations: finalCorrelations,
        matrix,
        sampleSize: filteredData.length,
        grouped: groupCorrelationsByDomain(
          finalCorrelations,
          (indicator) => {
            const ind = indicatorsToAnalyze.find(i => i.indicator === indicator);
            return ind ? ind.domain : 'unknown';
          }
        )
      };
    } catch (error) {
      console.error('Error calculating correlations:', error);
      return null;
    }
  }, [
    filteredData, 
    currentIndicator, 
    selectedDomain, 
    minCorrelation, 
    showOnlySignificant,
    availableIndicators,
    calculateIndicatorPositive,
    getIndicatorInfo,
    language,
    t
  ]);



  // Strength labels
  const strengthLabels = {
    'very strong': { en: 'Very Strong', th: 'มีความสัมพันธ์สูงมาก', color: 'text-red-600' },
    'strong': { en: 'Strong', th: 'มีความสัมพันธ์สูง', color: 'text-orange-600' },
    'moderate': { en: 'Moderate', th: 'มีความสัมพันธ์ปานกลาง', color: 'text-yellow-600' },
    'weak': { en: 'Weak', th: 'มีความสัมพันธ์น้อย', color: 'text-blue-600' },
    'negligible': { en: 'Negligible', th: 'ไม่มีความสัมพันธ์', color: 'text-gray-500' }
  };

  if (!correlationData || !correlationData.correlations.length) {
    return (
      <div className="bg-white rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            {language === 'th' ? 'การวิเคราะห์ความสัมพันธ์' : 'Correlation Analysis'}
          </h3>
        </div>
        
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">
              {language === 'th' 
                ? 'ไม่พบความสัมพันธ์ที่มีนัยสำคัญกับตัวชี้วัดอื่น'
                : 'No significant correlations found with other indicators'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {language === 'th'
                ? `ขนาดตัวอย่าง: ${filteredData.length} คน`
                : `Sample size: ${filteredData.length} people`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6">
      {/* Header with controls */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Brain className="w-5 h-5 mr-2 text-purple-600" />
            {language === 'th' ? 'การวิเคราะห์ความสัมพันธ์' : 'Correlation Analysis'}
          </h3>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Info className="w-4 h-4" />
            <span>
              {language === 'th' 
                ? `ขนาดตัวอย่าง: ${correlationData.sampleSize} คน (ข้อมูลทั้งกรุงเทพฯ)`
                : `Sample size: ${correlationData.sampleSize} people (Bangkok-wide data)`}
            </span>
          </div>
        </div>

        {/* District note when filtered */}
        {district && district !== 'Bangkok Overall' && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start">
              <Info className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800">
                {language === 'th' 
                  ? `กำลังดูข้อมูลของ ${district} แต่การคำนวณความสัมพันธ์ใช้ข้อมูลทั้งกรุงเทพฯ เพื่อความน่าเชื่อถือทางสถิติ`
                  : `Viewing data for ${district}, but correlations are calculated using Bangkok-wide data for statistical reliability.`}
              </p>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          {/* Domain filter */}
          <div className="relative">
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">{language === 'th' ? 'ทุกมิติ' : 'All Domains'}</option>
              <option value="economic_security">{t('domains.economic_security')}</option>
              <option value="education">{t('domains.education')}</option>
              <option value="healthcare_access">{t('domains.healthcare_access')}</option>
              <option value="physical_environment">{t('domains.physical_environment')}</option>
              <option value="social_context">{t('domains.social_context')}</option>
              <option value="health_behaviors">{t('domains.health_behaviors')}</option>
              <option value="health_outcomes">{t('domains.health_outcomes')}</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Minimum correlation filter */}
          <div className="relative">
            <select
              value={minCorrelation}
              onChange={(e) => setMinCorrelation(parseFloat(e.target.value))}
              className="appearance-none bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="0.0">{language === 'th' ? 'ทั้งหมด (r ≥ 0.0)' : 'All (r ≥ 0.0)'}</option>
              <option value="0.1">{language === 'th' ? 'มีความสัมพันธ์เล็กน้อยขึ้นไป (r ≥ 0.1)' : 'Negligible+ (r ≥ 0.1)'}</option>
              <option value="0.2">{language === 'th' ? 'มีความสัมพันธ์น้อยขึ้นไป (r ≥ 0.2)' : 'Weak+ (r ≥ 0.2)'}</option>
              <option value="0.3">{language === 'th' ? 'มีความสัมพันธ์ปานกลางขึ้นไป (r ≥ 0.3)' : 'Moderate+ (r ≥ 0.3)'}</option>
              <option value="0.5">{language === 'th' ? 'ความสัมพันธ์สูงขึ้นไป (r ≥ 0.5)' : 'Strong+ (r ≥ 0.5)'}</option>
            </select>
            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
          </div>

          {/* Significance filter */}
          <button
            onClick={() => setShowOnlySignificant(!showOnlySignificant)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showOnlySignificant 
                ? 'bg-blue-100 text-blue-700 border border-blue-300'
                : 'bg-gray-50 text-gray-700 border border-gray-300'
            }`}
          >
            {language === 'th' ? 'เฉพาะที่มีนัยสำคัญ' : 'Significant Only'}
            {showOnlySignificant && ' ✓'}
          </button>

        </div>
      </div>

      {/* Correlation List */}
        <div className="space-y-4">
          {/* Group by domain */}
          {Object.entries(correlationData.grouped).map(([domain, correlations]) => (
            <div key={domain} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-700 mb-3">
                {domain === 'unknown' ? 'Other' : t(`domains.${domain}`)}
              </h4>
              
              <div className="space-y-2">
                {correlations.map((corr, index) => {
                  const currentIndicatorInfo = getIndicatorInfo(currentIndicator, language);
                  const targetIndicatorInfo = getIndicatorInfo(corr.indicator, language);
                  const basicDescription = getBasicCorrelationDescription(
                    corr.correlation, 
                    language, 
                    currentIndicatorInfo.name, 
                    targetIndicatorInfo.name
                  );
                  
                  return (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center">
                            {corr.direction === 'positive' ? (
                              <TrendingUp className="w-4 h-4 text-emerald-600 mr-2" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-600 mr-2" />
                            )}
                            <span className="font-medium text-gray-800">
                              {corr.name}
                            </span>
                            {corr.isReverse && (
                              <span className="ml-2 text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded">
                                {language === 'th' ? 'ตัวชี้วัดแบบย้อนกลับ' : 'Reverse'}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-right ml-4">
                          <div className="font-mono text-sm font-medium">
                            r = {corr.correlation.toFixed(3)}{corr.stars}
                          </div>
                          <div className={`text-xs ${strengthLabels[corr.strength].color}`}>
                            {strengthLabels[corr.strength][language === 'th' ? 'th' : 'en']}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1">
                        {basicDescription.description}
                      </p>
                      
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      {/* Statistical note */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-amber-600 mr-2 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">
              {language === 'th' ? 'หมายเหตุทางสถิติ' : 'Statistical Note'}
            </p>
            <p>
              {language === 'th'
                ? 'ความสัมพันธ์ (correlation) ไม่ได้บ่งบอกถึงความเป็นเหตุเป็นผล (causation) ตัวชี้วัดที่มีความสัมพันธ์กันอาจมีปัจจัยร่วมอื่นๆ ที่ส่งผลต่อทั้งสองตัวชี้วัด'
                : 'Correlation does not imply causation. Correlated indicators may share common underlying factors affecting both.'}
            </p>
            <p className="mt-1 text-xs">
              {language === 'th'
                ? `* p < 0.05, ** p < 0.01, *** p < 0.001 (Pearson correlation, n=${correlationData.sampleSize})`
                : `* p < 0.05, ** p < 0.01, *** p < 0.001 (Pearson correlation, n=${correlationData.sampleSize})`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CorrelationAnalysis;