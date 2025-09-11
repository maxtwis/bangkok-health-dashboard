import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { INDICATOR_TYPES } from '../../constants/indicatorTypes';
import { getHealthcareSupplyColor } from '../../utils/dashboardUtils';
import { REVERSE_INDICATORS } from '../../constants/dashboardConstants';

// Fix for default markers in Leaflet with bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const BangkokMap = ({ 
  selectedDomain, 
  selectedPopulationGroup, 
  selectedDistrict,
  selectedIndicatorType,
  onDistrictClick,
  getIndicatorData,
  selectedIndicator = null, // New prop for individual indicator selection
  mapMode = 'domain' // New prop: 'domain' or 'indicator'
}) => {
  const { t, language } = useLanguage();
  
  // Helper function to detect mobile devices
  const isMobileDevice = () => window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const labelsLayerRef = useRef(null);
  const initializationTimeoutRef = useRef(null);
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  // District code mapping
  const districtCodeMap = {
    1001: "พระนคร", 1002: "ดุสิต", 1003: "หนองจอก", 1004: "บางรัก",
    1005: "บางเขน", 1006: "บางกะปิ", 1007: "ปทุมวัน", 1008: "ป้อมปราบศัตรูพ่าย",
    1009: "พระโขนง", 1010: "มีนบุรี", 1011: "ลาดกระบัง", 1012: "ยานนาวา",
    1013: "สัมพันธวงศ์", 1014: "พญาไท", 1015: "ธนบุรี", 1016: "บางกอกใหญ่",
    1017: "ห้วยขวาง", 1018: "คลองสาน", 1019: "ตลิ่งชัน", 1020: "บางกอกน้อย",
    1021: "บางขุนเทียน", 1022: "ภาษีเจริญ", 1023: "หนองแขม", 1024: "ราษฎร์บูรณะ",
    1025: "บางพลัด", 1026: "ดินแดง", 1027: "บึงกุ่ม", 1028: "สาทร",
    1029: "บางซื่อ", 1030: "จตุจักร", 1031: "บางคอแหลม", 1032: "ประเวศ",
    1033: "คลองเตย", 1034: "สวนหลวง", 1035: "จอมทอง", 1036: "ดอนเมือง",
    1037: "ราชเทวี", 1038: "ลาดพร้าว", 1039: "วัฒนา", 1040: "บางแค",
    1041: "หลักสี่", 1042: "สายไหม", 1043: "คันนายาว", 1044: "สะพานสูง",
    1045: "วังทองหลาง", 1046: "คลองสามวา", 1047: "บางนา", 1048: "ทวีวัฒนา",
    1049: "ทุ่งครุ", 1050: "บางบอน"
  };

  // Load GeoJSON data
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        const response = await fetch('/data/district.geojson');
        
        if (!response.ok) {
          throw new Error(`Failed to load GeoJSON: ${response.status}`);
        }
        
        const data = await response.json();
        setGeoJsonData(data);
        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, []);

  // Retry mechanism for map initialization with better mobile handling
  const retryInitialization = useCallback(() => {
    const maxRetries = isMobileDevice() ? 5 : 3; // More retries on mobile
    
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setMapReady(false);
    } else {
      setError('Failed to initialize map after multiple attempts');
    }
  }, [retryCount]);

  // Initialize map with better error handling and container checking
  const initializeMap = useCallback(() => {
    if (!mapRef.current || mapInstanceRef.current || loading || error) {
      return;
    }

    const container = mapRef.current;
    
    // Wait for container to have proper dimensions
    const checkContainerReady = () => {
      const rect = container.getBoundingClientRect();
      
      // Check if container has proper dimensions
      if (rect.width === 0 || rect.height === 0) {
        return false;
      }
      
      // Check if container is visible in viewport (more lenient for mobile)
      if (rect.top < -window.innerHeight * 2 || rect.top > window.innerHeight * 3) {
        return false;
      }
      
      return true;
    };

    if (!checkContainerReady()) {
      // Wait longer on mobile devices and try again
      const waitTime = isMobileDevice() ? 300 : 100;
      
      initializationTimeoutRef.current = setTimeout(() => {
        if (checkContainerReady()) {
          initializeMap();
        } else if (retryCount < 5) { // Increased retry limit for mobile
          retryInitialization();
        } else {
          // Final attempt - force initialization even with sub-optimal conditions
          console.warn('Map initialization: forcing initialization after retries');
          // Continue with initialization
        }
      }, waitTime);
      
      // Don't return immediately if we've exhausted retries - try to initialize anyway
      if (retryCount < 5) {
        return;
      }
    }

    try {
      // Clear any existing map first
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Ensure container has explicit dimensions and proper mobile handling
      container.style.height = '100%';
      container.style.width = '100%';
      container.style.position = 'relative';
      container.style.minHeight = '400px';
      container.style.minWidth = '300px';
      container.style.touchAction = 'pan-x pan-y'; // Enable proper touch handling
      
      // Force a reflow to ensure dimensions are applied
      container.offsetHeight;

      // Create map with mobile-optimized settings
      const map = L.map(container, {
        center: [13.7563, 100.5018],
        zoom: isMobileDevice() ? 9 : 10, // Slightly zoomed out on mobile
        zoomControl: true,
        attributionControl: !isMobileDevice(), // Hide attribution on mobile to save space
        preferCanvas: false,
        renderer: L.svg(), // Force SVG renderer
        tap: true, // Enable tap detection
        tapTolerance: 15, // Increase tap tolerance for mobile
        touchZoom: true,
        bounceAtZoomLimits: false,
        maxBoundsViscosity: isMobileDevice() ? 0.5 : 1.0 // Smoother bounds on mobile
      });

      // Add error handler for the map
      map.on('error', (e) => {
        retryInitialization();
      });

      // Add tile layer with comprehensive error handling
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
        errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSI+VGlsZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+'
      });

      let tileLoadTimeout = setTimeout(() => {
        proceedWithMapSetup();
      }, 5000);

      const proceedWithMapSetup = () => {
        clearTimeout(tileLoadTimeout);
        
        // Store map reference
        mapInstanceRef.current = map;
        
        // Invalidate size to ensure proper rendering - longer delay for mobile
        const delay = isMobileDevice() ? 150 : 50;
        
        setTimeout(() => {
          if (mapInstanceRef.current) {
            try {
              mapInstanceRef.current.invalidateSize(true);
              
              // Additional mobile-specific invalidation
              if (isMobileDevice()) {
                setTimeout(() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.invalidateSize(true);
                  }
                }, 100);
              }
              
              setMapReady(true);
              setRetryCount(0); // Reset retry count on success
            } catch (invalidateError) {
              console.warn('Map invalidateSize error:', invalidateError);
              // Still mark as ready even if invalidateSize fails
              setMapReady(true);
              setRetryCount(0);
            }
          }
        }, delay);
      };

      tileLayer.on('load', () => {
        proceedWithMapSetup();
      });

      tileLayer.on('tileerror', (e) => {
        // Don't fail completely, just continue
      });

      tileLayer.addTo(map);

      // Fallback: proceed even if tiles don't load completely - longer timeout for mobile
      setTimeout(proceedWithMapSetup, isMobileDevice ? 4000 : 2000);

    } catch (err) {
      retryInitialization();
    }
  }, [loading, error, retryInitialization, retryCount]);

  // Initialize map when data is ready with mobile-optimized timing
  useEffect(() => {
    if (!loading && !error && geoJsonData) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        // Longer delay for mobile devices to allow for layout completion
        const delay = isMobileDevice() ? 300 : 100;
        
        setTimeout(initializeMap, delay);
      });
    }
  }, [loading, error, geoJsonData, initializeMap]);

  // Additional effect to handle window resize on mobile
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current && mapReady) {
        // Debounced resize handler for mobile
        clearTimeout(initializationTimeoutRef.current);
        initializationTimeoutRef.current = setTimeout(() => {
          if (mapInstanceRef.current) {
            try {
              mapInstanceRef.current.invalidateSize(true);
            } catch (e) {
              console.warn('Resize invalidateSize error:', e);
            }
          }
        }, 200);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [mapReady]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Helper function to get min-max scaled score for IMD indicators
  const getIMDRelativeScore = (currentValue, indicatorName) => {
    if (!getIndicatorData || !geoJsonData) return null;
    
    try {
      const allValues = [];
      const effectivePopulationGroup = selectedIndicatorType === INDICATOR_TYPES.IMD ? 'all' : selectedPopulationGroup;
      
      // Collect all district values for this indicator
      geoJsonData.features.forEach((feature) => {
        const dcode = feature.properties.dcode;
        const districtName = districtCodeMap[dcode];
        
        if (districtName && districtName !== 'Bangkok Overall') {
          try {
            const indicatorData = getIndicatorData(selectedDomain, districtName, effectivePopulationGroup, selectedIndicatorType);
            const targetItem = indicatorData.find(item => 
              item.indicator === indicatorName || 
              item.name === indicatorName ||
              item.label === indicatorName
            );
            
            if (targetItem && targetItem.value !== null && targetItem.value !== undefined && !isNaN(targetItem.value)) {
              allValues.push(Number(targetItem.value));
            }
          } catch (e) {
            // Skip districts with no data
          }
        }
      });
      
      if (allValues.length < 2) return null; // Need at least 2 values for min-max scaling
      
      const minValue = Math.min(...allValues);
      const maxValue = Math.max(...allValues);
      
      // Log values for debugging
      if (indicatorName === 'จำนวนบุคลากรทางการแพทย์ต่อประชากร') {
        console.log(`Health workers - Min: ${minValue}, Max: ${maxValue}, Current (${currentValue}): ${((currentValue - minValue) / (maxValue - minValue)) * 100}%`);
        console.log('All values:', allValues.sort((a,b) => b-a)); // Show top values
      }
      
      if (minValue === maxValue) return 50; // If all values are the same, return middle value
      
      // Scale to 0-100 range
      const scaledScore = ((currentValue - minValue) / (maxValue - minValue)) * 100;
      return scaledScore;
    } catch (e) {
      return null;
    }
  };

  // Helper function to get min-max scaled domain score for IMD domains
  const getIMDRelativeDomainScore = (currentDomainScore, domainName) => {
    if (!getIndicatorData || !geoJsonData) return null;
    
    try {
      const allDomainScores = [];
      const effectivePopulationGroup = selectedIndicatorType === INDICATOR_TYPES.IMD ? 'all' : selectedPopulationGroup;
      
      // Collect all district domain scores
      geoJsonData.features.forEach((feature) => {
        const dcode = feature.properties.dcode;
        const districtName = districtCodeMap[dcode];
        
        if (districtName && districtName !== 'Bangkok Overall') {
          try {
            const indicatorData = getIndicatorData(domainName, districtName, effectivePopulationGroup, selectedIndicatorType);
            const domainScoreItem = indicatorData.find(item => item.isDomainScore);
            
            if (domainScoreItem && domainScoreItem.value !== null && domainScoreItem.value !== undefined && !isNaN(domainScoreItem.value)) {
              allDomainScores.push(Number(domainScoreItem.value));
            }
          } catch (e) {
            // Skip districts with no data
          }
        }
      });
      
      if (allDomainScores.length < 2) return null; // Need at least 2 values for min-max scaling
      
      const minValue = Math.min(...allDomainScores);
      const maxValue = Math.max(...allDomainScores);
      
      if (minValue === maxValue) return 50; // If all values are the same, return middle value
      
      // Scale to 0-100 range
      const scaledScore = ((currentDomainScore - minValue) / (maxValue - minValue)) * 100;
      return scaledScore;
    } catch (e) {
      return null;
    }
  };

  // Get color based on score with proper handling of combined data and healthcare supply indicators
  const getDistrictColor = (districtName) => {
    if (!getIndicatorData || districtName === 'Bangkok Overall') {
      return '#94a3b8';
    }

    try {
      const effectivePopulationGroup = selectedIndicatorType === INDICATOR_TYPES.IMD ? 'all' : selectedPopulationGroup;
      const indicatorData = getIndicatorData(selectedDomain, districtName, effectivePopulationGroup, selectedIndicatorType);
      
      // Choose the data item based on map mode
      let targetItem;
      if (mapMode === 'indicator' && selectedIndicator) {
        // Find specific indicator in the data
        targetItem = indicatorData.find(item => 
          item.indicator === selectedIndicator || 
          item.name === selectedIndicator ||
          item.label === selectedIndicator
        );
      } else {
        // Use domain score (default behavior)
        targetItem = indicatorData.find(item => item.isDomainScore);
      }
      
      // Check for valid data item
      if (!targetItem) {
        return '#e2e8f0'; // Light grey for no data
      }

      // Handle all types of data including combined and pre-calculated
      const score = targetItem.value;
      const sampleSize = targetItem.sample_size;
      
      // Accept data if we have a valid score, regardless of sample size type
      if (score === null || score === undefined || isNaN(score)) {
        return '#e2e8f0'; // Light grey for no valid score
      }

      // For IMD indicators, use min-max scaling with raw values
      if (selectedIndicatorType === INDICATOR_TYPES.IMD) {
        // If in indicator mode, use the selected indicator directly
        if (mapMode === 'indicator' && selectedIndicator) {
          // Use min-max scaling for proper GIS interval grouping
          const relativeScore = getIMDRelativeScore(score, selectedIndicator);
          
          if (relativeScore !== null) {
            // Wider intervals for more distinct colors: highest values = green, lowest = red
            if (relativeScore >= 80) return '#10b981'; // Green (top 20%)
            if (relativeScore >= 40) return '#fbbf24'; // Yellow (middle 40%) - brighter
            if (relativeScore >= 20) return '#fb923c'; // Orange (low 20%)
            return '#ef4444'; // Red (bottom 20%)
          } else {
            // Fallback to grey if scaling fails
            return '#e2e8f0'; // Light grey
          }
        }
        // Domain mode logic (original)
        else {
          // Map domain names to their actual indicator names
          const domainToIndicatorMap = {
            'healthcare_infrastructure': null, // This domain has multiple indicators
            'food_access': 'market_per_population',
            'sports_recreation': 'sportfield_per_population'
          };
          
          // Get the actual indicator name for single-indicator domains
          const actualIndicator = domainToIndicatorMap[selectedDomain];
          
          // List of all healthcare supply indicators
          const healthcareSupplyIndicators = [
            'health_clinic_per_population',
            'hospital_per_population', 
            'pharmacy_per_population',
            'market_per_population',
            'sportfield_per_population'
          ];
          
          // For single-indicator IMD domains, use min-max scaling
          if (actualIndicator) {
            // Find the indicator data by its actual name
            const indicatorItem = indicatorData.find(item => 
              item.name === actualIndicator || 
              item.indicator === actualIndicator
            );
            
            if (indicatorItem && indicatorItem.value !== null && indicatorItem.value !== undefined) {
              // Use min-max scaling for proper GIS interval grouping  
              const relativeScore = getIMDRelativeScore(indicatorItem.value, actualIndicator);
              
              if (relativeScore !== null) {
                // Wider intervals for more distinct colors: highest values = green, lowest = red
                if (relativeScore >= 80) return '#10b981'; // Green (top 20%)
                if (relativeScore >= 40) return '#fbbf24'; // Yellow (middle 40%) - brighter
                if (relativeScore >= 20) return '#fb923c'; // Orange (low 20%)
                return '#ef4444'; // Red (bottom 20%)
              } else {
                // Fallback to grey if scaling fails
                return '#e2e8f0'; // Light grey
              }
            }
          }
          // For healthcare_infrastructure domain with multiple indicators
          else if (selectedDomain === 'healthcare_infrastructure') {
            // Use domain score for healthcare infrastructure with min-max scaling
            if (targetItem && targetItem.value !== null && targetItem.value !== undefined) {
              // Apply min-max scaling to IMD domain scores for better color distribution
              const relativeDomainScore = getIMDRelativeDomainScore(targetItem.value, selectedDomain);
              
              if (relativeDomainScore !== null) {
                // Wider intervals for more distinct colors
                if (relativeDomainScore >= 80) return '#10b981'; // Green (top 20%)
                if (relativeDomainScore >= 40) return '#fbbf24'; // Yellow (middle 40%) - brighter
                if (relativeDomainScore >= 20) return '#fb923c'; // Orange (low 20%)
                return '#ef4444'; // Red (bottom 20%)
              } else {
                // Fallback to grey if scaling fails
                return '#e2e8f0'; // Light grey
              }
            }
          }
        }
      }

      // For SDHE indicators in indicator mode, use standard percentage-based coloring
      if (selectedIndicatorType !== INDICATOR_TYPES.IMD && mapMode === 'indicator' && selectedIndicator) {
        // Check if we need to handle reverse indicators
        const isReverse = REVERSE_INDICATORS[selectedIndicator];
        
        if (isReverse) {
          if (score <= 20) return '#10b981'; // Green (good - low percentage)
          if (score <= 40) return '#fbbf24'; // Yellow - brighter
          if (score <= 60) return '#fb923c'; // Orange
          return '#ef4444'; // Red (bad - high percentage)
        } else {
          if (score >= 80) return '#10b981'; // Green (good - high percentage)
          if (score >= 60) return '#fbbf24'; // Yellow - brighter
          if (score >= 40) return '#fb923c'; // Orange
          return '#ef4444'; // Red (bad - low percentage)
        }
      }

      // Check if this is an IMD domain score and apply min-max scaling
      const isIMDDomain = selectedIndicatorType === INDICATOR_TYPES.IMD;
      
      if (isIMDDomain && targetItem && targetItem.isDomainScore) {
        // Apply min-max scaling to IMD domain scores
        const relativeDomainScore = getIMDRelativeDomainScore(score, selectedDomain);
        
        if (relativeDomainScore !== null) {
          // Wider intervals for more distinct colors
          if (relativeDomainScore >= 80) return '#10b981'; // Green (top 20%)
          if (relativeDomainScore >= 40) return '#fbbf24'; // Yellow (middle 40%) - brighter
          if (relativeDomainScore >= 20) return '#fb923c'; // Orange (low 20%)
          return '#ef4444'; // Red (bottom 20%)
        }
      }

      // For SDHE indicators - use fixed percentage thresholds
      // For normal population, accept combined data and pre-calculated data
      if (selectedPopulationGroup === 'normal_population') {
        // Accept any valid score for normal population (survey + combined + pre-calculated)
        if (score >= 0) {
          if (score >= 80) return '#10b981'; // Green
          if (score >= 60) return '#fbbf24'; // Yellow - brighter
          if (score >= 40) return '#fb923c'; // Orange
          return '#ef4444'; // Red
        }
      } else {
        // For other population groups, be more lenient with sample size
        // Accept data if we have at least 1 person (was 5 before)
        if (typeof sampleSize === 'number' && sampleSize >= 1) {
          if (score >= 80) return '#10b981'; // Green
          if (score >= 60) return '#fbbf24'; // Yellow - brighter
          if (score >= 40) return '#fb923c'; // Orange
          return '#ef4444'; // Red
        }
        // Also handle string sample sizes (like "Bangkok-wide")
        else if (typeof sampleSize === 'string' && sampleSize !== 'N/A') {
          if (score >= 80) return '#10b981'; // Green
          if (score >= 60) return '#fbbf24'; // Yellow - brighter
          if (score >= 40) return '#fb923c'; // Orange
          return '#ef4444'; // Red
        }
      }

      return '#e2e8f0'; // Default light grey
      
    } catch (err) {
      return '#94a3b8'; // Medium grey for errors
    }
  };

  // Create district labels
  const createDistrictLabels = useCallback(() => {
    if (!mapInstanceRef.current || !geoJsonData) {
      return null;
    }

    const labels = [];
    const currentZoom = mapInstanceRef.current.getZoom();
    const isMobile = isMobileDevice();
    
    // Hide labels when zoomed out too far to prevent clustering
    const minZoomForLabels = isMobile ? 9.5 : 10;
    if (currentZoom < minZoomForLabels) {
      return [];
    }
    
    // Adjust font size and opacity based on zoom level and device
    let fontSize = Math.max(8, Math.min(14, currentZoom * 1.2));
    let opacity = Math.min(1, (currentZoom - minZoomForLabels + 1) * 0.8);
    
    if (isMobile) {
      fontSize = Math.max(6, Math.min(12, currentZoom * 1.1));
    }
    
    // At higher zoom levels, show larger districts first to reduce clustering
    const districtPriority = {
      // Large districts (show first)
      'หนองจอก': 1, 'บางแค': 1, 'ทุ่งครุ': 1, 'ลาดกระบัง': 1,
      'บางขุนเทียน': 1, 'มีนบุรี': 1, 'คลองสามวา': 1, 'ประเวศ': 1,
      // Medium districts  
      'บึงกุ่ม': 2, 'สะพานสูง': 2, 'วังทองหลาง': 2, 'ลาดพร้าว': 2,
      'บางกะปิ': 2, 'ห้วยขวาง': 2, 'บางเขน': 2, 'คันนายาว': 2,
      // Small districts (show last)
      'ปทุมวัน': 3, 'บางรัก': 3, 'สาทร': 3, 'วัฒนา': 3
    };
    
    // Show labels progressively based on zoom level
    let maxPriority = 3;
    if (currentZoom < 11) maxPriority = 1;
    else if (currentZoom < 12) maxPriority = 2;

    geoJsonData.features.forEach((feature) => {
      const dcode = feature.properties.dcode;
      const districtName = districtCodeMap[dcode];
      
      if (districtName && feature.geometry.type === 'Polygon') {
        // Check if this district should be shown at current zoom level
        const priority = districtPriority[districtName] || 2; // Default to medium priority
        if (priority > maxPriority) {
          return; // Skip this district at current zoom level
        }
        // Calculate centroid of the polygon
        const coordinates = feature.geometry.coordinates[0];
        let centroidLat = 0;
        let centroidLng = 0;
        let signedArea = 0;
        
        for (let i = 0; i < coordinates.length - 1; i++) {
          const x0 = coordinates[i][0];
          const y0 = coordinates[i][1];
          const x1 = coordinates[i + 1][0];
          const y1 = coordinates[i + 1][1];
          const a = x0 * y1 - x1 * y0;
          signedArea += a;
          centroidLng += (x0 + x1) * a;
          centroidLat += (y0 + y1) * a;
        }
        
        signedArea *= 0.5;
        centroidLng /= (6.0 * signedArea);
        centroidLat /= (6.0 * signedArea);
        
        // Create label with appropriate styling
        const label = L.marker([centroidLat, centroidLng], {
          icon: L.divIcon({
            className: 'district-label',
            html: `<div style="
              font-size: ${fontSize}px;
              font-weight: 600;
              color: #1f2937;
              text-align: center;
              text-shadow: 1px 1px 3px rgba(255,255,255,0.9), -1px -1px 1px rgba(255,255,255,0.9);
              pointer-events: none;
              white-space: nowrap;
              line-height: 1.1;
              opacity: ${opacity};
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              transition: opacity 0.3s ease;
            ">${districtName}</div>`,
            iconSize: [100, 20],
            iconAnchor: [50, 10]
          })
        });
        
        labels.push(label);
      }
    });

    return labels;
  }, [geoJsonData, districtCodeMap]);

  // Update map layers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonData || !mapReady) {
      return;
    }

    try {
      // Remove old layers
      if (geoJsonLayerRef.current) {
        mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
      }
      if (labelsLayerRef.current) {
        mapInstanceRef.current.removeLayer(labelsLayerRef.current);
      }

      // Create districts layer
      const layer = L.geoJSON(geoJsonData, {
        style: (feature) => {
          const dcode = feature.properties.dcode;
          const districtName = districtCodeMap[dcode];
          
          return {
            fillColor: getDistrictColor(districtName),
            weight: selectedDistrict === districtName ? 3 : 1,
            opacity: 1,
            color: selectedDistrict === districtName ? '#1f2937' : '#64748b',
            fillOpacity: 0.7
          };
        },
        onEachFeature: (feature, layer) => {
          const dcode = feature.properties.dcode;
          const districtName = districtCodeMap[dcode];
          
          if (districtName) {
            // Show more informative popup with data details
            const effectivePopulationGroup2 = selectedIndicatorType === INDICATOR_TYPES.IMD ? 'all' : selectedPopulationGroup;
            const indicatorData = getIndicatorData ? getIndicatorData(selectedDomain, districtName, effectivePopulationGroup2, selectedIndicatorType) : [];
            
            // Choose the data item based on map mode
            let targetPopupItem;
            let popupTitle = '';
            if (mapMode === 'indicator' && selectedIndicator) {
              // Find specific indicator in the data
              targetPopupItem = indicatorData.find(item => 
                item.indicator === selectedIndicator || 
                item.name === selectedIndicator ||
                item.label === selectedIndicator
              );
              popupTitle = targetPopupItem?.label || selectedIndicator;
            } else {
              // Use domain score (default behavior)
              targetPopupItem = indicatorData.find(item => item.isDomainScore);
              popupTitle = t(`domains.${selectedDomain}`);
            }
            
            let popupContent = `<strong>${districtName}</strong><br/>`;
            
            if (targetPopupItem && targetPopupItem.value !== null && targetPopupItem.value !== undefined) {
              // Format value appropriately
              let formattedValue = '';
              if (mapMode === 'indicator' && selectedIndicator) {
                // Healthcare supply indicators with proper units
                const healthcareSupplyIndicators = [
                  'doctor_per_population', 
                  'nurse_per_population', 
                  'healthworker_per_population', 
                  'community_healthworker_per_population',
                  'health_service_access',
                  'bed_per_population',
                  'market_per_population',
                  'sportfield_per_population'
                ];

                if (healthcareSupplyIndicators.includes(selectedIndicator)) {
                  const valueNum = Number(targetPopupItem.value);
                  
                  // Define units for each healthcare supply indicator
                  const getUnit = (number) => {
                    if (language === 'th') {
                      return number === '1,000' ? 'ต่อ 1,000 คน' : 'ต่อ 10,000 คน';
                    } else {
                      return `per ${number}`;
                    }
                  };
                  
                  const unitMap = {
                    'doctor_per_population': `${valueNum.toFixed(1)} ${getUnit('1,000')}`,
                    'nurse_per_population': `${valueNum.toFixed(1)} ${getUnit('1,000')}`, 
                    'healthworker_per_population': `${valueNum.toFixed(1)} ${getUnit('10,000')}`,
                    'community_healthworker_per_population': `${valueNum.toFixed(1)} ${getUnit('1,000')}`,
                    'health_service_access': `${valueNum.toFixed(1)} ${getUnit('10,000')}`,
                    'bed_per_population': `${valueNum.toFixed(1)} ${getUnit('10,000')}`,
                    'market_per_population': `${valueNum.toFixed(1)} ${getUnit('10,000')}`,
                    'sportfield_per_population': `${valueNum.toFixed(1)} ${getUnit('1,000')}`
                  };

                  formattedValue = unitMap[selectedIndicator] || `${valueNum.toFixed(1)}%`;
                  
                  // For IMD indicators, also show relative ranking
                  if (selectedIndicatorType === INDICATOR_TYPES.IMD && healthcareSupplyIndicators.includes(selectedIndicator)) {
                    // Get ranking information
                    const relativeScore = getIMDRelativeScore(valueNum, selectedIndicator);
                    if (relativeScore !== null) {
                      const rankText = language === 'th' ? 
                        (relativeScore >= 75 ? ' (อันดับต้น)' : 
                         relativeScore >= 50 ? ' (อันดับกลาง-บน)' : 
                         relativeScore >= 25 ? ' (อันดับกลาง-ล่าง)' : 
                         ' (อันดับท้าย)') :
                        (relativeScore >= 75 ? ' (Top quartile)' : 
                         relativeScore >= 50 ? ' (Upper middle)' : 
                         relativeScore >= 25 ? ' (Lower middle)' : 
                         ' (Bottom quartile)');
                      formattedValue += rankText;
                    }
                  }
                } else {
                  formattedValue = `${Number(targetPopupItem.value).toFixed(1)}%`;
                }
              } else {
                formattedValue = `${targetPopupItem.value.toFixed(1)}%`;
              }
              
              popupContent += `${popupTitle}: ${formattedValue}<br/>`;
              
              // Show sample size info only for SDHE (not for IMD)
              if (selectedIndicatorType !== INDICATOR_TYPES.IMD) {
                if (typeof targetPopupItem.sample_size === 'string') {
                  popupContent += `Sample: ${targetPopupItem.sample_size}<br/>`;
                } else if (typeof targetPopupItem.sample_size === 'number') {
                  popupContent += `Sample: ${targetPopupItem.sample_size} people<br/>`;
                }
              }
              
              // Show combination method for normal population
              if (selectedPopulationGroup === 'normal_population' && targetPopupItem.isCombined) {
                const method = targetPopupItem.combinationMethod;
                let methodText = '';
                switch (method) {
                  case 'small_sample_fallback':
                    methodText = language === 'th' ? 'ตย.น้อย→BKK' : 'Small→BKK';
                    break;
                  case 'small_sample_balanced':
                    methodText = language === 'th' ? 'ตย.น้อย+BKK' : 'Small+BKK';
                    break;
                  case 'high_variance':
                    methodText = language === 'th' ? 'ส.แตกต่าง' : 'High Var';
                    break;
                  case 'normal_combination':
                    methodText = language === 'th' ? 'ส.+BKK' : 'Survey+BKK';
                    break;
                }
                if (methodText) {
                  popupContent += `Method: ${methodText}<br/>`;
                }
              }
            } else {
              popupContent += `${language === 'th' ? 'ไม่มีข้อมูล' : 'No data'}<br/>`;
            }
            
            popupContent += `<small>Click to select/deselect</small>`;
            
            layer.bindPopup(popupContent);
            
            layer.on('click', (e) => {
              // Prevent event from bubbling to map
              L.DomEvent.stopPropagation(e);
              
              if (onDistrictClick) {
                // If clicking on the already selected district, deselect it
                if (selectedDistrict === districtName) {
                  onDistrictClick('Bangkok Overall');
                } else {
                  onDistrictClick(districtName);
                }
              }
            });
          }
        }
      });

      // Add click handler to map background (for deselection when clicking outside districts)
      mapInstanceRef.current.on('click', (e) => {
        // Only trigger if we're not clicking on Bangkok Overall already
        if (selectedDistrict !== 'Bangkok Overall' && onDistrictClick) {
          onDistrictClick('Bangkok Overall');
        }
      });

      layer.addTo(mapInstanceRef.current);
      geoJsonLayerRef.current = layer;

      // Add district labels
      const labels = createDistrictLabels();
      if (labels && labels.length > 0) {
        const labelsGroup = L.layerGroup(labels);
        labelsGroup.addTo(mapInstanceRef.current);
        labelsLayerRef.current = labelsGroup;
      }
      
      // Fit bounds with error handling
      try {
        const bounds = layer.getBounds();
        if (bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
        }
      } catch (boundsError) {
        // Ignore bounds errors
      }
      
    } catch (err) {
      // Ignore layer update errors
    }
  }, [geoJsonData, selectedDomain, selectedPopulationGroup, selectedDistrict, getIndicatorData, onDistrictClick, mapReady, t, language, createDistrictLabels]);

  // Add zoom event handler to update label sizes
  useEffect(() => {
    if (!mapInstanceRef.current || !mapReady) return;

    const handleZoomEnd = () => {
      // Recreate labels with new font sizes based on zoom level
      if (labelsLayerRef.current) {
        mapInstanceRef.current.removeLayer(labelsLayerRef.current);
      }
      
      const labels = createDistrictLabels();
      if (labels && labels.length > 0) {
        const labelsGroup = L.layerGroup(labels);
        labelsGroup.addTo(mapInstanceRef.current);
        labelsLayerRef.current = labelsGroup;
      }
    };

    mapInstanceRef.current.on('zoomend', handleZoomEnd);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.off('zoomend', handleZoomEnd);
      }
    };
  }, [mapReady, createDistrictLabels]);

  // Show loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading map data...</p>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" role="img" aria-label="Map loading error icon">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Error</h3>
          <p className="text-red-600 text-sm mb-4">{error}</p>
          <div className="space-x-2">
            <button 
              onClick={retryInitialization}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={retryCount >= 3}
            >
              {retryCount >= 3 ? 'Max Retries Reached' : 'Retry'}
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Map container with explicit sizing and better positioning */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 w-full h-full z-0"
        style={{ 
          minHeight: '400px',
          minWidth: '300px',
          backgroundColor: '#f3f4f6' // Background color while loading
        }}
      />
      
      {/* Loading overlay while map initializes */}
      {!mapReady && !error && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-[2000]">
          <div className="text-center p-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">
              Initializing map...
              {retryCount > 0 && ` (Attempt ${retryCount + 1})`}
            </p>
          </div>
        </div>
      )}
      
      {/* Legend (only show when ready) */}
      {mapReady && (
        <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-lg p-3 text-xs z-[1000]">
          <div className="font-medium mb-2">
            {mapMode === 'indicator' && selectedIndicator 
              ? (t(`indicators.${selectedIndicator}`) || selectedIndicator)
              : t(`domains.${selectedDomain}`)
            }
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-green-500 rounded"></div>
              <span>{language === 'th' ? 'ดีเยี่ยม (≥80%)' : 'Excellent (≥80%)'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 rounded" style={{backgroundColor: '#fbbf24'}}></div>
              <span>{language === 'th' ? 'ดี (60-79%)' : 'Good (60-79%)'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-orange-500 rounded"></div>
              <span>{language === 'th' ? 'พอใช้ (40-59%)' : 'Fair (40-59%)'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-red-500 rounded"></div>
              <span>{language === 'th' ? 'ต้องปรับปรุง (<40%)' : 'Poor (<40%)'}</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Selection info (only show when ready) */}
      {mapReady && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-lg p-3 text-xs z-[1000]">
          <div className="font-medium mb-1">Current Selection</div>
          <div>District: {selectedDistrict === 'Bangkok Overall' && language === 'th' ? 'ภาพรวม 50 เขต' : selectedDistrict}</div>
          {selectedIndicatorType !== INDICATOR_TYPES.IMD && (
            <div>Group: {t(`populationGroups.${selectedPopulationGroup}`)}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default BangkokMap;