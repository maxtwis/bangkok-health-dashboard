import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
import { INDICATOR_TYPES, getDomainsByType, getIndicatorType } from '../../constants/indicatorTypes';
import { getDomainsByIndicatorType } from '../../utils/indicatorDomainMapping';

// Icon mapping for population groups
const getPopulationIcon = (iconKey) => {
  const icons = {
    work: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    elderly: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
      </svg>
    ),
    accessible: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    diversity: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
      </svg>
    ),
    population: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
      </svg>
    )
  };
  return icons[iconKey] || null;
};

// Flag components using flag-icons
const ThaiFlag = ({ className = "w-5 h-5" }) => (
  <span className={`fi fi-th inline-block ${className} rounded border border-gray-200`}></span>
);

const UKFlag = ({ className = "w-5 h-5" }) => (
  <span className={`fi fi-gb inline-block ${className} rounded border border-gray-200`}></span>
);

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
    healthSupplyData, 
    getAvailableDistricts, 
    getAvailableDomains, 
    getIndicatorData 
  } = useSDHEData();
  const { getIndicatorName, loading: indicatorDetailsLoading } = useIndicators();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPopulationGroup, setSelectedPopulationGroup] = useState('informal_workers');
  const [selectedDistrict, setSelectedDistrict] = useState('Bangkok Overall');
  const [selectedIndicatorType, setSelectedIndicatorType] = useState(INDICATOR_TYPES.SDHE);
  const [selectedDomain, setSelectedDomain] = useState('economic_security');
  const [viewMode, setViewMode] = useState('overview');
  
  
  // Sync viewMode with activeTab
  useEffect(() => {
    if (activeTab === 'overview' || activeTab === 'indicators') {
      setViewMode(activeTab);
    }
  }, [activeTab]);
  
  // Update domain when indicator type changes
  useEffect(() => {
    const availableDomains = getDomainsByIndicatorType(selectedIndicatorType);
    // Use functional update to get current domain value without adding it to dependencies
    setSelectedDomain(currentDomain => {
      if (availableDomains.length > 0 && !availableDomains.includes(currentDomain)) {
        return availableDomains[0];
      }
      return currentDomain;
    });
  }, [selectedIndicatorType]);
  
  // Language dropdown state
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const languageDropdownRef = useRef(null);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (languageDropdownRef.current && !languageDropdownRef.current.contains(event.target)) {
        setIsLanguageDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
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
      setActiveTab('indicators');
      setViewMode('indicators');
    } else if (pathname === '/main' || pathname === '/') {
      setShowDetailPage(false);
      
      // Check for tab parameter in URL, default to overview
      const tabParam = searchParams.get('tab');
      if (tabParam === 'indicators') {
        setActiveTab('indicators');
        setViewMode('indicators');
      } else {
        setActiveTab('overview');
        setViewMode('overview');
      }
    }
    
    // Update state from URL parameters
    const domain = searchParams.get('domain');
    const district = searchParams.get('district');
    const group = searchParams.get('group');
    const type = searchParams.get('type');
    
    if (type && (type === INDICATOR_TYPES.SDHE || type === INDICATOR_TYPES.IMD)) {
      setSelectedIndicatorType(type);
    }
    if (domain) {
      setSelectedDomain(domain);
    }
    if (district) {
      setSelectedDistrict(district);
    }
    
    // Handle population group with IMD indicator correction
    if (group) {
      // If we're on detail page with an IMD indicator, correct the population group
      if (pathname === '/detail') {
        const indicator = searchParams.get('indicator');
        if (indicator && getIndicatorType(indicator) === INDICATOR_TYPES.IMD && group !== 'all') {
          // Redirect with corrected URL
          const params = new URLSearchParams();
          params.set('indicator', indicator);
          params.set('domain', domain || selectedDomain);
          params.set('district', district || selectedDistrict);
          params.set('group', 'all');
          navigate(`/detail?${params.toString()}`, { replace: true });
          return; // Exit early to prevent setting wrong state
        }
      }
      setSelectedPopulationGroup(group);
    }
  }, [location, navigate]);

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
    
    // For IMD (healthcare supply) indicators, always use 'all' population group
    const indicatorType = getIndicatorType(indicatorName);
    const populationGroup = indicatorType === INDICATOR_TYPES.IMD ? 'all' : selectedPopulationGroup;
    params.set('group', populationGroup);
    
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
    // Preserve the population group in URL
    params.set('group', selectedPopulationGroup);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [navigate, location, selectedPopulationGroup]);

  const handleDomainChange = useCallback((domain) => {
    setSelectedDomain(domain);
    const params = new URLSearchParams(location.search);
    params.set('domain', domain);
    // Preserve the population group in URL
    params.set('group', selectedPopulationGroup);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [navigate, location, selectedPopulationGroup]);

  const handleMapDistrictClick = useCallback((districtName) => {
    setSelectedDistrict(districtName);
  }, []);

  const handleIndicatorTypeChange = useCallback((newType) => {
    setSelectedIndicatorType(newType);
    
    // Get available domains for the new type and switch to first one if current is not valid
    const availableDomains = getDomainsByIndicatorType(newType);
    let newDomain = selectedDomain;
    if (availableDomains.length > 0 && !availableDomains.includes(selectedDomain)) {
      newDomain = availableDomains[0];
      setSelectedDomain(newDomain);
    }
    
    // Handle population group changes
    let newPopulationGroup = selectedPopulationGroup;
    if (newType === INDICATOR_TYPES.SDHE && selectedPopulationGroup === 'all') {
      newPopulationGroup = 'informal_workers';
      setSelectedPopulationGroup(newPopulationGroup);
    }
    
    // Update URL parameters
    const params = new URLSearchParams(location.search);
    params.set('type', newType);
    params.set('domain', newDomain);
    params.set('group', newPopulationGroup);
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  }, [navigate, location, selectedPopulationGroup, selectedDomain]);

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
      'bed_per_population',
      'market_per_population',
      'sportfield_per_population'
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
        'bed_per_population': `${valueNum.toFixed(1)} per 10,000`,
        'market_per_population': `${valueNum.toFixed(1)} per 10,000`,
        'sportfield_per_population': `${valueNum.toFixed(1)} per 1,000`
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
      'bed_per_population',
      'market_per_population',
      'sportfield_per_population'
    ];
    
    if (healthcareSupplyIndicators.includes(indicator)) {
      const color = getHealthcareSupplyColor(value, indicator);
      // Convert hex to Tailwind badge classes
      if (color === '#10B981') return 'bg-green-100 text-green-800';
      if (color === '#F59E0B') return 'bg-yellow-100 text-yellow-800';
      if (color === '#FB923C') return 'bg-orange-100 text-orange-800';
      if (color === '#EF4444') return 'bg-red-100 text-red-800';
      return 'bg-red-100 text-red-800'; // default
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
    // Handle healthcare supply indicators with WHO benchmarks
    const healthcareSupplyIndicators = [
      'doctor_per_population', 
      'nurse_per_population', 
      'healthworker_per_population', 
      'community_healthworker_per_population',
      'health_service_access',
      'bed_per_population',
      'market_per_population',
      'sportfield_per_population'
    ];
    
    if (healthcareSupplyIndicators.includes(indicator)) {
      const color = getHealthcareSupplyColor(value, indicator);
      
      // Convert hex color to Tailwind class
      if (color === '#10B981') return 'bg-green-500';   // green
      if (color === '#F59E0B') return 'bg-yellow-500';  // yellow
      if (color === '#FB923C') return 'bg-orange-500';  // orange
      if (color === '#EF4444') return 'bg-red-500';     // red
      
      // Default fallback
      return 'bg-red-500';
    }
    
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

  // Skip loading screen - data will load in background
  // if (dataState.isLoading) {
  //   return <LoadingScreen message={t('ui.loading')} />;
  // }

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
              onClick={() => window.location.reload()}
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
        indicatorType={selectedIndicatorType}
        onBack={handleBackFromDetail}
        getIndicatorData={getIndicatorData}
        surveyData={surveyData}
        healthFacilitiesData={healthFacilitiesData}
        healthSupplyData={healthSupplyData}
      />
    );
  }

  const availableDistricts = dataState.isLoading ? [] : getAvailableDistricts();
  // Use getDomainsByIndicatorType instead of getAvailableDomains to filter by indicator type
  const availableDomains = dataState.isLoading ? [] : getDomainsByIndicatorType(selectedIndicatorType);
  // Pass 'all' as population group for IMD indicators
  const effectivePopulationGroup = selectedIndicatorType === INDICATOR_TYPES.IMD ? 'all' : selectedPopulationGroup;
  const currentIndicatorData = dataState.isLoading ? [] : getIndicatorData(selectedDomain, selectedDistrict, effectivePopulationGroup, selectedIndicatorType);
  
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Skip to main content for keyboard navigation */}
      <a href="#main-content" className="skip-to-main">
        Skip to main content
      </a>
      {/* Modern Header with Gradient */}
      <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 shadow-xl relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-white/10"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full"></div>
          <div className="absolute top-8 right-16 w-8 h-8 bg-white/5 rounded-full"></div>
          <div className="absolute top-16 right-8 w-12 h-12 bg-white/8 rounded-full"></div>
        </div>
        
        <div className="relative max-w-[1600px] mx-auto px-4 lg:px-6">
          <div className="flex justify-between items-center py-8">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-white tracking-tight">
                {t('appTitle')}
              </h1>
              <p className="text-blue-100 text-lg font-medium max-w-2xl">
                {t('appSubtitle')}
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Language Dropdown */}
              <div className="relative z-[9999]" ref={languageDropdownRef}>
                <button
                  onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 transition-all duration-200 font-medium border border-white/30 shadow-lg hover:shadow-xl"
                >
                  {language === 'th' ? <ThaiFlag /> : <UKFlag />}
                  <span className="text-sm">
                    {language === 'th' ? 'ไทย' : 'English'}
                  </span>
                  <svg className={`w-4 h-4 transition-transform duration-200 ${isLanguageDropdownOpen ? 'rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isLanguageDropdownOpen && (
                  <div className="fixed top-20 right-4 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-[9999]">
                    <button
                      onClick={() => {
                        if (language !== 'th') toggleLanguage();
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${
                        language === 'th' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <ThaiFlag />
                      <div>
                        <div className="font-medium">ไทย</div>
                        <div className="text-sm text-gray-500">Thai</div>
                      </div>
                      {language === 'th' && (
                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        if (language !== 'en') toggleLanguage();
                        setIsLanguageDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-200 ${
                        language === 'en' ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                      }`}
                    >
                      <UKFlag />
                      <div>
                        <div className="font-medium">English</div>
                        <div className="text-sm text-gray-500">EN</div>
                      </div>
                      {language === 'en' && (
                        <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </button>
                  </div>
                )}
              </div>
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
                  setActiveTab('overview');
                  setViewMode('overview');
                  navigate('/main');
                }}
                className={`py-4 px-2 border-b-3 font-semibold text-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {language === 'th' ? 'ภาพรวม' : 'Overview'}
              </button>
              <button
                onClick={() => {
                  setActiveTab('indicators');
                  setViewMode('indicators');
                  navigate('/main?tab=indicators');
                }}
                className={`py-4 px-2 border-b-3 font-semibold text-lg whitespace-nowrap transition-all duration-200 ${
                  activeTab === 'indicators'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {language === 'th' ? 'ตัวชี้วัด' : 'Indicators'}
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
        {(activeTab === 'overview' || activeTab === 'indicators') && (
          <>
            {/* Enhanced Filter Panel */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-10 border border-gray-100 relative overflow-hidden">
              {/* Subtle background pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full -translate-y-16 translate-x-16 opacity-50"></div>
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">
                    {language === 'th' ? 'แผงควบคุม' : 'Dashboard Controls'}
                  </h3>
                </div>
                <p className="text-gray-600 mb-8">
                  {language === 'th' 
                    ? 'ปรับแต่งมุมมองเพื่อสำรวจตัวชี้วัดสุขภาพในชุมชนต่างๆ ของกรุงเทพฯ' 
                    : 'Customize your view to explore health indicators across Bangkok\'s communities'}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                {/* Indicator Type - NEW FILTER */}
                <div className="space-y-3">
                  <label htmlFor="indicator-type-select" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {language === 'th' ? 'ประเภทตัวชี้วัด' : 'Indicator Type'}
                  </label>
                  <select
                    id="indicator-type-select"
                    value={selectedIndicatorType}
                    onChange={(e) => handleIndicatorTypeChange(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-base focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                  >
                    <option value={INDICATOR_TYPES.SDHE}>
                      {language === 'th' ? 'SDHE (ข้อมูลสำรวจ)' : 'SDHE (Survey Data)'}
                    </option>
                    <option value={INDICATOR_TYPES.IMD}>
                      {language === 'th' ? 'IMD (การเข้าถึงสถานบริการ)' : 'IMD (Service Access)'}
                    </option>
                  </select>
                </div>

                {/* Domain */}
                <div className="space-y-3">
                  <label htmlFor="domain-select" className="block text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    {language === 'th' ? 'ประเด็นตัวชี้วัด' : 'Domain'}
                  </label>
                  <select
                    id="domain-select"
                    value={selectedDomain}
                    onChange={(e) => handleDomainChange(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 bg-white text-base focus:outline-none focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200"
                    aria-describedby="domain-description"
                  >
                    {getDomainsByIndicatorType(selectedIndicatorType).map(domain => (
                      <option key={domain} value={domain}>
                        {t(`domains.${domain}`)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Population Group - Disabled for IMD */}
                <div className="space-y-3">
                  <label htmlFor="population-group-select" className={`block text-sm font-semibold uppercase tracking-wide ${selectedIndicatorType === INDICATOR_TYPES.IMD ? 'text-gray-400' : 'text-gray-700'}`}>
                    {t('ui.populationGroup')}
                    {selectedIndicatorType === INDICATOR_TYPES.IMD && (
                      <span className="ml-2 text-xs font-normal normal-case whitespace-nowrap">
                        ({language === 'th' ? 'ไม่ใช้กับ IMD' : 'N/A for IMD'})
                      </span>
                    )}
                  </label>
                  <select
                    id="population-group-select"
                    value={selectedIndicatorType === INDICATOR_TYPES.IMD ? 'all' : selectedPopulationGroup}
                    onChange={(e) => setSelectedPopulationGroup(e.target.value)}
                    disabled={selectedIndicatorType === INDICATOR_TYPES.IMD}
                    className={`w-full border-2 rounded-lg px-4 py-3 text-base focus:outline-none transition-all duration-200 ${
                      selectedIndicatorType === INDICATOR_TYPES.IMD 
                        ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed' 
                        : 'border-gray-200 bg-white focus:ring-3 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                    aria-describedby="population-group-description"
                  >
                    {selectedIndicatorType === INDICATOR_TYPES.IMD ? (
                      <option value="all">{language === 'th' ? 'ทุกกลุ่มประชากร' : 'All Population Groups'}</option>
                    ) : (
                      <>
                        <option value="informal_workers">{t('populationGroups.informal_workers')}</option>
                        <option value="elderly">{t('populationGroups.elderly')}</option>
                        <option value="disabled">{t('populationGroups.disabled')}</option>
                        <option value="lgbtq">{t('populationGroups.lgbtq')}</option>
                        <option value="normal_population">{t('populationGroups.normal_population')}</option>
                      </>
                    )}
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
                      <option key={district} value={district}>
                        {district === 'Bangkok Overall' && language === 'th' ? 'ภาพรวมทั้งหมด' : district}
                      </option>
                    ))}
                  </select>
                </div>

                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      setSelectedDistrict('Bangkok Overall');
                      setSelectedDomain('economic_security');
                      setSelectedPopulationGroup('normal_population');
                      setViewMode('overview');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
Reset Filters
                  </button>
                  <div className="flex-1"></div>
                </div>
              </div>
            </div>

            {/* Overview Mode - Compact Layout */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Spider Chart and Map - Side by side with compact styling */}
                <div className={`grid grid-cols-1 gap-6 ${selectedIndicatorType !== INDICATOR_TYPES.IMD ? 'xl:grid-cols-2' : ''}`}>
                  {/* Spider Chart - Compact Container (hidden for IMD) */}
                  {selectedIndicatorType !== INDICATOR_TYPES.IMD && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 relative overflow-hidden">
                    {/* Compact Title Section */}
                    <div className="relative mb-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {t('ui.spiderChartTitle')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {t('ui.spiderChartDescription')} {
                          selectedDistrict === 'Bangkok Overall' && language === 'th'
                            ? t('ui.bangkokOverall') 
                            : selectedDistrict
                        }
                      </p>
                    </div>

                    {/* Compact Population Group Selector */}
                    <div className="bg-white rounded-lg border border-gray-200 p-3 mb-4">
                      <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Population Groups</h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Enhanced Checkboxes */}
                        {[
                          { value: 'informal_workers', color: '#ef4444', icon: 'work' },
                          { value: 'elderly', color: '#3b82f6', icon: 'elderly' },
                          { value: 'disabled', color: '#10b981', icon: 'accessible' },
                          { value: 'lgbtq', color: '#f59e0b', icon: 'diversity' },
                          { value: 'normal_population', color: '#6b7280', icon: 'population' }
                        ].map(group => (
                          <label key={group.value} className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded px-2 py-1 transition-colors duration-200">
                            <input
                              id={`population-group-${group.value}`}
                              type="checkbox"
                              defaultChecked={true}
                              className="w-3.5 h-3.5 rounded border border-gray-300 focus:ring-1 focus:ring-offset-0 transition-all"
                              style={{ 
                                accentColor: group.color
                              }}
                              aria-describedby={`population-group-${group.value}-description`}
                              onChange={(e) => {
                                const event = new CustomEvent('populationGroupToggle', {
                                  detail: { group: group.value, checked: e.target.checked }
                                });
                                window.dispatchEvent(event);
                              }}
                            />
                            <div 
                              className="w-2 h-2 rounded-full flex-shrink-0" 
                              style={{ backgroundColor: group.color }}
                            ></div>
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
                      selectedIndicatorType={selectedIndicatorType}
                      getIndicatorData={getIndicatorData}
                      hideCheckboxes={true}
                    />
                  </div>
                  )}

                  {/* Enhanced Map Container */}
                  <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 relative" style={{ height: '700px' }}>
                    {/* Map Header */}
                    <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-r from-white/95 to-white/90 backdrop-blur-sm border-b border-gray-100 p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-xl">
                          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">Bangkok Districts</h3>
                          <p className="text-sm text-gray-600">
                            {t(`domains.${selectedDomain}`)}
                            {selectedIndicatorType !== INDICATOR_TYPES.IMD && (
                              <> - {t(`populationGroups.${selectedPopulationGroup}`)}</>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Map with top padding for header */}
                    <div className="h-full pt-20">
                      {dataState.isLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <LoadingCard message={t('ui.loading')} />
                        </div>
                      ) : (
                        <BangkokMap
                          selectedDomain={selectedDomain}
                          selectedPopulationGroup={selectedPopulationGroup}
                          selectedDistrict={selectedDistrict}
                          selectedIndicatorType={selectedIndicatorType}
                          onDistrictClick={handleMapDistrictClick}
                          getIndicatorData={getIndicatorData}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Domain Performance Rankings (hidden for IMD) */}
                {selectedIndicatorType !== INDICATOR_TYPES.IMD && (
                  <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 relative overflow-hidden">
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-indigo-50 to-purple-50 rounded-full -translate-y-20 translate-x-20 opacity-60"></div>
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="text-2xl font-bold text-gray-800">Domain Performance Rankings</h4>
                        <p className="text-gray-600">Top performing health domains by population group</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
                    {[
                      { value: 'informal_workers', color: '#ef4444', icon: 'work', bgColor: 'from-red-50 to-red-100' },
                      { value: 'elderly', color: '#3b82f6', icon: 'elderly', bgColor: 'from-blue-50 to-blue-100' },
                      { value: 'disabled', color: '#10b981', icon: 'accessible', bgColor: 'from-green-50 to-green-100' },
                      { value: 'lgbtq', color: '#f59e0b', icon: 'diversity', bgColor: 'from-amber-50 to-amber-100' },
                      { value: 'normal_population', color: '#6b7280', icon: 'population', bgColor: 'from-gray-50 to-gray-100' }
                    ].map(group => {
                      // Calculate scores for this group across filtered domains based on indicator type
                      const domains = getDomainsByIndicatorType(selectedIndicatorType);
                      
                      const groupScores = domains.map(domain => {
                        try {
                          const indicatorData = getIndicatorData(domain, selectedDistrict, group.value, selectedIndicatorType);
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
                        <div key={group.value} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-center justify-between mb-3">
                            <h5 className="font-semibold text-gray-800 text-sm">
                              {t(`populationGroups.${group.value}`)}
                            </h5>
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: group.color }}
                            ></div>
                          </div>
                          <div className="space-y-1.5">
                            {groupScores.map((item, index) => (
                              <div key={item.domain} className="flex items-center justify-between text-xs">
                                <span className="text-gray-600 flex-1" title={item.domain}>
                                  {index + 1}. {item.domain}
                                </span>
                                <span className="font-semibold text-gray-900 ml-2 flex-shrink-0">{item.score.toFixed(0)}%</span>
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
              </div>
            )}

            {/* Enhanced Indicators Mode */}
            {activeTab === 'indicators' && (
              <div className="space-y-6">
                {/* Enhanced Indicators Table */}
                <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="px-8 py-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/30 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                    
                    <div className="relative flex items-start gap-4">
                      <div className="p-3 bg-white rounded-xl shadow-sm">
                        <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                          {t(`domains.${selectedDomain}`)}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          {selectedIndicatorType !== INDICATOR_TYPES.IMD && (
                            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full font-semibold">
                              {t(`populationGroups.${selectedPopulationGroup}`)}
                            </span>
                          )}
                          {selectedDistrict !== 'Bangkok Overall' && (
                            <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-full font-semibold">
{selectedDistrict}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mt-2">Detailed indicator breakdown and performance metrics</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="overflow-x-auto">
                    {dataState.isLoading ? (
                      <div className="p-8">
                        <LoadingCard message={t('ui.loading')} />
                      </div>
                    ) : currentIndicatorData && currentIndicatorData.length > 0 ? (
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
                              {/* Hide sample size column for IMD */}
                              {selectedIndicatorType !== INDICATOR_TYPES.IMD && (
                                <th className="text-center py-4 px-6 font-semibold text-gray-700 bg-gray-50">
                                  {t('ui.sampleSize')}
                                </th>
                              )}
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

                                    {/* Sample Size Column - Hidden for IMD */}
                                    {selectedIndicatorType !== INDICATOR_TYPES.IMD && (
                                      <td className="text-center py-4 px-6 text-gray-600">
                                        {(() => {
                                          if (item.noData) {
                                            return language === 'th' ? 'ไม่มีข้อมูล' : 'No data';
                                          }
                                          
                                          return formatSampleSize(item.sample_size);
                                        })()}
                                      </td>
                                    )}

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
                                            style={{ width: `${(() => {
                                              // For healthcare supply indicators, calculate width based on benchmarks
                                              const healthcareSupplyIndicators = [
                                                'doctor_per_population', 
                                                'nurse_per_population', 
                                                'healthworker_per_population', 
                                                'community_healthworker_per_population',
                                                'health_service_access',
                                                'bed_per_population',
                                                'market_per_population',
                                                'sportfield_per_population'
                                              ];
                                              
                                              if (healthcareSupplyIndicators.includes(indicator)) {
                                                // Scale based on good benchmark (100% = good threshold)
                                                const benchmarks = HEALTHCARE_SUPPLY_BENCHMARKS[indicator];
                                                if (benchmarks && benchmarks.good) {
                                                  // Scale to percentage where 100% = good benchmark
                                                  const percentage = (value / benchmarks.good) * 100;
                                                  return Math.min(100, Math.max(0, percentage));
                                                }
                                              }
                                              
                                              // Default for non-supply indicators (already percentages)
                                              return Math.min(100, Math.max(0, parseFloat(value) || 0));
                                            })()}%` }}
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
            {activeTab === 'indicators' && (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100" style={{ height: '600px' }}>
                <div className="h-full">
                  {dataState.isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <LoadingCard message={t('ui.loading')} />
                    </div>
                  ) : (
                    <BangkokMap
                      selectedDomain={selectedDomain}
                      selectedPopulationGroup={selectedPopulationGroup}
                      selectedDistrict={selectedDistrict}
                      selectedIndicatorType={selectedIndicatorType}
                      onDistrictClick={handleMapDistrictClick}
                      getIndicatorData={getIndicatorData}
                    />
                  )}
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