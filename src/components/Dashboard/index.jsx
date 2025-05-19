import React, { useState, useEffect } from 'react';
import useHealthData from '../../hooks/useHealthData';
import useGeoJsonData from '../../hooks/useGeoJsonData';
import FilterPanel from './FilterPanel';
import ChartsTab from './Tabs/ChartsTab';
import MapTab from './Tabs/MapTab';
import DataTablesTab from './Tabs/DataTablesTab';
import SummaryTab from './Tabs/SummaryTab';
import DefinitionsTab from './Tabs/DefinitionsTab';
import PopulationComparisonTab from './Tabs/PopulationComparisonTab';
import Header from '../common/Header';
import Footer from '../common/Footer';
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
    districts,
    years,
    sexes,
    isLoading: isDataLoading,
    error: dataError
  } = useHealthData();
  
  const {
    districtGeoJson,
    isLoading: isGeoJsonLoading,
    error: geoJsonError
  } = useGeoJsonData();
  
  // Define population groups since we don't have actual data yet
  const populationGroups = ['general', 'elderly', 'disabled', 'lgbtq', 'informal'];
  
  // State for filters
  const [selectedIndicator, setSelectedIndicator] = useState('drink_rate');
  const [selectedGeographyType, setSelectedGeographyType] = useState('district');
  const [selectedArea, setSelectedArea] = useState('');
  const [selectedTab, setSelectedTab] = useState('charts');
  
  // Set default district when data loads
  useEffect(() => {
    if (districts.length > 0 && !selectedArea) {
      setSelectedArea(districts[0]);
    }
  }, [districts]);

  // Determine which data to use based on selected indicator
  const rateData = selectedIndicator === 'drink_rate' ? drinkRateData : smokeRateData;
  const rateBySexData = selectedIndicator === 'drink_rate' ? drinkRateBySexData : smokeRateBySexData;
  
  // Get indicator name
  const indicatorName = selectedIndicator === 'drink_rate' ? 'Alcohol Drinking Rate' : 'Smoking Rate';

  // Process data based on filters
  const filteredData = getFilteredData(rateData, selectedGeographyType, selectedArea, years);
  const filteredSexData = getSexFilteredData(rateBySexData, selectedGeographyType, selectedArea, years, sexes);
  const sexComparisonData = prepareSexComparisonData(filteredSexData, years, sexes);
  
  // For population comparison data - using sample data until actual data is available
  const populationComparisonData = preparePopulationComparisonData([], years, populationGroups);
  
  const summaryData = getSummaryData(filteredData, selectedArea, indicatorName);
  
  const isLoading = isDataLoading || isGeoJsonLoading;
  const error = dataError || geoJsonError;

  if (isLoading) return <div className="flex justify-center items-center h-screen">Loading data...</div>;
  if (error) return <div className="flex justify-center items-center h-screen text-red-500">{error}</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header indicatorName={indicatorName} />
      
      <div className="flex flex-col md:flex-row flex-1 p-4 gap-4">
        <FilterPanel 
          selectedIndicator={selectedIndicator}
          setSelectedIndicator={setSelectedIndicator}
          selectedGeographyType={selectedGeographyType}
          setSelectedGeographyType={setSelectedGeographyType}
          selectedArea={selectedArea}
          setSelectedArea={setSelectedArea}
          districts={districts}
        />
        
        <div className="flex-1 bg-white rounded shadow-md p-4">
          {/* Tabs */}
          <div className="border-b mb-4">
            <div className="flex flex-wrap">
              <button 
                className={`px-4 py-2 ${selectedTab === 'charts' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setSelectedTab('charts')}
              >
                Charts
              </button>
              <button 
                className={`px-4 py-2 ${selectedTab === 'map' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setSelectedTab('map')}
              >
                Map
              </button>
              <button 
                className={`px-4 py-2 ${selectedTab === 'population' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setSelectedTab('population')}
              >
                Population Groups
              </button>
              <button 
                className={`px-4 py-2 ${selectedTab === 'data' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setSelectedTab('data')}
              >
                Data Tables
              </button>
              <button 
                className={`px-4 py-2 ${selectedTab === 'summary' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setSelectedTab('summary')}
              >
                Summary
              </button>
              <button 
                className={`px-4 py-2 ${selectedTab === 'definitions' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
                onClick={() => setSelectedTab('definitions')}
              >
                Definitions
              </button>
            </div>
          </div>
          
          {/* Content based on selected tab */}
          <div>
            {selectedTab === 'charts' && (
              <ChartsTab 
                filteredData={filteredData}
                sexComparisonData={sexComparisonData}
                selectedIndicator={selectedIndicator}
                indicatorName={indicatorName}
                selectedGeographyType={selectedGeographyType}
                selectedArea={selectedArea}
                years={years}
              />
            )}
            
            {selectedTab === 'map' && (
              <MapTab 
                rateData={rateData}
                districtGeoJson={districtGeoJson}
                selectedIndicator={selectedIndicator}
                indicatorName={indicatorName}
                selectedGeographyType={selectedGeographyType}
                selectedArea={selectedArea}
                years={years}
              />
            )}
            
            {selectedTab === 'population' && (
              <PopulationComparisonTab
                populationComparisonData={populationComparisonData}
                populationData={[]} // This will be replaced with actual data when available
                selectedIndicator={selectedIndicator}
                indicatorName={indicatorName}
                selectedGeographyType={selectedGeographyType}
                selectedArea={selectedArea}
                years={years}
              />
            )}
            
            {selectedTab === 'data' && (
              <DataTablesTab 
                filteredData={filteredData}
                filteredSexData={filteredSexData}
                selectedGeographyType={selectedGeographyType}
                selectedArea={selectedArea}
                indicatorName={indicatorName}
              />
            )}
            
            {selectedTab === 'summary' && (
              <SummaryTab 
                summaryData={summaryData}
                selectedGeographyType={selectedGeographyType}
                selectedArea={selectedArea}
                indicatorName={indicatorName}
              />
            )}
            
            {selectedTab === 'definitions' && (
              <DefinitionsTab 
                selectedIndicator={selectedIndicator}
              />
            )}
          </div>
        </div>
      </div>
      
      <Footer indicatorName={indicatorName} />
    </div>
  );
};

export default Dashboard;