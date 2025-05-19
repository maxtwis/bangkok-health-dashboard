// src/hooks/useHealthData.jsx
import { useState, useEffect } from 'react';
import Papa from 'papaparse';

export default function useHealthData() {
  const [drinkRateData, setDrinkRateData] = useState([]);
  const [drinkRateBySexData, setDrinkRateBySexData] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [years, setYears] = useState([]);
  const [sexes, setSexes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load overall drink rate data
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
        
        // Set data
        setDrinkRateData(parsedDrinkRate.data);
        setDrinkRateBySexData(parsedDrinkRateBySex.data);
        
        // Extract unique values
        const uniqueDistricts = [...new Set(parsedDrinkRate.data.map(row => row.dname))];
        const uniqueYears = [...new Set(parsedDrinkRate.data.map(row => row.year))];
        const uniqueSexes = [...new Set(parsedDrinkRateBySex.data.map(row => row.sex))];
        
        setDistricts(uniqueDistricts);
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
    districts, 
    years, 
    sexes,
    isLoading,
    error
  };
}