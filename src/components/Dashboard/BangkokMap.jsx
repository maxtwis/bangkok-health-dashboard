import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

// Conditional loading of Leaflet
let L = null;
try {
  L = require('leaflet');
  require('leaflet/dist/leaflet.css');
  
  // Fix for default markers in Leaflet with bundlers
  if (L && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
} catch (error) {
  console.error('Failed to load Leaflet:', error);
}

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
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugInfo, setDebugInfo] = useState([]);

  // Add debug logging
  const addDebugLog = (message) => {
    console.log(`[BangkokMap] ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  // District code mapping (same as in BasicSDHEProcessor)
  const districtCodeMap = {
    1001: "พระนคร", 1002: "ดุสิต", 1003: "หนองจอก", 1004: "บางรัก",
    1005: "บางเขน", 1006: "บางกะปิ", 1007: "ปทุมวัน", 1008: "ป้อมปราบศัตรูพ่าย",
    1009: "พระโขนง", 1010: "มีนบุรี", 1011: "ลาดกระบัง", 1012: "ยานนาวา",
    1013: "สัมพันธวงศ์", 1014: "พญาไท", 1015: "ธนบุรี", 1016: "บางกอกใหญ่",
    1017: "ห้วยขวาง", 1018: "คลองสาน", 1019: "ตลิ่งชัน", 1020: "บางกอกน้อย",
    1021: "บางขุนเทียน", 1022: "ภาษีเจริญ", 1023: "หนองแขม", 1024: "ราษฏร์บูรณะ",
    1025: "บางพลัด", 1026: "ดินแดง", 1027: "บึงกุ่ม", 1028: "สาทร",
    1029: "บางซื่อ", 1030: "จตุจักร", 1031: "บางคอแหลม", 1032: "ประเวศ",
    1033: "คลองเตย", 1034: "สวนหลวง", 1035: "จอมทอง", 1036: "ดอนเมือง",
    1037: "ราชเทวี", 1038: "ลาดพร้าว", 1039: "วัฒนา", 1040: "บางแค",
    1041: "หลักสี่", 1042: "สายไหม", 1043: "คันนายาว", 1044: "สะพานสูง",
    1045: "วังทองหลาง", 1046: "คลองสามวา", 1047: "บางนา", 1048: "ทวีวัฒนา",
    1049: "ทุ่งครุ", 1050: "บางบอน"
  };

  // Check if Leaflet is available
  useEffect(() => {
    if (!L) {
      setError('Leaflet library not found. Please install leaflet: npm install leaflet');
      setLoading(false);
      addDebugLog('Leaflet library not available');
      return;
    }
    addDebugLog('Leaflet library loaded successfully');
  }, []);

  // Load GeoJSON data
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        setLoading(true);
        addDebugLog('Starting to load GeoJSON data...');
        
        const response = await fetch('/data/district.geojson');
        addDebugLog(`GeoJSON fetch response status: ${response.status}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Could not load district.geojson from /public/data/ folder`);
        }
        
        const data = await response.json();
        addDebugLog(`GeoJSON loaded: ${data.features?.length || 0} features`);
        
        // Validate GeoJSON structure
        if (!data.type || data.type !== 'FeatureCollection') {
          throw new Error('Invalid GeoJSON: missing FeatureCollection type');
        }
        
        if (!data.features || !Array.isArray(data.features)) {
          throw new Error('Invalid GeoJSON: missing or invalid features array');
        }
        
        // Check if features have the expected structure
        const sampleFeature = data.features[0];
        if (sampleFeature && (!sampleFeature.properties || !sampleFeature.properties.dcode)) {
          addDebugLog('Warning: Features may be missing dcode property');
        }
        
        setGeoJsonData(data);
        addDebugLog('GeoJSON data set successfully');
        
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
        setError(error.message);
        addDebugLog(`Error loading GeoJSON: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current || !L) {
      addDebugLog('Skipping map initialization - missing requirements');
      return;
    }

    try {
      addDebugLog('Initializing Leaflet map...');
      
      const map = L.map(mapRef.current, {
        center: [13.7563, 100.5018], // Bangkok center
        zoom: 10,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
      });

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
      }).addTo(map);

      mapInstanceRef.current = map;
      addDebugLog('Map initialized successfully');

    } catch (error) {
      console.error('Error initializing map:', error);
      setError(`Map initialization failed: ${error.message}`);
      addDebugLog(`Error initializing map: ${error.message}`);
    }

    return () => {
      if (mapInstanceRef.current) {
        addDebugLog('Cleaning up map instance');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Get color for district based on domain score
  const getDistrictColor = (districtName) => {
    if (!getIndicatorData || districtName === 'Bangkok Overall') {
      return '#94a3b8'; // Gray for no data
    }

    try {
      const indicatorData = getIndicatorData(selectedDomain, districtName, selectedPopulationGroup);
      const domainScore = indicatorData.find(item => item.isDomainScore);
      
      if (!domainScore || domainScore.sample_size < 5) {
        return '#e2e8f0'; // Light gray for insufficient data
      }

      const score = domainScore.value;
      const isDomainReverse = selectedDomain === 'health_outcomes';

      // Color scale based on performance
      if (isDomainReverse) {
        // For health outcomes (diseases), lower is better
        if (score <= 20) return '#10b981'; // Green (good - low disease)
        if (score <= 40) return '#f59e0b'; // Yellow
        if (score <= 60) return '#f97316'; // Orange  
        return '#ef4444'; // Red (bad - high disease)
      } else {
        // For other domains, higher is better
        if (score >= 80) return '#10b981'; // Green (good)
        if (score >= 60) return '#f59e0b'; // Yellow
        if (score >= 40) return '#f97316'; // Orange
        return '#ef4444'; // Red (poor)
      }
    } catch (error) {
      console.error('Error getting district color:', error);
      return '#94a3b8';
    }
  };

  // Get opacity based on sample size
  const getDistrictOpacity = (districtName) => {
    if (!getIndicatorData || districtName === 'Bangkok Overall') return 0.3;
    
    try {
      const indicatorData = getIndicatorData(selectedDomain, districtName, selectedPopulationGroup);
      const domainScore = indicatorData.find(item => item.isDomainScore);
      
      if (!domainScore) return 0.3;
      
      // Opacity based on sample size reliability
      if (domainScore.sample_size >= 50) return 0.8;
      if (domainScore.sample_size >= 20) return 0.6;
      if (domainScore.sample_size >= 10) return 0.4;
      return 0.2;
    } catch (error) {
      console.error('Error getting district opacity:', error);
      return 0.3;
    }
  };

  // Update map layer when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonData || !L) {
      addDebugLog('Skipping map layer update - missing requirements');
      return;
    }

    try {
      addDebugLog('Updating map layer...');

      // Remove existing layer
      if (geoJsonLayerRef.current) {
        mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
        addDebugLog('Removed existing GeoJSON layer');
      }

      // Create new GeoJSON layer
      const geoJsonLayer = L.geoJSON(geoJsonData, {
        style: (feature) => {
          const dcode = feature.properties.dcode;
          const districtName = districtCodeMap[dcode];
          
          return {
            fillColor: getDistrictColor(districtName),
            weight: selectedDistrict === districtName ? 3 : 1,
            opacity: 1,
            color: selectedDistrict === districtName ? '#1f2937' : '#64748b',
            dashArray: '',
            fillOpacity: getDistrictOpacity(districtName)
          };
        },
        onEachFeature: (feature, layer) => {
          const dcode = feature.properties.dcode;
          const districtName = districtCodeMap[dcode];
          
          if (districtName) {
            // Get district data for tooltip
            const indicatorData = getIndicatorData ? 
              getIndicatorData(selectedDomain, districtName, selectedPopulationGroup) : [];
            const domainScore = indicatorData.find(item => item.isDomainScore);
            
            const score = domainScore ? domainScore.value.toFixed(1) : 'N/A';
            const sampleSize = domainScore ? domainScore.sample_size : 0;
            
            // Create popup content
            const popupContent = `
              <div class="text-sm">
                <div class="font-medium text-gray-900 mb-2">${districtName}</div>
                <div class="space-y-1">
                  <div><span class="text-gray-600">${t(`domains.${selectedDomain}`)}:</span> <span class="font-medium">${score}%</span></div>
                  <div><span class="text-gray-600">${t(`populationGroups.${selectedPopulationGroup}`)}:</span> <span class="font-medium">${sampleSize} ${language === 'th' ? 'คน' : 'people'}</span></div>
                </div>
                <div class="mt-2 text-xs text-gray-500">
                  ${language === 'th' ? 'คลิกเพื่อเลือกเขต' : 'Click to select district'}
                </div>
              </div>
            `;
            
            layer.bindPopup(popupContent);
            
            // Click handler
            layer.on('click', () => {
              if (onDistrictClick) {
                onDistrictClick(districtName);
              }
            });
            
            // Hover effects
            layer.on('mouseover', function(e) {
              const layer = e.target;
              layer.setStyle({
                weight: 3,
                color: '#1f2937',
                dashArray: '',
                fillOpacity: 0.8
              });
              layer.bringToFront();
            });
            
            layer.on('mouseout', function(e) {
              const layer = e.target;
              layer.setStyle({
                weight: selectedDistrict === districtName ? 3 : 1,
                color: selectedDistrict === districtName ? '#1f2937' : '#64748b',
                fillOpacity: getDistrictOpacity(districtName)
              });
            });
          }
        }
      });

      geoJsonLayer.addTo(mapInstanceRef.current);
      geoJsonLayerRef.current = geoJsonLayer;

      // Fit map to show all districts
      mapInstanceRef.current.fitBounds(geoJsonLayer.getBounds(), { padding: [10, 10] });
      
      addDebugLog(`Map layer updated with ${geoJsonData.features.length} features`);

    } catch (error) {
      console.error('Error updating map layer:', error);
      setError(`Map layer update failed: ${error.message}`);
      addDebugLog(`Error updating map layer: ${error.message}`);
    }

  }, [geoJsonData, selectedDomain, selectedPopulationGroup, selectedDistrict, getIndicatorData, onDistrictClick, t, language]);

  // If Leaflet is not available, show installation instructions
  if (!L) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Leaflet Not Installed</h3>
          <p className="text-gray-600 mb-4">Please install Leaflet to use the map feature:</p>
          <code className="bg-gray-100 px-3 py-1 rounded text-sm">npm install leaflet</code>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-gray-50 rounded-lg p-6">
        <div className="text-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Map Loading Error</h3>
          <p className="text-red-600 mb-4 text-sm">{error}</p>
          
          <div className="text-left bg-gray-100 rounded p-3 text-xs">
            <p className="font-medium mb-2">Troubleshooting:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Ensure <code>district.geojson</code> is in <code>/public/data/</code></li>
              <li>Check if Leaflet is installed: <code>npm install leaflet</code></li>
              <li>Verify GeoJSON file has proper structure</li>
              <li>Check browser console for more details</li>
            </ul>
          </div>
        </div>
        
        {/* Debug Information */}
        <details className="w-full">
          <summary className="cursor-pointer text-sm text-gray-600 mb-2">Debug Information</summary>
          <div className="bg-gray-100 rounded p-2 text-xs max-h-32 overflow-y-auto">
            {debugInfo.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        </details>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'th' ? 'กำลังโหลดแผนที่...' : 'Loading map...'}</p>
          <p className="text-xs text-gray-500 mt-2">Debug logs in console</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Map container */}
      <div ref={mapRef} className="h-full w-full" />
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-lg p-3 text-xs">
        <div className="font-medium text-gray-900 mb-2">
          {t(`domains.${selectedDomain}`)} {language === 'th' ? 'คะแนน' : 'Score'}
        </div>
        <div className="space-y-1">
          {selectedDomain === 'health_outcomes' ? (
            // Reverse scale for health outcomes
            <>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-green-500 rounded"></div>
                <span>≤20% ({language === 'th' ? 'ดีมาก' : 'Excellent'})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-yellow-500 rounded"></div>
                <span>21-40% ({language === 'th' ? 'ดี' : 'Good'})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-orange-500 rounded"></div>
                <span>41-60% ({language === 'th' ? 'พอใช้' : 'Fair'})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-red-500 rounded"></div>
                <span>60% ({language === 'th' ? 'แย่' : 'Poor'})</span>
              </div>
            </>
          ) : (
            // Normal scale for other domains
            <>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-green-500 rounded"></div>
                <span>≥80% ({language === 'th' ? 'ดีมาก' : 'Excellent'})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-yellow-500 rounded"></div>
                <span>60-79% ({language === 'th' ? 'ดี' : 'Good'})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-orange-500 rounded"></div>
                <span>40-59% ({language === 'th' ? 'พอใช้' : 'Fair'})</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-3 bg-red-500 rounded"></div>
                <span>40% ({language === 'th' ? 'แย่' : 'Poor'})</span>
              </div>
            </>
          )}
          <div className="flex items-center space-x-2 mt-2 pt-2 border-t border-gray-200">
            <div className="w-4 h-3 bg-gray-300 rounded"></div>
            <span>{language === 'th' ? 'ข้อมูลไม่เพียงพอ' : 'Insufficient data'}</span>
          </div>
        </div>
      </div>
      
      {/* Current selection info */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-lg p-3 text-xs">
        <div className="font-medium text-gray-900 mb-1">
          {language === 'th' ? 'การเลือกปัจจุบัน' : 'Current Selection'}
        </div>
        <div className="space-y-1 text-gray-600">
          <div><span className="font-medium">{language === 'th' ? 'เขต:' : 'District:'}</span> {
            selectedDistrict === 'Bangkok Overall' && language === 'th' 
              ? t('ui.bangkokOverall')
              : selectedDistrict
          }</div>
          <div><span className="font-medium">{language === 'th' ? 'กลุ่ม:' : 'Group:'}</span> {t(`populationGroups.${selectedPopulationGroup}`)}</div>
        </div>
      </div>
      
      {/* Debug toggle (only show in development) */}
      {process.env.NODE_ENV === 'development' && (
        <details className="absolute bottom-4 right-4 bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-lg p-2 text-xs max-w-xs">
          <summary className="cursor-pointer">Debug ({debugInfo.length} logs)</summary>
          <div className="mt-2 max-h-32 overflow-y-auto">
            {debugInfo.slice(-10).map((log, index) => (
              <div key={index} className="text-xs text-gray-600">{log}</div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};

export default BangkokMap;