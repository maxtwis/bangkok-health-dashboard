// Optimized SDHE Data Hook with better performance and error handling
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import DataProcessor from '../utils/DataProcessor';

const useSDHEData = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [surveyData, setSurveyData] = useState(null);
  const [healthFacilitiesData, setHealthFacilitiesData] = useState(null);
  const processorRef = useRef(null);
  const retryCountRef = useRef(0);
  const maxRetries = 3;

  // Memoized load data function with retry logic
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Try to load survey data with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch('/data/survey_sampling.csv', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Could not load survey data. Please ensure survey_sampling.csv is in /public/data/ folder.`);
      }
      
      const csvContent = await response.text();
      
      if (!csvContent.trim()) {
        throw new Error('Survey data file is empty or corrupted.');
      }
      
      // Process with SDHE processor
      const processor = new DataProcessor();
      processorRef.current = processor;
      
      const results = await processor.processSurveyData(csvContent);
      
      if (!results || Object.keys(results).length === 0) {
        throw new Error('No data processed from survey file.');
      }
      
      setData(results);
      setSurveyData(processor.surveyData);
      setHealthFacilitiesData(processor.healthFacilitiesData);
      retryCountRef.current = 0; // Reset retry count on success
      
    } catch (err) {
      console.error('Data loading error:', err);
      
      if (err.name === 'AbortError') {
        setError('Request timed out. Please check your connection and try again.');
      } else if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        setTimeout(() => loadData(), 1000 * retryCountRef.current); // Exponential backoff
        return;
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  }, [maxRetries]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Memoized getter functions to prevent unnecessary re-renders
  const getAvailableDistricts = useCallback(() => {
    return processorRef.current ? processorRef.current.getAvailableDistricts() : [];
  }, [data]);

  const getAvailableDomains = useCallback(() => {
    return processorRef.current ? processorRef.current.getAvailableDomains() : [];
  }, [data]);

  const getIndicatorData = useCallback((domain, district, populationGroup) => {
    return processorRef.current ? 
      processorRef.current.getIndicatorData(domain, district, populationGroup) : [];
  }, [data]);

  // Retry function for manual retry
  const retry = useCallback(() => {
    retryCountRef.current = 0;
    loadData();
  }, [loadData]);

  return {
    isLoading,
    error,
    data,
    surveyData,
    healthFacilitiesData,
    getAvailableDistricts,
    getAvailableDomains,
    getIndicatorData,
    retry,
    hasData: !!data && !isLoading && !error
  };
};

export default useSDHEData;