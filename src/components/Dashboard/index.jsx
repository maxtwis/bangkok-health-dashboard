// Updated Dashboard component with SDHE design
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
  getSummaryData 
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
  
  // State for district selection
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [comparisonDistrict, setComparisonDistrict] = useState('');
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
    // Normalize each indicator to 0-100 scale where 100 is best health
    const drinkScore = Math.max(0, 100 - (drinkRate * 2)); // Assuming 50% would be 0 score
    const smokeScore = Math.max(0, 100 - (smokeRate * 3)); // Assuming 33% would be 0 score
    const obeseScore = Math.max(0, 100 - (obeseRate * 2)); // Assuming 50% would be 0 score
    const trafficScore = Math.max(0, 100 - (trafficRate * 5)); // Assuming 20 per 100k would be 0 score
    
    // Average the scores
    const healthBehaviorsScore = (drinkScore + smokeScore + obeseScore + trafficScore) / 4;
    
    return Math.max(0, Math.min(100, healthBehaviorsScore)); // Ensure 0-100 range
  };

  // Get spider chart data
  const getSpiderChartData = () => {
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
        [selectedDistrict]: 0, // No data available
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

  // Calculate most similar districts (simplified - based on health behaviors similarity)
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

  const spiderData = getSpiderChartData();
  const healthBehaviorsData = selectedDistrict ? getHealthBehaviorsData(selectedDistrict) : {};
  const similarDistricts = selectedDistrict ? getMostSimilarDistricts(selectedDistrict) : [];

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
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel */}
          <LeftPanel 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedDistrict={selectedDistrict}
            comparisonDistrict={comparisonDistrict}
            healthBehaviorsData={healthBehaviorsData}
            similarDistricts={similarDistricts}
            districtGeoJson={districtGeoJson}
            allRateData={{
              drinkRateData,
              smokeRateData,
              obeseRateData,
              trafficDeathRateData
            }}
          />

          {/* Center Panel - Spider Chart */}
          <div className="lg:col-span-2">
            <SpiderChart 
              spiderData={spiderData}
              selectedDistrict={selectedDistrict}
              comparisonDistrict={comparisonDistrict}
            />
          </div>
        </div>
      </div>
      
      <Footer indicatorName="Social Determinants of Health Equity" />
    </div>
  );
};

export default Dashboard;