// src/hooks/useIndicatorDetails.js
import { useState, useEffect } from 'react';
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

  // Helper function to get indicator name in specified language
  const getIndicatorName = (indicatorKey, language = 'en') => {
    if (!indicatorDetails || !indicatorDetails[indicatorKey]) {
      return indicatorKey; // fallback to key if not found
    }
    
    const details = indicatorDetails[indicatorKey];
    return language === 'th' ? details.indicator_THA : details.indicator_ENG;
  };

  // Helper function to get indicator description in specified language
  const getIndicatorDescription = (indicatorKey, language = 'en') => {
    if (!indicatorDetails || !indicatorDetails[indicatorKey]) {
      return language === 'th' ? 'ไม่มีคำอธิบาย' : 'No description available';
    }
    
    const details = indicatorDetails[indicatorKey];
    return language === 'th' ? details.detail_THA : details.detail_ENG;
  };

  // Helper function to get calculation method in specified language
  const getCalculationMethod = (indicatorKey, language = 'en') => {
    if (!indicatorDetails || !indicatorDetails[indicatorKey]) {
      return language === 'th' ? 'ไม่ระบุวิธีการคำนวณ' : 'Calculation method not specified';
    }
    
    const details = indicatorDetails[indicatorKey];
    return language === 'th' ? details.calculation_method_THA : details.calculation_method_ENG;
  };

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