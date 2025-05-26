// Modified useHealthData.jsx to track years for each indicator
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function useHealthData() {
  // Data state for all indicators
  const [drinkRateData, setDrinkRateData] = useState([]);
  const [drinkRateBySexData, setDrinkRateBySexData] = useState([]);
  const [smokeRateData, setSmokeRateData] = useState([]);
  const [smokeRateBySexData, setSmokeRateBySexData] = useState([]);
  const [trafficDeathRateData, setTrafficDeathRateData] = useState([]);
  const [obeseRateData, setObeseRateData] = useState([]);
  const [obeseRateBySexData, setObeseRateBySexData] = useState([]);
  
  // Indicator metadata
  const [indicatorsWithSexData, setIndicatorsWithSexData] = useState([
    'drink_rate', 
    'smoke_rate', 
    'obese_rate'
  ]);
  
  // Years available for each indicator
  const [indicatorYears, setIndicatorYears] = useState({});
  
  // Shared metadata
  const [districts, setDistricts] = useState([]);
  const [years, setYears] = useState([]); // All years across all indicators
  const [sexes, setSexes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load all datasets
        const drinkRateResponse = await fetch('/data/drink_rate_66_68.csv').then(response => response.text());
        const drinkRateBySexResponse = await fetch('/data/drink_rate_by_sex_66_68.csv').then(response => response.text());
        const smokeRateResponse = await fetch('/data/smoke_rate_66_68.csv').then(response => response.text());
        const smokeRateBySexResponse = await fetch('/data/smoke_rate_by_sex_66_68.csv').then(response => response.text());
        const trafficDeathRateResponse = await fetch('/data/traffic_death_rate_all_62_66.csv').then(response => response.text());
        const obeseRateResponse = await fetch('/data/obese_rate_66_68.csv').then(response => response.text());
        const obeseRateBySexResponse = await fetch('/data/obese_rate_by_sex_66_68.csv').then(response => response.text());
        
        // Parse all datasets
        const parsedDrinkRate = Papa.parse(drinkRateResponse, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        const parsedDrinkRateBySex = Papa.parse(drinkRateBySexResponse, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        const parsedSmokeRate = Papa.parse(smokeRateResponse, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        const parsedSmokeRateBySex = Papa.parse(smokeRateBySexResponse, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        const parsedTrafficDeathRate = Papa.parse(trafficDeathRateResponse, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        const parsedObeseRate = Papa.parse(obeseRateResponse, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        const parsedObeseRateBySex = Papa.parse(obeseRateBySexResponse, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        // Set data in state
        setDrinkRateData(parsedDrinkRate.data);
        setDrinkRateBySexData(parsedDrinkRateBySex.data);
        setSmokeRateData(parsedSmokeRate.data);
        setSmokeRateBySexData(parsedSmokeRateBySex.data);
        setTrafficDeathRateData(parsedTrafficDeathRate.data);
        setObeseRateData(parsedObeseRate.data);
        setObeseRateBySexData(parsedObeseRateBySex.data);
        
        // Extract years for each indicator
        const drinkRateYears = [...new Set(parsedDrinkRate.data.map(row => row.year))].sort();
        const smokeRateYears = [...new Set(parsedSmokeRate.data.map(row => row.year))].sort();
        const trafficDeathRateYears = [...new Set(parsedTrafficDeathRate.data.map(row => row.year))].sort();
        const obeseRateYears = [...new Set(parsedObeseRate.data.map(row => row.year))].sort();
        
        // Create indicator-specific years mapping
        const yearsByIndicator = {
          'drink_rate': drinkRateYears,
          'smoke_rate': smokeRateYears,
          'traffic_death_rate': trafficDeathRateYears,
          'obese_rate': obeseRateYears
        };
        
        setIndicatorYears(yearsByIndicator);
        
        // Extract unique values from all datasets
        const allRateData = [
          ...parsedDrinkRate.data, 
          ...parsedSmokeRate.data,
          ...parsedTrafficDeathRate.data,
          ...parsedObeseRate.data
        ];
        const uniqueDistricts = [...new Set(allRateData.map(row => row.dname))];
        const uniqueYears = [...new Set(allRateData.map(row => row.year))];
        
        const allRateBySexData = [
          ...parsedDrinkRateBySex.data, 
          ...parsedSmokeRateBySex.data,
          ...parsedObeseRateBySex.data
        ];
        const uniqueSexes = [...new Set(allRateBySexData.map(row => row.sex))];
        
        setDistricts(uniqueDistricts.sort());
        setYears(uniqueYears.sort());
        setSexes(uniqueSexes);
        
        console.log('Years by indicator:', yearsByIndicator);
        
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load data. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  return { 
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
    isLoading,
    error
  };
}