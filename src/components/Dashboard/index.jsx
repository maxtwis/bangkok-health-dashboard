// Updated Dashboard component with separated district and population comparisons
import React, { useState, useEffect } from 'react';
import useHealthData from '../../hooks/useHealthData';
import useGeoJsonData from '../../hooks/useGeoJsonData';
import Header from '../common/Header';
import Footer from '../common/Footer';
import DistrictSelector from './DistrictSelector';
import LeftPanel from './LeftPanel';
import SpiderChart from './SpiderChart';
import { 
  getFilteredData, 
  getSexFilteredData, 
  prepareSexComparisonData,
  getPopulationFilteredData, 
  preparePopulationComparisonData,
  getSummaryData,
  // Enhanced functions
  preparePopulationGroupSpiderData,
  calculateVulnerabilityIndex,
  getEquityInsights,
  getMostSimilarDistricts,
  generateSamplePopulationGroupData
} from './DataUtils';

const Dashboard = () => {
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
    isLoading: isDataLoading,
    error: dataError
  } = useHealthData();
  
  const {
    districtGeoJson,
    isLoading: isGeoJsonLoading,
    error: geoJsonError
  } = useGeoJsonData();
  
  // Separated state management for both comparison modes
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [comparisonDistrict, setComparisonDistrict] = useState('');
  const [selectedPopulationGroup, setSelectedPopulationGroup] = useState('informal_workers');
  const [viewMode, setViewMode] = useState('district'); // 'district', 'population', or 'both'
  const [activeTab, setActiveTab] = useState('demographics');
  
  // Set default districts when data loads
  useEffect(() => {
    if (districts.length > 0) {
      if (!selectedDistrict) {
        setSelectedDistrict(districts[0]);
      }
      if (!comparisonDistrict) {
        const comparison = districts.find(d => d !== selectedDistrict) || districts[1];
        setComparisonDistrict(comparison);
      }
    }
  }, [districts, selectedDistrict]);

  // Calculate Health Behaviors domain score from existing data
  const calculateHealthBehaviorsScore = (district) => {
    const currentYear = Math.max(...years);
    
    const drinkRate = drinkRateData.find(d => d.dname === district && d.year === currentYear)?.value || 0;
    const smokeRate = smokeRateData.find(d => d.dname === district && d.year === currentYear)?.value || 0;
    const obeseRate = obeseRateData.find(d => d.dname === district && d.year === currentYear)?.value || 0;
    const trafficRate = trafficDeathRateData.find(d => d.dname === district && d.year === currentYear)?.value || 0;
    
    // Convert to scores (lower rates = higher scores for health behaviors)
    const drinkScore = Math.max(0, 100 - (drinkRate * 2));
    const smokeScore = Math.max(0, 100 - (smokeRate * 3));
    const obeseScore = Math.max(0, 100 - (obeseRate * 2));
    const trafficScore = Math.max(0, 100 - (trafficRate * 5));
    
    const healthBehaviorsScore = (drinkScore + smokeScore + obeseScore + trafficScore) / 4;
    return Math.max(0, Math.min(100, healthBehaviorsScore));
  };

  // Get spider chart data for district comparison
  const getDistrictSpiderChartData = () => {
    if (!selectedDistrict || !comparisonDistrict) return [];
    
    const selectedScore = calculateHealthBehaviorsScore(selectedDistrict);
    const comparisonScore = calculateHealthBehaviorsScore(comparisonDistrict);
    
    return [
      { 
        domain: 'Health Behaviors', 
        fullMark: 100, 
        [selectedDistrict]: selectedScore,
        [comparisonDistrict]: comparisonScore
      },
      { 
        domain: 'Education', 
        fullMark: 100, 
        [selectedDistrict]: 0,
        [comparisonDistrict]: 0
      },
      { 
        domain: 'Economic Stability', 
        fullMark: 100, 
        [selectedDistrict]: 0,
        [comparisonDistrict]: 0
      },
      { 
        domain: 'Healthcare Access', 
        fullMark: 100, 
        [selectedDistrict]: 0,
        [comparisonDistrict]: 0
      },
      { 
        domain: 'Neighborhood Environment', 
        fullMark: 100, 
        [selectedDistrict]: 0,
        [comparisonDistrict]: 0
      },
      { 
        domain: 'Community Context', 
        fullMark: 100, 
        [selectedDistrict]: 0,
        [comparisonDistrict]: 0
      }
    ];
  };

  // Get spider chart data for population group comparison
  const getPopulationGroupSpiderChartData = () => {
    const populationGroupData = generateSamplePopulationGroupData(districts, {
      drinkRateData,
      smokeRateData,
      obeseRateData,
      trafficDeathRateData
    });
    
    // Transform existing district data to match the expected format
    const currentYear = Math.max(...years);
    const overallPopulationData = [];
    
    ['drink_rate', 'smoke_rate', 'obese_rate', 'traffic_death_rate'].forEach(indicator => {
      let value;
      switch(indicator) {
        case 'drink_rate':
          value = drinkRateData.find(d => d.dname === selectedDistrict && d.year === currentYear)?.value || 0;
          break;
        case 'smoke_rate':
          value = smokeRateData.find(d => d.dname === selectedDistrict && d.year === currentYear)?.value || 0;
          break;
        case 'obese_rate':
          value = obeseRateData.find(d => d.dname === selectedDistrict && d.year === currentYear)?.value || 0;
          break;
        case 'traffic_death_rate':
          value = trafficDeathRateData.find(d => d.dname === selectedDistrict && d.year === currentYear)?.value || 0;
          break;
      }
      
      overallPopulationData.push({
        dname: selectedDistrict,
        indicator: indicator,
        year: currentYear,
        value: value
      });
    });

    return preparePopulationGroupSpiderData(
      populationGroupData,
      overallPopulationData,
      selectedDistrict,
      selectedPopulationGroup
    );
  };

  // Get health behaviors data for selected district
  const getHealthBehaviorsData = (district) => {
    const currentYear = Math.max(...years);
    
    const drinkRate = drinkRateData.find(d => d.dname === district && d.year === currentYear)?.value || 0;
    const smokeRate = smokeRateData.find(d => d.dname === district && d.year === currentYear)?.value || 0;
    const obeseRate = obeseRateData.find(d => d.dname === district && d.year === currentYear)?.value || 0;
    const trafficRate = trafficDeathRateData.find(d => d.dname === district && d.year === currentYear)?.value || 0;
    
    return {
      'Alcohol Drinking Rate': `${drinkRate.toFixed(1)}%`,
      'Smoking Rate': `${smokeRate.toFixed(1)}%`,
      'Obesity Rate': `${obeseRate.toFixed(1)}%`,
      'Traffic Death Rate': `${trafficRate.toFixed(1)} per 100k`
    };
  };

  // Calculate most similar districts using the enhanced function
  const similarDistricts = selectedDistrict ? getMostSimilarDistricts(
    selectedDistrict,
    districts,
    { drinkRateData, smokeRateData, obeseRateData, trafficDeathRateData },
    3
  ) : [];

  const isLoading = isDataLoading || isGeoJsonLoading;
  const error = dataError || geoJsonError;

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading data...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  const districtSpiderData = getDistrictSpiderChartData();
  const populationGroupSpiderData = getPopulationGroupSpiderChartData();
  const healthBehaviorsData = selectedDistrict ? getHealthBehaviorsData(selectedDistrict) : {};
  const populationGroupData = generateSamplePopulationGroupData(districts, {
    drinkRateData,
    smokeRateData,
    obeseRateData,
    trafficDeathRateData
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header indicatorName="Social Determinants of Health Equity" />
      
      <div className="max-w-7xl mx-auto p-4">
        {/* District Selection */}
        <DistrictSelector 
          districts={districts}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          comparisonDistrict={comparisonDistrict}
          setComparisonDistrict={setComparisonDistrict}
          selectedPopulationGroup={selectedPopulationGroup}
          setSelectedPopulationGroup={setSelectedPopulationGroup}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel with Mode Support */}
          <LeftPanel 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            viewMode={viewMode}
            selectedDistrict={selectedDistrict}
            comparisonDistrict={comparisonDistrict}
            selectedPopulationGroup={selectedPopulationGroup}
            healthBehaviorsData={healthBehaviorsData}
            similarDistricts={similarDistricts}
            districtGeoJson={districtGeoJson}
            populationGroupData={populationGroupData}
            allRateData={{
              drinkRateData,
              smokeRateData,
              obeseRateData,
              trafficDeathRateData
            }}
          />

          {/* Spider Chart */}
          <div className="lg:col-span-2">
            <SpiderChart 
              spiderData={districtSpiderData}
              populationGroupSpiderData={populationGroupSpiderData}
              selectedDistrict={selectedDistrict}
              comparisonDistrict={comparisonDistrict}
              selectedPopulationGroup={selectedPopulationGroup}
              viewMode={viewMode}
            />
          </div>
        </div>
      </div>
      
      <Footer indicatorName="Social Determinants of Health Equity" />
    </div>
  );
};

export default Dashboard;