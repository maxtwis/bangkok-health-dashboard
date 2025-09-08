import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { INDICATOR_TYPES } from '../../constants/indicatorTypes';
import { getHealthcareSupplyColor } from '../../utils/dashboardUtils';

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
  getIndicatorData 
}) => {
  const { t, language } = useLanguage();
  
  // Helper function to detect mobile devices
  const isMobileDevice = () => window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
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

  // Get color based on score with proper handling of combined data and healthcare supply indicators
  const getDistrictColor = (districtName) => {
    if (!getIndicatorData || districtName === 'Bangkok Overall') {
      return '#94a3b8';
    }

    try {
      const effectivePopulationGroup = selectedIndicatorType === INDICATOR_TYPES.IMD ? 'all' : selectedPopulationGroup;
      const indicatorData = getIndicatorData(selectedDomain, districtName, effectivePopulationGroup, selectedIndicatorType);
      const domainScore = indicatorData.find(item => item.isDomainScore);
      
      // Check for valid domain score
      if (!domainScore) {
        return '#e2e8f0'; // Light grey for no domain score
      }

      // Handle all types of data including combined and pre-calculated
      const score = domainScore.value;
      const sampleSize = domainScore.sample_size;
      
      // Accept data if we have a valid score, regardless of sample size type
      if (score === null || score === undefined || isNaN(score)) {
        return '#e2e8f0'; // Light grey for no valid score
      }

      // For IMD healthcare supply indicators, use healthcare supply color system
      if (selectedIndicatorType === INDICATOR_TYPES.IMD) {
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
        
        // Check if this is a single-indicator IMD domain (food_access or sports_recreation)
        if (actualIndicator && healthcareSupplyIndicators.includes(actualIndicator)) {
          // Find the indicator data by its actual name
          const indicatorItem = indicatorData.find(item => 
            item.name === actualIndicator || 
            item.indicator === actualIndicator
          );
          
          if (indicatorItem && indicatorItem.value !== null && indicatorItem.value !== undefined) {
            const color = getHealthcareSupplyColor(indicatorItem.value, actualIndicator);
            return color;
          }
        }
        // For healthcare_infrastructure domain with multiple indicators
        else if (selectedDomain === 'healthcare_infrastructure') {
          // Use domain score for healthcare infrastructure
          if (domainScore && domainScore.value !== null && domainScore.value !== undefined) {
            // For domain scores, use regular percentage-based colors
            if (domainScore.value >= 80) return '#10b981'; // Green
            if (domainScore.value >= 60) return '#f59e0b'; // Yellow
            if (domainScore.value >= 40) return '#fb923c'; // Orange
            return '#ef4444'; // Red
          }
        }
      }

      // For normal population, accept combined data and pre-calculated data
      if (selectedPopulationGroup === 'normal_population') {
        // Accept any valid score for normal population (survey + combined + pre-calculated)
        if (score >= 0) {
          if (score >= 80) return '#10b981'; // Green
          if (score >= 60) return '#f59e0b'; // Yellow
          if (score >= 40) return '#fb923c'; // Orange
          return '#ef4444'; // Red
        }
      } else {
        // For other population groups, be more lenient with sample size
        // Accept data if we have at least 1 person (was 5 before)
        if (typeof sampleSize === 'number' && sampleSize >= 1) {
          if (score >= 80) return '#10b981'; // Green
          if (score >= 60) return '#f59e0b'; // Yellow
          if (score >= 40) return '#fb923c'; // Orange
          return '#ef4444'; // Red
        }
        // Also handle string sample sizes (like "Bangkok-wide")
        else if (typeof sampleSize === 'string' && sampleSize !== 'N/A') {
          if (score >= 80) return '#10b981'; // Green
          if (score >= 60) return '#f59e0b'; // Yellow
          if (score >= 40) return '#fb923c'; // Orange
          return '#ef4444'; // Red
        }
      }

      return '#e2e8f0'; // Default light grey
      
    } catch (err) {
      return '#94a3b8'; // Medium grey for errors
    }
  };

  // Update map layers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonData || !mapReady) {
      return;
    }

    try {
      // Remove old layer
      if (geoJsonLayerRef.current) {
        mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
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
            // FIXED: Show more informative popup with data details
            const effectivePopulationGroup2 = selectedIndicatorType === INDICATOR_TYPES.IMD ? 'all' : selectedPopulationGroup;
            const indicatorData = getIndicatorData ? getIndicatorData(selectedDomain, districtName, effectivePopulationGroup2, selectedIndicatorType) : [];
            const domainScore = indicatorData.find(item => item.isDomainScore);
            
            let popupContent = `<strong>${districtName}</strong><br/>`;
            
            if (domainScore && domainScore.value !== null && domainScore.value !== undefined) {
              popupContent += `${t(`domains.${selectedDomain}`)}: ${domainScore.value.toFixed(1)}%<br/>`;
              
              // Show sample size info only for SDHE (not for IMD)
              if (selectedIndicatorType !== INDICATOR_TYPES.IMD) {
                if (typeof domainScore.sample_size === 'string') {
                  popupContent += `Sample: ${domainScore.sample_size}<br/>`;
                } else if (typeof domainScore.sample_size === 'number') {
                  popupContent += `Sample: ${domainScore.sample_size} people<br/>`;
                }
              }
              
              // Show combination method for normal population
              if (selectedPopulationGroup === 'normal_population' && domainScore.isCombined) {
                const method = domainScore.combinationMethod;
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
  }, [geoJsonData, selectedDomain, selectedPopulationGroup, selectedDistrict, getIndicatorData, onDistrictClick, mapReady, t, language]);

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
          <div className="font-medium mb-2">{t(`domains.${selectedDomain}`)}</div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-green-500 rounded"></div>
              <span>{language === 'th' ? 'ดีเยี่ยม (≥80%)' : 'Excellent (≥80%)'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-yellow-500 rounded"></div>
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