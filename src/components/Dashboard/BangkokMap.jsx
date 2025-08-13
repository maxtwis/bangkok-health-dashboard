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
  const [mapReady, setMapReady] = useState(false);

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
        
        // Validate GeoJSON
        if (!data.features || data.features.length === 0) {
          throw new Error('GeoJSON contains no features');
        }
        
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

  // Initialize map with proper timing
  useEffect(() => {
    // Wait for DOM to be ready
    const initializeMap = () => {
      if (!mapRef.current || mapInstanceRef.current) return;

      console.log('🗺️ Initializing map...');
      console.log('Map container dimensions:', {
        width: mapRef.current.offsetWidth,
        height: mapRef.current.offsetHeight,
        clientWidth: mapRef.current.clientWidth,
        clientHeight: mapRef.current.clientHeight
      });
      
      try {
        // Create map with explicit size validation
        if (mapRef.current.offsetHeight === 0 || mapRef.current.offsetWidth === 0) {
          console.warn('⚠️ Map container has zero dimensions!');
          setError('Map container has zero dimensions. Check CSS height/width.');
          return;
        }

        const map = L.map(mapRef.current, {
          center: [13.7563, 100.5018], // Bangkok center
          zoom: 10,
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true,
          touchZoom: true,
          boxZoom: true,
          keyboard: true
        });
        
        // Add tile layer with error handling
        const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 18,
          errorTileUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjI1NiIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIxOHB4IiBmaWxsPSIjOTk5Ij5ObyBUaWxlPC90ZXh0Pjwvc3ZnPg=='
        });

        tileLayer.addTo(map);
        
        // Event listeners for debugging
        map.on('load', () => {
          console.log('✅ Map load event fired');
          setMapReady(true);
        });

        map.on('ready', () => {
          console.log('✅ Map ready event fired');
          setMapReady(true);
        });

        tileLayer.on('loading', () => {
          console.log('🔄 Tiles loading...');
        });

        tileLayer.on('load', () => {
          console.log('✅ Tiles loaded');
          setMapReady(true);
        });

        tileLayer.on('tileerror', (e) => {
          console.warn('⚠️ Tile load error:', e);
        });

        mapInstanceRef.current = map;
        console.log('✅ Map initialized successfully');
        
        // Force invalidate size after a short delay
        setTimeout(() => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
            console.log('🔄 Map size invalidated');
            setMapReady(true);
          }
        }, 100);
        
      } catch (err) {
        console.error('❌ Map initialization error:', err);
        setError(`Map failed to initialize: ${err.message}`);
      }
    };

    // Use timeout to ensure DOM is ready
    const timer = setTimeout(initializeMap, 50);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        console.log('🧹 Cleaning up map');
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
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
      
      // Color based on score 
      if (score >= 80) return '#10b981'; // Green
      if (score >= 60) return '#f59e0b'; // Yellow
      if (score >= 40) return '#f97316'; // Orange
      return '#ef4444'; // Red
      
    } catch (err) {
      console.error('Error getting color for district:', districtName, err);
      return '#94a3b8';
    }
  };

  // Update map when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonData || !mapReady) {
      console.log('⏳ Waiting for map to be ready...', {
        hasMap: !!mapInstanceRef.current,
        hasData: !!geoJsonData,
        mapReady
      });
      return;
    }

    console.log('🗺️ Updating map layer...');

    try {
      // Remove old layer
      if (geoJsonLayerRef.current) {
        mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
        console.log('🗑️ Removed old layer');
      }

      // Add new layer
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
            // Add popup
            layer.bindPopup(`
              <div style="font-size: 14px; padding: 4px;">
                <strong>${districtName}</strong><br/>
                <small>Click to select this district</small>
              </div>
            `);
            
            // Add click handler
            layer.on('click', () => {
              console.log('🖱️ District clicked:', districtName);
              if (onDistrictClick) {
                onDistrictClick(districtName);
              }
            });

            // Add hover effects
            layer.on('mouseover', function() {
              this.setStyle({
                weight: 3,
                fillOpacity: 0.9
              });
            });

            layer.on('mouseout', function() {
              this.setStyle({
                weight: selectedDistrict === districtName ? 3 : 1,
                fillOpacity: 0.7
              });
            });
          }
        }
      });

      layer.addTo(mapInstanceRef.current);
      geoJsonLayerRef.current = layer;
      
      // Fit to bounds with padding
      const bounds = layer.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [20, 20] });
        console.log('✅ Map fitted to bounds');
      }
      
      console.log('✅ Map layer updated with', geoJsonData.features.length, 'districts');
      
    } catch (err) {
      console.error('❌ Layer update error:', err);
      setError(`Failed to update map: ${err.message}`);
    }

  }, [geoJsonData, selectedDomain, selectedPopulationGroup, selectedDistrict, getIndicatorData, onDistrictClick, mapReady]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Bangkok Map...</p>
        </div>
      </div>
    );
  }

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
          <div className="text-xs text-left bg-gray-100 p-3 rounded max-w-sm">
            <p><strong>Common fixes:</strong></p>
            <p>• Check parent container has fixed height</p>
            <p>• Ensure CSS is properly loaded</p>
            <p>• Try refreshing the page</p>
            <p>• Check browser console for errors</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Map container with explicit sizing */}
      <div 
        ref={mapRef} 
        className="absolute inset-0"
        style={{ 
          width: '100%', 
          height: '100%',
          minHeight: '400px'
        }}
      />
      
      {/* Loading overlay */}
      {!mapReady && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Initializing map...</p>
          </div>
        </div>
      )}
      
      {/* Legend */}
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
      
      {/* Selection info */}
      <div className="absolute top-4 right-4 bg-white bg-opacity-95 backdrop-blur rounded-lg shadow-lg p-3 text-xs z-[1000]">
        <div className="font-medium mb-1">Current Selection</div>
        <div>District: {selectedDistrict === 'Bangkok Overall' && language === 'th' ? 'ภาพรวม 50 เขต' : selectedDistrict}</div>
        <div>Group: {t(`populationGroups.${selectedPopulationGroup}`)}</div>
      </div>

      {/* Debug info (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded p-2 text-xs z-[1000]">
          <div>Map Ready: {mapReady ? '✅' : '⏳'}</div>
          <div>Data: {geoJsonData ? `✅ ${geoJsonData.features?.length} districts` : '⏳'}</div>
          <div>Container: {mapRef.current ? `${mapRef.current.offsetWidth}x${mapRef.current.offsetHeight}` : 'Not found'}</div>
        </div>
      )}
    </div>
  );
};

export default BangkokMap;