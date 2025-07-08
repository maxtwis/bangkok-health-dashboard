// Bangkok-Focused Dashboard with Population Groups as Main Focus
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
  // Enhanced functions for Bangkok analysis
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
  
  // Updated state management for Bangkok-first approach
  const [analysisLevel, setAnalysisLevel] = useState('bangkok'); // 'bangkok' or 'district'
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedPopulationGroup, setSelectedPopulationGroup] = useState('informal_workers');
  const [activeTab, setActiveTab] = useState('population-equity'); // Start with population equity
  
  // Set default district when data loads
  useEffect(() => {
    if (districts.length > 0 && !selectedDistrict) {
      setSelectedDistrict(districts[0]);
    }
  }, [districts, selectedDistrict]);

  // Calculate Bangkok-wide SDHE scores aggregated from all districts
  const calculateBangkokPopulationScores = () => {
    // This would aggregate data from all 50 districts for each population group
    // For now, using sample calculation based on existing data
    const currentYear = Math.max(...years);
    
    const calculateGroupScore = (populationGroup, indicator) => {
      // In real implementation, this would aggregate from all districts
      // For demo, applying population-specific multipliers to overall Bangkok average
      let bangkokAverage = 0;
      let districtCount = 0;
      
      districts.forEach(district => {
        let districtValue;
        switch(indicator) {
          case 'drink_rate':
            districtValue = drinkRateData.find(d => d.dname === district && d.year === currentYear)?.value;
            break;
          case 'smoke_rate':
            districtValue = smokeRateData.find(d => d.dname === district && d.year === currentYear)?.value;
            break;
          case 'obese_rate':
            districtValue = obeseRateData.find(d => d.dname === district && d.year === currentYear)?.value;
            break;
          case 'traffic_death_rate':
            districtValue = trafficDeathRateData.find(d => d.dname === district && d.year === currentYear)?.value;
            break;
        }
        
        if (districtValue !== undefined) {
          bangkokAverage += districtValue;
          districtCount++;
        }
      });
      
      if (districtCount === 0) return 0;
      bangkokAverage = bangkokAverage / districtCount;
      
      // Apply population group multipliers (simulating disparities)
      let multiplier = 1;
      switch(populationGroup) {
        case 'informal_workers':
          multiplier = indicator === 'drink_rate' ? 1.4 : indicator === 'smoke_rate' ? 1.6 : 1.3;
          break;
        case 'elderly':
          multiplier = indicator === 'drink_rate' ? 0.6 : indicator === 'obese_rate' ? 1.5 : 1.0;
          break;
        case 'disabled':
          multiplier = indicator === 'obese_rate' ? 1.4 : indicator === 'traffic_death_rate' ? 1.2 : 1.1;
          break;
        case 'lgbtq':
          multiplier = indicator === 'smoke_rate' ? 1.5 : indicator === 'drink_rate' ? 1.2 : 1.1;
          break;
      }
      
      return bangkokAverage * multiplier;
    };

    return {
      'informal_workers': {
        drink_rate: calculateGroupScore('informal_workers', 'drink_rate'),
        smoke_rate: calculateGroupScore('informal_workers', 'smoke_rate'),
        obese_rate: calculateGroupScore('informal_workers', 'obese_rate'),
        traffic_death_rate: calculateGroupScore('informal_workers', 'traffic_death_rate')
      },
      'elderly': {
        drink_rate: calculateGroupScore('elderly', 'drink_rate'),
        smoke_rate: calculateGroupScore('elderly', 'smoke_rate'),
        obese_rate: calculateGroupScore('elderly', 'obese_rate'),
        traffic_death_rate: calculateGroupScore('elderly', 'traffic_death_rate')
      },
      'disabled': {
        drink_rate: calculateGroupScore('disabled', 'drink_rate'),
        smoke_rate: calculateGroupScore('disabled', 'smoke_rate'),
        obese_rate: calculateGroupScore('disabled', 'obese_rate'),
        traffic_death_rate: calculateGroupScore('disabled', 'traffic_death_rate')
      },
      'lgbtq': {
        drink_rate: calculateGroupScore('lgbtq', 'drink_rate'),
        smoke_rate: calculateGroupScore('lgbtq', 'smoke_rate'),
        obese_rate: calculateGroupScore('lgbtq', 'obese_rate'),
        traffic_death_rate: calculateGroupScore('lgbtq', 'traffic_death_rate')
      }
    };
  };

  // Get Bangkok overall averages
  const getBangkokOverallAverages = () => {
    const currentYear = Math.max(...years);
    const indicators = ['drink_rate', 'smoke_rate', 'obese_rate', 'traffic_death_rate'];
    const averages = {};
    
    indicators.forEach(indicator => {
      let total = 0;
      let count = 0;
      
      districts.forEach(district => {
        let value;
        switch(indicator) {
          case 'drink_rate':
            value = drinkRateData.find(d => d.dname === district && d.year === currentYear)?.value;
            break;
          case 'smoke_rate':
            value = smokeRateData.find(d => d.dname === district && d.year === currentYear)?.value;
            break;
          case 'obese_rate':
            value = obeseRateData.find(d => d.dname === district && d.year === currentYear)?.value;
            break;
          case 'traffic_death_rate':
            value = trafficDeathRateData.find(d => d.dname === district && d.year === currentYear)?.value;
            break;
        }
        
        if (value !== undefined) {
          total += value;
          count++;
        }
      });
      
      averages[indicator] = count > 0 ? total / count : 0;
    });
    
    return averages;
  };

  // Get health behaviors data for display
  const getHealthBehaviorsData = () => {
    if (analysisLevel === 'bangkok') {
      const bangkokScores = calculateBangkokPopulationScores();
      const groupData = bangkokScores[selectedPopulationGroup];
      
      return {
        'Alcohol Drinking Rate': `${groupData.drink_rate.toFixed(1)}%`,
        'Smoking Rate': `${groupData.smoke_rate.toFixed(1)}%`,
        'Obesity Rate': `${groupData.obese_rate.toFixed(1)}%`,
        'Traffic Death Rate': `${groupData.traffic_death_rate.toFixed(1)} per 100k`
      };
    } else {
      // District-specific data
      const currentYear = Math.max(...years);
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
    }
  };

  // Generate sample population group data for both levels
  const populationGroupData = generateSamplePopulationGroupData(districts, {
    drinkRateData,
    smokeRateData,
    obeseRateData,
    trafficDeathRateData
  });

  const isLoading = isDataLoading || isGeoJsonLoading;
  const error = dataError || geoJsonError;

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading data...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  const healthBehaviorsData = getHealthBehaviorsData();
  const bangkokPopulationScores = calculateBangkokPopulationScores();
  const bangkokOverallAverages = getBangkokOverallAverages();

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header indicatorName="Bangkok Health Inequalities Dashboard" />
      
      <div className="max-w-7xl mx-auto p-4">
        {/* Bangkok-First District Selection */}
        <DistrictSelector 
          districts={districts}
          selectedDistrict={selectedDistrict}
          setSelectedDistrict={setSelectedDistrict}
          selectedPopulationGroup={selectedPopulationGroup}
          setSelectedPopulationGroup={setSelectedPopulationGroup}
          analysisLevel={analysisLevel}
          setAnalysisLevel={setAnalysisLevel}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel with Bangkok/District Modes */}
          <LeftPanel 
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            analysisLevel={analysisLevel}
            selectedDistrict={selectedDistrict}
            selectedPopulationGroup={selectedPopulationGroup}
            healthBehaviorsData={healthBehaviorsData}
            districtGeoJson={districtGeoJson}
            populationGroupData={populationGroupData}
            allRateData={{
              drinkRateData,
              smokeRateData,
              obeseRateData,
              trafficDeathRateData
            }}
          />

          {/* Bangkok-Focused Spider Chart */}
          <div className="lg:col-span-2">
            <SpiderChart 
              analysisLevel={analysisLevel}
              selectedDistrict={selectedDistrict}
              selectedPopulationGroup={selectedPopulationGroup}
              bangkokPopulationData={bangkokPopulationScores}
              districtData={null} // Will be populated with district-specific data
              allRateData={{
                drinkRateData,
                smokeRateData,
                obeseRateData,
                trafficDeathRateData
              }}
            />
          </div>
        </div>
      </div>
      
      <Footer indicatorName="Bangkok Health Inequalities Dashboard" />
    </div>
  );
};

export default Dashboard;