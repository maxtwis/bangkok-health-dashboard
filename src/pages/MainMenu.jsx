import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import useSDHEData from '../hooks/useSDHEData';
import { LoadingScreen } from '../components/Loading/LoadingSpinner';
import { DOMAINS, POPULATION_GROUPS } from '../constants/dashboardConstants';
import { getDataState, calculateDomainScore } from '../utils/dashboardUtils';
import { 
  BarChart3, 
  Map, 
  Users, 
  TrendingUp,
  Activity,
  Shield,
  Home,
  Heart,
  Globe,
  ChevronRight
} from 'lucide-react';

const MainMenu = () => {
  const navigate = useNavigate();
  const { language, toggleLanguage, t } = useLanguage();
  const { 
    isLoading, 
    error, 
    data, 
    getAvailableDistricts, 
    getAvailableDomains, 
    getIndicatorData,
    retry
  } = useSDHEData();

  const dataState = useMemo(() => 
    getDataState(isLoading, error, data), 
    [isLoading, error, data]
  );

  // Domain icons mapping
  const domainIcons = {
    economic_security: <Shield className="w-6 h-6" />,
    healthcare_access: <Heart className="w-6 h-6" />,
    physical_environment: <Home className="w-6 h-6" />,
    health_behaviors: <Activity className="w-6 h-6" />,
    social_context: <Users className="w-6 h-6" />,
    health_outcomes: <TrendingUp className="w-6 h-6" />
  };

  // Calculate domain scores for preview
  const domainScores = useMemo(() => {
    if (!dataState.hasData) return {};
    
    const scores = {};
    getAvailableDomains().forEach(domain => {
      const indicators = getIndicatorData(domain, 'Bangkok Overall', 'all');
      scores[domain] = calculateDomainScore(indicators);
    });
    return scores;
  }, [dataState.hasData, getAvailableDomains, getIndicatorData]);

  // Navigation handlers
  const handleDomainClick = (domain) => {
    navigate(`/analysis?domain=${domain}&district=Bangkok Overall&group=all`);
  };

  const handleGeographicView = () => {
    navigate('/geographic');
  };

  const handleComparison = () => {
    navigate('/comparison');
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
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">{t('ui.error')}</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={retry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {t('ui.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bangkok Health Dashboard
              </h1>
              <p className="text-gray-600 mt-1">
                Social Determinants of Health Equity Analysis
              </p>
            </div>
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Globe className="w-4 h-4" />
              <span className="text-sm font-medium">{language === 'en' ? 'TH' : 'EN'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Districts</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {getAvailableDistricts().length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Health Domains</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {getAvailableDomains().length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Population Groups</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {POPULATION_GROUPS.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Health Domains Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Health Domains</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {DOMAINS.map(domain => (
              <button
                key={domain.id}
                onClick={() => handleDomainClick(domain.id)}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <div className="p-3 rounded-lg bg-blue-100">
                      {domainIcons[domain.id]}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {t(`domains.${domain.id}`) || domain.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {domain.description}
                      </p>
                      {domainScores[domain.id] && (
                        <p className="text-lg font-semibold text-gray-700 mt-2">
                          Score: {domainScores[domain.id]}%
                        </p>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={handleGeographicView}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Map className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Geographic View
                  </h3>
                  <p className="text-sm text-gray-500">
                    Explore data across Bangkok districts on an interactive map
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>

          <button
            onClick={handleComparison}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    Population Comparison
                  </h3>
                  <p className="text-sm text-gray-500">
                    Compare health outcomes across different population groups
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </button>
        </div>
      </main>
    </div>
  );
};

export default MainMenu;