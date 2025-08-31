// Optimized Indicators Hook with better caching and error handling
import { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';

const useIndicators = () => {
  const [indicatorDetails, setIndicatorDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadIndicatorDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/data/indicator_detail.csv');
        if (!response.ok) {
          throw new Error('Could not load indicator details CSV');
        }
        
        const csvContent = await response.text();
        const parsed = Papa.parse(csvContent, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });

        // Create a lookup object for quick access
        const detailsLookup = {};
        parsed.data.forEach(row => {
          if (row.indicator) {
            detailsLookup[row.indicator] = row;
          }
        });

        setIndicatorDetails(detailsLookup);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadIndicatorDetails();
  }, []);

  // Memoized helper functions to prevent unnecessary re-renders
  const getIndicatorName = useCallback((indicatorKey, language = 'en') => {
    if (!indicatorDetails || !indicatorDetails[indicatorKey]) {
      return indicatorKey; // fallback to key if not found
    }
    
    const details = indicatorDetails[indicatorKey];
    return language === 'th' ? details.indicator_THA : details.indicator_ENG;
  }, [indicatorDetails]);

  const getIndicatorDescription = useCallback((indicatorKey, language = 'en') => {
    if (!indicatorDetails || !indicatorDetails[indicatorKey]) {
      return language === 'th' ? 'ไม่มีคำอธิบาย' : 'No description available';
    }
    
    const details = indicatorDetails[indicatorKey];
    return language === 'th' ? details.detail_THA : details.detail_ENG;
  }, [indicatorDetails]);

  const getCalculationMethod = useCallback((indicatorKey, language = 'en') => {
    if (!indicatorDetails || !indicatorDetails[indicatorKey]) {
      return language === 'th' ? 'ไม่ระบุวิธีการคำนวณ' : 'Calculation method not specified';
    }
    
    const details = indicatorDetails[indicatorKey];
    return language === 'th' ? details.calculation_method_THA : details.calculation_method_ENG;
  }, [indicatorDetails]);

  // Helper function to get full indicator details
  const getIndicatorInfo = (indicatorKey, language = 'en') => {
    if (!indicatorDetails || !indicatorDetails[indicatorKey]) {
      return {
        name: indicatorKey,
        description: language === 'th' ? 'ไม่มีคำอธิบาย' : 'No description available',
        calculation: language === 'th' ? 'ไม่ระบุวิธีการคำนวณ' : 'Calculation method not specified'
      };
    }
    
    const details = indicatorDetails[indicatorKey];
    return {
      name: language === 'th' ? details.indicator_THA : details.indicator_ENG,
      description: language === 'th' ? details.detail_THA : details.detail_ENG,
      calculation: language === 'th' ? details.calculation_method_THA : details.calculation_method_ENG,
      id: details.id
    };
  };

  return {
    indicatorDetails,
    loading,
    error,
    getIndicatorName,
    getIndicatorDescription,
    getCalculationMethod,
    getIndicatorInfo
  };
};

export default useIndicators;