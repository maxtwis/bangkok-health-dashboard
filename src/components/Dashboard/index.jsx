// Enhanced Bangkok Health Inequalities Dashboard with SDHE Integration
import React, { useState, useEffect } from 'react';
import useHealthData from '../../hooks/useHealthData';
import useSDHEData from '../../hooks/useSDHEData'; // New SDHE data hook
import useGeoJsonData from '../../hooks/useGeoJsonData';
import Header from '../common/Header';
import Footer from '../common/Footer';
import DistrictSelector from './DistrictSelector';
import LeftPanel from './LeftPanel';
import EnhancedSDHESpiderChart from './SDHESpiderChart'; // Enhanced spider chart
import SDHEIndicatorsTable from './SDHEIndicatorsTable'; // New indicators table
import { 
  getFilteredData, 
  getSexFilteredData, 
  prepareSexComparisonData,
  getSummaryData
} from './DataUtils';

const EnhancedDashboard = () => {
  // Original health data (for backward compatibility)
  const { 
    drinkRateData,
    drinkRateBySexData,
    smokeRateData,
    smokeRateBySexData,
    trafficDeathRateData,
    obeseRateData,
    obeseRateBySexData,
    districts,
    years,
    sexes,
    indicatorsWithSexData,
    indicatorYears,
    isLoading: isOriginalDataLoading,
    error: originalDataError
  } = useHealthData();

  // New SDHE data processing
  const {
    sdheData,
    isLoading: isSDHELoading,
    error: sdheError,
    processingStatus,
    getSpiderChartData,
    getIndicatorTableData,
    getDomainScore,
    getPopulationGroupStats,
    getBangkokOverview,
    getDistrictComparison,
    getEquityGaps,
    getVulnerabilityIndex,
    getAvailableDomains,
    getAvailableDistricts,
    getAvailablePopulationGroups
  } = useSDHEData();
  
  const {
    districtGeoJson,
    isLoading: isGeoJsonLoading,
    error: geoJsonError
  } = useGeoJsonData();
  
  // State management
  const [analysisLevel, setAnalysisLevel] = useState('bangkok');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedPopulationGroup, setSelectedPopulationGroup] = useState('informal_workers');
  const [activeTab, setActiveTab] = useState('sdhe-overview');
  const [activeView, setActiveView] = useState('spider'); // 'spider' or 'table'
  
  // Set default district when data loads
  useEffect(() => {
    if (districts.length > 0 && !selectedDistrict) {
      setSelectedDistrict(districts[0]);
    }
  }, [districts, selectedDistrict]);

  // Auto-switch to available district from SDHE data if original districts not available
  useEffect(() => {
    if (!selectedDistrict && getAvailableDistricts) {
      const sdheDistricts = getAvailableDistricts();
      if (sdheDistricts.length > 0) {
        setSelectedDistrict(sdheDistricts[0]);
      }
    }
  }, [selectedDistrict, getAvailableDistricts]);

  // Loading and error states
  const isLoading = isOriginalDataLoading || isSDHELoading || isGeoJsonLoading;
  const error = originalDataError || sdheError || geoJsonError;

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-lg font-medium text-gray-900">Loading Bangkok Health Data</div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Original health indicators:</span>
              <span className={`${isOriginalDataLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                {isOriginalDataLoading ? 'Loading...' : '✓ Loaded'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">SDHE processing:</span>
              <span className={`${isSDHELoading ? 'text-yellow-600' : 'text-green-600'}`}>
                {isSDHELoading ? processingStatus || 'Processing...' : '✓ Completed'}
              </span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">District maps:</span>
              <span className={`${isGeoJsonLoading ? 'text-yellow-600' : 'text-green-600'}`}>
                {isGeoJsonLoading ? 'Loading...' : '✓ Loaded'}
              </span>
            </div>
          </div>
          
          {processingStatus && (
            <div className="mt-4 text-xs text-gray-500 bg-gray-50 p-2 rounded">
              Status: {processingStatus.replace('_', ' ')}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Data Loading Error</h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Retry Loading
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Get basic health behaviors data for backward compatibility
  const getHealthBehaviorsData = () => {
    if (!years || years.length === 0) return {};
    
    const currentYear = Math.max(...years);
    
    if (analysisLevel === 'bangkok') {
      // Use SDHE data if available, otherwise fall back to original calculation
      if (sdheData && getDomainScore) {
        const alcoholScore = getDomainScore('health_behaviors', selectedPopulationGroup);
        const smokingScore = getDomainScore('health_behaviors', selectedPopulationGroup);
        const obesityScore = getDomainScore('health_behaviors', selectedPopulationGroup);
        
        return {
          'Alcohol Drinking Rate': `${(100 - alcoholScore).toFixed(1)}%`,
          'Smoking Rate': `${(100 - smokingScore).toFixed(1)}%`,
          'Obesity Rate': `${(100 - obesityScore).toFixed(1)}%`,
          'Traffic Death Rate': 'See SDHE Analysis'
        };
      }
    }
    
    // Fall back to original data calculation
    const drinkRate = drinkRateData.find(d => d.dname === selectedDistrict && d.year === currentYear)?.value || 0;
    const smokeRate = smokeRateData.find(d => d.dname === selectedDistrict && d.year === currentYear)?.value || 0;
    const obeseRate = obeseRateData.find(d => d.dname === selectedDistrict && d.year === currentYear)?.value || 0;
    const trafficRate = trafficDeathRateData.find(d => d.dname === selectedDistrict && d.year === currentYear)?.value || 0;
    
    return {
      'Alcohol Drinking Rate': `${drinkRate.toFixed(1)}%`,
      'Smoking Rate': `${smokeRate.toFixed(1)}%`,
      'Obesity Rate': `${obeseRate.toFixed(1)}%`,
      'Traffic Death Rate': `${trafficRate.toFixed(1)} per 100k`
    };
  };

  const healthBehaviorsData = getHealthBehaviorsData();

  // Render main content based on active view
  const renderMainContent = () => {
    if (activeView === 'table') {
      return (
        <SDHEIndicatorsTable
          selectedPopulationGroup={selectedPopulationGroup}
          selectedDistrict={selectedDistrict}
          analysisLevel={analysisLevel}
          getIndicatorTableData={getIndicatorTableData}
          getAvailableDomains={getAvailableDomains}
          sdheData={sdheData}
        />
      );
    }

    return (
      <EnhancedSDHESpiderChart 
        analysisLevel={analysisLevel}
        selectedDistrict={selectedDistrict}
        selectedPopulationGroup={selectedPopulationGroup}
        sdheData={sdheData}
        getSpiderChartData={getSpiderChartData}
        getEquityGaps={getEquityGaps}
        getVulnerabilityIndex={getVulnerabilityIndex}
      />
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header indicatorName="Bangkok Health Inequalities Dashboard - SDHE Analysis" />
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Enhanced District Selection with SDHE Status */}
        <DistrictSelector 
          districts={districts.length > 0 ? districts : (getAvailableDistricts ? getAvailableDistricts() : [])}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedPopulationGroup={selectedPopulationGroup}
          setSelectedPopulationGroup={setSelectedPopulationGroup}
          analysisLevel={analysisLevel}
          setAnalysisLevel={setAnalysisLevel}
        />

        {/* SDHE Data Status Indicator */}
        {sdheData && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <h4 className="font-medium text-green-800">SDHE Analysis Ready</h4>
                <p className="text-sm text-green-700">
                  {getPopulationGroupStats ? getPopulationGroupStats().total_responses.toLocaleString() : 0} survey responses processed across {getAvailableDomains ? getAvailableDomains().length : 0} health equity domains
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Left Panel */}
          <LeftPanel 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            analysisLevel={analysisLevel}
            selectedDistrict={selectedDistrict}
            selectedPopulationGroup={selectedPopulationGroup}
            healthBehaviorsData={healthBehaviorsData}
            districtGeoJson={districtGeoJson}
            populationGroupData={[]} // Legacy data
            allRateData={{
              drinkRateData,
              smokeRateData,
              obeseRateData,
              trafficDeathRateData
            }}
            // New SDHE data props
            sdheData={sdheData}
            getPopulationGroupStats={getPopulationGroupStats}
            getVulnerabilityIndex={getVulnerabilityIndex}
            getEquityGaps={getEquityGaps}
          />

          {/* Main Analysis Area */}
          <div className="lg:col-span-2">
            {/* View Selector */}
            <div className="mb-6 flex items-center justify-between">
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
                <button
                  onClick={() => setActiveView('spider')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'spider'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📊 Spider Chart
                </button>
                <button
                  onClick={() => setActiveView('table')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeView === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  📋 Indicators Table
                </button>
              </div>

              {/* Data Status */}
              <div className="text-sm text-gray-600">
                {sdheData ? (
                  <span className="text-green-600 font-medium">✓ SDHE Data Active</span>
                ) : (
                  <span className="text-yellow-600">⚠ Using Legacy Data</span>
                )}
              </div>
            </div>

            {/* Main Content */}
            {renderMainContent()}
          </div>
        </div>
      </div>
      
      <Footer indicatorName="Bangkok Health Inequalities Dashboard - SDHE" />
    </div>
  );
};

export default EnhancedDashboard;