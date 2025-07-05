// Enhanced Dashboard component with Population Group features
import React, { useState, useEffect } from 'react';
import useHealthData from '../../hooks/useHealthData';
import useGeoJsonData from '../../hooks/useGeoJsonData';
import Header from '../common/Header';
import Footer from '../common/Footer';
import EnhancedDistrictSelector from './EnhancedDistrictSelector';
import LeftPanel from './LeftPanel';
import EnhancedSpiderChart from './EnhancedSpiderChart';
import PopulationGroupsTab from './Tabs/PopulationGroupsTab';
import { 
  getFilteredData, 
  getSexFilteredData, 
  prepareSexComparisonData,
  getPopulationFilteredData, 
  preparePopulationComparisonData,
  getSummaryData,
  // New functions for population group analysis
  preparePopulationGroupSpiderData,
  calculateVulnerabilityIndex,
  getEquityInsights
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
  
  // Enhanced state for new comparison features
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [comparisonType, setComparisonType] = useState('district'); // 'district' or 'population'
  const [comparisonDistrict, setComparisonDistrict] = useState('');
  const [selectedPopulationGroup, setSelectedPopulationGroup] = useState('informal_workers');
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

  // Calculate Health Behaviors domain score from your existing data
  const calculateHealthBehaviorsScore = (district) => {
    const currentYear = Math.max(...years);
    
    // Get latest data for each indicator for the district
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

  // Generate sample population group data (replace with actual data when available)
  const generatePopulationGroupData = () => {
    const populationGroups = ['informal_workers', 'elderly', 'disabled', 'lgbtq'];
    const indicators = ['drink_rate', 'smoke_rate', 'obese_rate', 'traffic_death_rate'];
    const currentYear = Math.max(...years);
    
    const data = [];
    
    districts.forEach(district => {
      populationGroups.forEach(group => {
        indicators.forEach(indicator => {
          // Get baseline value for the district
          let baseValue;
          switch(indicator) {
            case 'drink_rate':
              baseValue = drinkRateData.find(d => d.dname === district && d.year === currentYear)?.value || 15;
              break;
            case 'smoke_rate':
              baseValue = smokeRateData.find(d => d.dname === district && d.year === currentYear)?.value || 10;
              break;
            case 'obese_rate':
              baseValue = obeseRateData.find(d => d.dname === district && d.year === currentYear)?.value || 20;
              break;
            case 'traffic_death_rate':
              baseValue = trafficDeathRateData.find(d => d.dname === district && d.year === currentYear)?.value || 8;
              break;
            default:
              baseValue = 15;
          }
          
          // Add variation based on population group (simulating disparities)
          let multiplier = 1;
          switch(group) {
            case 'informal_workers':
              multiplier = indicator === 'drink_rate' ? 1.3 : indicator === 'smoke_rate' ? 1.5 : 1.2;
              break;
            case 'elderly':
              multiplier = indicator === 'drink_rate' ? 0.7 : indicator === 'obese_rate' ? 1.4 : 1.1;
              break;
            case 'disabled':
              multiplier = indicator === 'obese_rate' ? 1.3 : 1.2;
              break;
            case 'lgbtq':
              multiplier = indicator === 'smoke_rate' ? 1.4 : 1.1;
              break;
          }
          
          data.push({
            dname: district,
            population_group: group,
            indicator: indicator,
            year: currentYear,
            value: Math.max(0, baseValue * multiplier)
          });
        });
      });
    });
    
    return data;
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
    const populationGroupData = generatePopulationGroupData();
    const overallPopulationData = []; // This would be your overall district data
    
    // Transform your existing district data to match the expected format
    const currentYear = Math.max(...years);
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

  // Calculate most similar districts
  const getMostSimilarDistricts = (district) => {
    if (!district || districts.length === 0) return [];
    
    const targetScore = calculateHealthBehaviorsScore(district);
    
    const similarities = districts
      .filter(d => d !== district)
      .map(d => {
        const score = calculateHealthBehaviorsScore(d);
        const similarity = 100 - Math.abs(targetScore - score);
        return { district: d, similarity: Math.max(0, similarity) };
      })
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);
    
    return similarities;
  };

  const isLoading = isDataLoading || isGeoJsonLoading;
  const error = dataError || geoJsonError;

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading data...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  const districtSpiderData = getDistrictSpiderChartData();
  const populationGroupSpiderData = getPopulationGroupSpiderChartData();
  const healthBehaviorsData = selectedDistrict ? getHealthBehaviorsData(selectedDistrict) : {};
  const similarDistricts = selectedDistrict ? getMostSimilarDistricts(selectedDistrict) : [];
  const populationGroupData = generatePopulationGroupData();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header indicatorName="Social Determinants of Health Equity" />
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Enhanced District Selection */}
        <EnhancedDistrictSelector 
          districts={districts}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          comparisonType={comparisonType}
          setComparisonType={setComparisonType}
          comparisonDistrict={comparisonDistrict}
          setComparisonDistrict={setComparisonDistrict}
          selectedPopulationGroup={selectedPopulationGroup}
          setSelectedPopulationGroup={setSelectedPopulationGroup}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Left Panel */}
          <LeftPanel 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedDistrict={selectedDistrict}
            comparisonDistrict={comparisonDistrict}
            comparisonType={comparisonType}
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

          {/* Enhanced Spider Chart */}
          <div className="lg:col-span-2">
            <EnhancedSpiderChart 
              spiderData={districtSpiderData}
              populationGroupSpiderData={populationGroupSpiderData}
              selectedDistrict={selectedDistrict}
              comparisonDistrict={comparisonDistrict}
              comparisonType={comparisonType}
              selectedPopulationGroup={selectedPopulationGroup}
            />
          </div>
        </div>
      </div>
      
      <Footer indicatorName="Social Determinants of Health Equity" />
    </div>
  );
};

export default Dashboard;