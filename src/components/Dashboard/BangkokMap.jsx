import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useLanguage } from '../../contexts/LanguageContext';

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
  onDistrictClick,
  getIndicatorData 
}) => {
  const { t, language } = useLanguage();
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
        console.log('🗺️ Loading GeoJSON...');
        const response = await fetch('/data/district.geojson');
        
        if (!response.ok) {
          throw new Error(`Failed to load GeoJSON: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ GeoJSON loaded:', data.features?.length, 'features');
        setGeoJsonData(data);
        
      } catch (err) {
        console.error('❌ GeoJSON Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, []);

  // Retry mechanism for map initialization
  const retryInitialization = useCallback(() => {
    if (retryCount < 3) {
      console.log(`🔄 Retrying map initialization (attempt ${retryCount + 1}/3)`);
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
      console.log('📏 Container dimensions:', rect);
      
      // Check if container has proper dimensions
      if (rect.width === 0 || rect.height === 0) {
        console.log('⏳ Container not ready, waiting...');
        return false;
      }
      
      // Check if container is visible in viewport
      if (rect.top < -window.innerHeight || rect.top > window.innerHeight * 2) {
        console.log('👁️ Container not visible, waiting...');
        return false;
      }
      
      return true;
    };

    if (!checkContainerReady()) {
      // Wait longer and try again
      initializationTimeoutRef.current = setTimeout(() => {
        if (checkContainerReady()) {
          initializeMap();
        } else {
          retryInitialization();
        }
      }, 100);
      return;
    }

    try {
      console.log('🚀 Creating Leaflet map...');
      
      // Clear any existing map first
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      // Ensure container has explicit dimensions
      container.style.height = '100%';
      container.style.width = '100%';
      container.style.position = 'relative';

      // Create map with error handling
      const map = L.map(container, {
        center: [13.7563, 100.5018],
        zoom: 10,
        zoomControl: true,
        attributionControl: true,
        preferCanvas: false,
        renderer: L.svg() // Force SVG renderer
      });

      // Add error handler for the map
      map.on('error', (e) => {
        console.error('Map error:', e);
        retryInitialization();
      });

      // Add tile layer with comprehensive error handling
      // Option 1: CartoDB Light (Gray) - Clean and minimal
      const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '© OpenStreetMap contributors © CARTO',
        maxZoom: 19,
        subdomains: 'abcd',
        errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSI+VGlsZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+'
      });

      // Alternative gray base map options (uncomment to use):
      
      // Option 2: CartoDB Light No Labels (Very clean gray)
      // const tileLayer = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
      //   attribution: '© OpenStreetMap contributors © CARTO',
      //   maxZoom: 19,
      //   subdomains: 'abcd'
      // });

      // Option 3: Stamen Toner Lite (High contrast gray)
      // const tileLayer = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png', {
      //   attribution: 'Map tiles by Stamen Design, CC BY 3.0 — Map data © OpenStreetMap contributors',
      //   maxZoom: 20,
      //   subdomains: 'abcd'
      // });

      // Option 4: ESRI Gray Canvas
      // const tileLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      //   attribution: 'Tiles © Esri — Esri, DeLorme, NAVTEQ',
      //   maxZoom: 16
      // });

      // Option 5: OpenStreetMap Grayscale (Custom styled)
      // const tileLayer = L.tileLayer('https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
      //   attribution: '© OpenStreetMap contributors',
      //   maxZoom: 18
      // });

      let tileLoadTimeout = setTimeout(() => {
        console.warn('Tiles taking too long to load, proceeding anyway...');
        proceedWithMapSetup();
      }, 5000);

      const proceedWithMapSetup = () => {
        clearTimeout(tileLoadTimeout);
        
        // Store map reference
        mapInstanceRef.current = map;
        console.log('✅ Map created successfully');
        
        // Invalidate size to ensure proper rendering
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize(true);
            setMapReady(true);
            setRetryCount(0); // Reset retry count on success
            console.log('✅ Map ready and sized correctly');
          }
        }, 50);
      };

      tileLayer.on('load', () => {
        console.log('✅ Tiles loaded');
        proceedWithMapSetup();
      });

      tileLayer.on('tileerror', (e) => {
        console.warn('Some tiles failed to load:', e);
        // Don't fail completely, just continue
      });

      tileLayer.addTo(map);

      // Fallback: proceed even if tiles don't load completely
      setTimeout(proceedWithMapSetup, 2000);

    } catch (err) {
      console.error('❌ Map initialization error:', err);
      retryInitialization();
    }
  }, [loading, error, retryInitialization, retryCount]);

  // Initialize map when data is ready
  useEffect(() => {
    if (!loading && !error && geoJsonData) {
      // Use requestAnimationFrame to ensure DOM is fully rendered
      requestAnimationFrame(() => {
        setTimeout(initializeMap, 100);
      });
    }
  }, [loading, error, geoJsonData, initializeMap]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (initializationTimeoutRef.current) {
        clearTimeout(initializationTimeoutRef.current);
      }
      if (mapInstanceRef.current) {
        console.log('🧹 Cleaning up map');
        try {
          mapInstanceRef.current.remove();
        } catch (e) {
          console.warn('Error during map cleanup:', e);
        }
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Get color based on score
  const getDistrictColor = (districtName) => {
    if (!getIndicatorData || districtName === 'Bangkok Overall') {
      return '#94a3b8';
    }

    try {
      const indicatorData = getIndicatorData(selectedDomain, districtName, selectedPopulationGroup);
      const domainScore = indicatorData.find(item => item.isDomainScore);
      
      if (!domainScore || domainScore.sample_size < 5) {
        return '#e2e8f0';
      }

      const score = domainScore.value;
      
      if (score >= 80) return '#10b981'; 
      if (score >= 60) return '#f59e0b'; 
      if (score >= 40) return '#f97316'; 
      return '#ef4444'; 
      
    } catch (err) {
      return '#94a3b8';
    }
  };

  // Update map layers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonData || !mapReady) {
      return;
    }

    console.log('🗺️ Updating district layers...');

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
            layer.bindPopup(`<strong>${districtName}</strong><br/><small>Click to select/deselect</small>`);
            
            layer.on('click', (e) => {
              console.log('🖱️ Clicked:', districtName);
              
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
          console.log('🗺️ Clicked outside districts - returning to Bangkok Overall');
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
        console.warn('Error fitting bounds:', boundsError);
      }
      
      console.log('✅ District layers updated');
      
    } catch (err) {
      console.error('❌ Layer update error:', err);
    }
  }, [geoJsonData, selectedDomain, selectedPopulationGroup, selectedDistrict, getIndicatorData, onDistrictClick, mapReady]);

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
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <span>Good (≥80%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-yellow-500 rounded"></div>
              <span>Fair (60-79%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-orange-500 rounded"></div>
              <span>Poor (40-59%)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-red-500 rounded"></div>
              <span>Very Poor (&lt;40%)</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Selection info (only show when ready) */}
      {mapReady && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-lg p-3 text-xs z-[1000]">
          <div className="font-medium mb-1">Current Selection</div>
          <div>District: {selectedDistrict === 'Bangkok Overall' && language === 'th' ? 'ภาพรวม 50 เขต' : selectedDistrict}</div>
          <div>Group: {t(`populationGroups.${selectedPopulationGroup}`)}</div>
        </div>
      )}
    </div>
  );
};

export default BangkokMap;