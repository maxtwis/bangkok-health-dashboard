import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function useHealthData() {
  // Data state for both indicators
  const [drinkRateData, setDrinkRateData] = useState([]);
  const [drinkRateBySexData, setDrinkRateBySexData] = useState([]);
  const [smokeRateData, setSmokeRateData] = useState([]);
  const [smokeRateBySexData, setSmokeRateBySexData] = useState([]);
  
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
        
        // Load drink rate data
        const drinkRateResponse = await fetch('/data/drink_rate_66_68.csv').then(response => response.text());
        const parsedDrinkRate = Papa.parse(drinkRateResponse, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        // Load drink rate by sex data
        const drinkRateBySexResponse = await fetch('/data/drink_rate_by_sex_66_68.csv').then(response => response.text());
        const parsedDrinkRateBySex = Papa.parse(drinkRateBySexResponse, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        // Load smoke rate data
        const smokeRateResponse = await fetch('/data/smoke_rate_66_68.csv').then(response => response.text());
        const parsedSmokeRate = Papa.parse(smokeRateResponse, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        // Load smoke rate by sex data
        const smokeRateBySexResponse = await fetch('/data/smoke_rate_by_sex_66_68.csv').then(response => response.text());
        const parsedSmokeRateBySex = Papa.parse(smokeRateBySexResponse, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        
        // Set data
        setDrinkRateData(parsedDrinkRate.data);
        setDrinkRateBySexData(parsedDrinkRateBySex.data);
        setSmokeRateData(parsedSmokeRate.data);
        setSmokeRateBySexData(parsedSmokeRateBySex.data);
        
        // Extract unique values
        // Combine both datasets to ensure we get all districts and years
        const allRateData = [...parsedDrinkRate.data, ...parsedSmokeRate.data];
        const uniqueDistricts = [...new Set(allRateData.map(row => row.dname))];
        const uniqueYears = [...new Set(allRateData.map(row => row.year))];
        
        // Combine both sex datasets to ensure we get all sex categories
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
    districts, 
    years, 
    sexes,
    isLoading,
    error
  };
}