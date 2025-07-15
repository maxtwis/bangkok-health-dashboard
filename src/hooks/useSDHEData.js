// useSDHEData.js - Custom hook for SDHE data processing and management
import { useState, useEffect, useRef } from 'react';
import BangkokSDHEProcessor from '../utils/BangkokSDHEProcessor';

const useSDHEData = () => {
  const [sdheData, setSDHEData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingStatus, setProcessingStatus] = useState('idle');
  const processorRef = useRef(null);

  // Load and process survey data
  useEffect(() => {
    const loadAndProcessData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        setProcessingStatus('loading_survey_data');

        // Try to load the main survey CSV file
        let csvContent = null;
        try {
          const response = await fetch('/data/survey_sampling.csv');
          if (!response.ok) {
            throw new Error(`Failed to fetch survey data: ${response.status}`);
          }
          csvContent = await response.text();
          console.log('✅ Successfully loaded survey data from /data/survey_sampling.csv');
        } catch (fetchError) {
          console.warn('Could not load survey_sampling.csv, looking for alternative files...');
          
          // Try alternative file names
          const alternativeFiles = [
            '/data/bangkok_survey.csv',
            '/data/survey_data.csv',
            '/data/population_survey.csv'
          ];
          
          for (const filename of alternativeFiles) {
            try {
              const response = await fetch(filename);
              if (response.ok) {
                csvContent = await response.text();
                console.log(`✅ Successfully loaded survey data from ${filename}`);
                break;
              }
            } catch (altError) {
              console.warn(`Could not load ${filename}`);
            }
          }
          
          if (!csvContent) {
            throw new Error('No survey data files found. Please ensure survey_sampling.csv is in the /public/data/ folder.');
          }
        }

        setProcessingStatus('processing_indicators');

        // Initialize processor and process data
        const processor = new BangkokSDHEProcessor();
        processorRef.current = processor;
        
        const results = await processor.processSurveyData(csvContent);
        
        setSDHEData(results);
        setProcessingStatus('completed');
        setIsLoading(false);
        
        console.log('✅ SDHE data processing completed successfully');
        console.log('📊 Processed data:', {
          totalResponses: results.summary.total_responses,
          populationGroups: Object.keys(results.summary.groups),
          domainsCalculated: Object.keys(results.indicators).length
        });
        
      } catch (err) {
        console.error('❌ Error processing SDHE data:', err);
        setError(err.message);
        setProcessingStatus('error');
        setIsLoading(false);
      }
    };

    loadAndProcessData();
  }, []);

  // Helper functions for dashboard integration
  const getSpiderChartData = (analysisLevel = 'bangkok', selectedGroup = 'informal_workers') => {
    if (!processorRef.current || !sdheData) return [];
    return processorRef.current.formatSpiderChartForRecharts(analysisLevel, selectedGroup);
  };

  const getIndicatorTableData = (domain, populationGroup = null, district = null) => {
    if (!processorRef.current || !sdheData) return [];
    return processorRef.current.getIndicatorTableData(domain, populationGroup, district);
  };

  const getDomainScore = (domain, populationGroup, district = null) => {
    if (!sdheData?.spiderData) return 0;
    
    if (district && sdheData.indicators[domain]?.[district]?.[populationGroup]) {
      const indicators = Object.keys(sdheData.indicators[domain][district][populationGroup])
        .filter(key => key !== 'sample_size' && !key.includes('_sample_size'));
      
      if (indicators.length > 0) {
        const scores = indicators.map(indicator => 
          sdheData.indicators[domain][district][populationGroup][indicator] || 0
        );
        return scores.reduce((sum, score) => sum + score, 0) / scores.length;
      }
    }
    
    return sdheData.spiderData[populationGroup]?.[domain] || 0;
  };

  const getPopulationGroupStats = () => {
    if (!sdheData?.summary) return {};
    return sdheData.summary;
  };

  const getBangkokOverview = () => {
    if (!sdheData?.spiderData) return {};
    
    const overview = {};
    const populationGroups = ['informal_workers', 'elderly', 'disabled', 'lgbtq'];
    const domains = ['economic_security', 'education', 'healthcare_access', 'physical_environment', 'social_context', 'health_behaviors'];
    
    populationGroups.forEach(group => {
      overview[group] = {};
      domains.forEach(domain => {
        overview[group][domain] = sdheData.spiderData[group]?.[domain] || 0;
      });
    });
    
    return overview;
  };

  const getDistrictComparison = (district, populationGroup) => {
    if (!sdheData?.indicators || !district || !populationGroup) return {};
    
    const comparison = {};
    const domains = Object.keys(sdheData.indicators);
    
    domains.forEach(domain => {
      const districtData = sdheData.indicators[domain]?.[district]?.[populationGroup];
      if (districtData) {
        const indicators = Object.keys(districtData).filter(
          key => key !== 'sample_size' && !key.includes('_sample_size')
        );
        
        if (indicators.length > 0) {
          const domainScore = indicators.reduce((sum, indicator) => 
            sum + (districtData[indicator] || 0), 0) / indicators.length;
          comparison[domain] = domainScore;
        }
      }
    });
    
    return comparison;
  };

  const getEquityGaps = () => {
    if (!sdheData?.spiderData) return {};
    
    const gaps = {};
    const populationGroups = ['informal_workers', 'elderly', 'disabled', 'lgbtq'];
    const domains = Object.keys(sdheData.spiderData.overall || {});
    
    domains.forEach(domain => {
      gaps[domain] = {};
      const overallScore = sdheData.spiderData.overall[domain] || 0;
      
      populationGroups.forEach(group => {
        const groupScore = sdheData.spiderData[group]?.[domain] || 0;
        gaps[domain][group] = {
          score: groupScore,
          gap: groupScore - overallScore,
          percentageGap: overallScore > 0 ? ((groupScore - overallScore) / overallScore) * 100 : 0
        };
      });
    });
    
    return gaps;
  };

  const getVulnerabilityIndex = (populationGroup) => {
    if (!sdheData?.spiderData || !populationGroup) return null;
    
    const domains = ['economic_security', 'education', 'healthcare_access', 'physical_environment', 'social_context', 'health_behaviors'];
    const scores = domains.map(domain => sdheData.spiderData[populationGroup]?.[domain] || 0);
    
    if (scores.length === 0) return null;
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const vulnerability = Math.max(0, 100 - averageScore); // Invert score (lower SDHE scores = higher vulnerability)
    
    return {
      score: vulnerability,
      riskLevel: vulnerability > 75 ? 'high' : vulnerability > 50 ? 'moderate' : 'low',
      domainScores: domains.reduce((obj, domain, index) => {
        obj[domain] = scores[index];
        return obj;
      }, {})
    };
  };

  const getAvailableDomains = () => {
    if (!sdheData?.indicators) return [];
    return Object.keys(sdheData.indicators);
  };

  const getAvailableDistricts = () => {
    if (!sdheData?.indicators) return [];
    
    const districts = new Set();
    Object.values(sdheData.indicators).forEach(domainData => {
      Object.keys(domainData).forEach(district => {
        districts.add(district);
      });
    });
    
    return Array.from(districts).sort();
  };

  const getAvailablePopulationGroups = () => {
    if (!sdheData?.summary?.groups) return [];
    return Object.keys(sdheData.summary.groups);
  };

  return {
    // Data state
    sdheData,
    isLoading,
    error,
    processingStatus,
    
    // Data access functions
    getSpiderChartData,
    getIndicatorTableData,
    getDomainScore,
    getPopulationGroupStats,
    getBangkokOverview,
    getDistrictComparison,
    getEquityGaps,
    getVulnerabilityIndex,
    
    // Metadata functions
    getAvailableDomains,
    getAvailableDistricts,
    getAvailablePopulationGroups,
    
    // Processor instance (for advanced usage)
    processor: processorRef.current
  };
};

export default useSDHEData;