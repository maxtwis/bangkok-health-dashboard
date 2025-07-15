// useBasicSDHEData Hook - src/hooks/useBasicSDHEData.js
import { useState, useEffect, useRef } from 'react';
import BasicSDHEProcessor from '../utils/BasicSDHEProcessor';

const useBasicSDHEData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const processorRef = useRef(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load survey data
        const response = await fetch('/data/survey_sampling.csv');
        if (!response.ok) {
          throw new Error('Could not load survey data. Please ensure survey_sampling.csv is in /public/data/ folder.');
        }
        
        const csvContent = await response.text();
        
        // Process with SDHE processor
        const processor = new BasicSDHEProcessor();
        processorRef.current = processor;
        
        const results = await processor.processSurveyData(csvContent);
        setData(results);
        
      } catch (err) {
        console.error('Error loading SDHE data:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const getAvailableDistricts = () => {
    return processorRef.current ? processorRef.current.getAvailableDistricts() : [];
  };

  const getAvailableDomains = () => {
    return processorRef.current ? processorRef.current.getAvailableDomains() : [];
  };

  const getIndicatorData = (domain, district, populationGroup) => {
    return processorRef.current ? 
      processorRef.current.getIndicatorData(domain, district, populationGroup) : [];
  };

  return {
    isLoading,
    error,
    data,
    getAvailableDistricts,
    getAvailableDomains,
    getIndicatorData
  };
};

export default useBasicSDHEData;