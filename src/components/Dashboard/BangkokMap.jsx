import React, { useEffect, useRef, useState } from 'react';
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
  const [geoJsonData, setGeoJsonData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initStatus, setInitStatus] = useState('pending');

  // District code mapping
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

  // Force initialize map immediately after component mounts
  useEffect(() => {
    const forceInitMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      console.log('🚀 FORCE initializing map...');
      setInitStatus('initializing');
      
      try {
        // Check container dimensions
        const rect = mapRef.current.getBoundingClientRect();
        console.log('📏 Container rect:', rect);
        
        if (rect.width === 0 || rect.height === 0) {
          console.warn('⚠️ Container has zero dimensions, but proceeding anyway...');
        }

        // Create map with basic settings
        const map = L.map(mapRef.current, {
          center: [13.7563, 100.5018],
          zoom: 10,
          zoomControl: true,
          attributionControl: true
        });
        
        console.log('📍 Map object created');

        // Add tiles immediately
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18
        });

        tileLayer.addTo(map);
        console.log('🔲 Tile layer added');

        // Store map reference
        mapInstanceRef.current = map;
        
        // Force size calculations
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize(true);
            console.log('🔄 Map size invalidated');
            setInitStatus('ready');
          }
        }, 100);

        console.log('✅ Map force-initialized successfully');
        
      } catch (err) {
        console.error('❌ Force init error:', err);
        setError(`Map initialization failed: ${err.message}`);
        setInitStatus('failed');
      }
    };

    // Multiple attempts to initialize
    let attempts = 0;
    const maxAttempts = 3;
    
    const tryInit = () => {
      attempts++;
      console.log(`🔄 Init attempt ${attempts}/${maxAttempts}`);
      
      if (mapRef.current && !mapInstanceRef.current) {
        forceInitMap();
      } else if (attempts < maxAttempts) {
        setTimeout(tryInit, 200);
      } else {
        console.error('❌ Max init attempts reached');
        setInitStatus('failed');
        setError('Failed to initialize map after multiple attempts');
      }
    };

    // Start initialization attempts
    setTimeout(tryInit, 100);

    return () => {
      if (mapInstanceRef.current) {
        console.log('🧹 Cleaning up map');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setInitStatus('pending');
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

  // Update map layers (simplified)
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonData || initStatus !== 'ready') {
      console.log('⏳ Waiting for:', {
        hasMap: !!mapInstanceRef.current,
        hasData: !!geoJsonData,
        initStatus
      });
      return;
    }

    console.log('🗺️ Adding districts to map...');

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
            layer.bindPopup(`<strong>${districtName}</strong><br/><small>Click to select</small>`);
            
            layer.on('click', () => {
              console.log('🖱️ Clicked:', districtName);
              if (onDistrictClick) {
                onDistrictClick(districtName);
              }
            });
          }
        }
      });

      layer.addTo(mapInstanceRef.current);
      geoJsonLayerRef.current = layer;
      
      // Fit bounds
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
      }
      
      console.log('✅ Districts added to map');
      
    } catch (err) {
      console.error('❌ Layer error:', err);
    }

  }, [geoJsonData, selectedDomain, selectedPopulationGroup, selectedDistrict, getIndicatorData, onDistrictClick, initStatus]);

  // Show loading state
  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  // Show error state
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
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Map container with explicit sizing */}
      <div 
        ref={mapRef} 
        className="absolute inset-0 w-full h-full"
        style={{ 
          minHeight: '400px',
          minWidth: '300px'
        }}
      />
      
      {/* Status overlay */}
      {initStatus !== 'ready' && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-[2000]">
          <div className="text-center p-6">
            {initStatus === 'initializing' && (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Initializing map...</p>
              </>
            )}
            {initStatus === 'failed' && (
              <>
                <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-red-600">Map failed to initialize</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded"
                >
                  Retry
                </button>
              </>
            )}
            {initStatus === 'pending' && (
              <>
                <div className="animate-pulse w-8 h-8 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Preparing map...</p>
              </>
            )}
          </div>
        </div>
      )}
      
      {/* Legend (only show when ready) */}
      {initStatus === 'ready' && (
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
              <span>Very Poor (40%)</span>
            </div>
          </div>
        </div>
      )}
      
      {/* Selection info (only show when ready) */}
      {initStatus === 'ready' && (
        <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-lg p-3 text-xs z-[1000]">
          <div className="font-medium mb-1">Current Selection</div>
          <div>District: {selectedDistrict === 'Bangkok Overall' && language === 'th' ? 'ภาพรวม 50 เขต' : selectedDistrict}</div>
          <div>Group: {t(`populationGroups.${selectedPopulationGroup}`)}</div>
        </div>
      )}

      {/* Debug status */}
      <div className="absolute top-4 left-4 bg-yellow-50 border border-yellow-200 rounded p-2 text-xs z-[1000]">
        <div>Status: {initStatus}</div>
        <div>Data: {geoJsonData ? '✅' : '⏳'}</div>
        <div>Map: {mapInstanceRef.current ? '✅' : '⏳'}</div>
      </div>
    </div>
  );
};

export default BangkokMap;