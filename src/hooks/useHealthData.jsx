import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function useHealthData() {
  // Data state for all indicators
  const [drinkRateData, setDrinkRateData] = useState([]);
  const [drinkRateBySexData, setDrinkRateBySexData] = useState([]);
  const [smokeRateData, setSmokeRateData] = useState([]);
  const [smokeRateBySexData, setSmokeRateBySexData] = useState([]);
  const [trafficDeathRateData, setTrafficDeathRateData] = useState([]);
  
  // Indicator metadata
  const [indicatorsWithSexData, setIndicatorsWithSexData] = useState(['drink_rate', 'smoke_rate']);
  
  // Shared metadata
  const [districts, setDistricts] = useState([]);
  const [years, setYears] = useState([]);
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
        
        // Set data in state
        setDrinkRateData(parsedDrinkRate.data);
        setDrinkRateBySexData(parsedDrinkRateBySex.data);
        setSmokeRateData(parsedSmokeRate.data);
        setSmokeRateBySexData(parsedSmokeRateBySex.data);
        setTrafficDeathRateData(parsedTrafficDeathRate.data);
        
        // Extract unique values from all datasets
        const allRateData = [
          ...parsedDrinkRate.data, 
          ...parsedSmokeRate.data,
          ...parsedTrafficDeathRate.data
        ];
        const uniqueDistricts = [...new Set(allRateData.map(row => row.dname))];
        const uniqueYears = [...new Set(allRateData.map(row => row.year))];
        
        const allRateBySexData = [...parsedDrinkRateBySex.data, ...parsedSmokeRateBySex.data];
        const uniqueSexes = [...new Set(allRateBySexData.map(row => row.sex))];
        
        setDistricts(uniqueDistricts.sort());
        setYears(uniqueYears.sort());
        setSexes(uniqueSexes);
        
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
    districts, 
    years, 
    sexes,
    indicatorsWithSexData,
    isLoading,
    error
  };
}