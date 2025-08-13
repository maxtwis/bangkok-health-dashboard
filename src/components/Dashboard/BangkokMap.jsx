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

  // Define reverse indicators for proper color coding
  const reverseIndicators = new Set([
    'unemployment_rate', 'vulnerable_employment', 'food_insecurity_moderate', 'food_insecurity_severe',
    'work_injury_fatal', 'work_injury_non_fatal', 'catastrophic_health_spending_household',
    'health_spending_over_10_percent', 'health_spending_over_25_percent', 'medical_consultation_skip_cost',
    'medical_treatment_skip_cost', 'prescribed_medicine_skip_cost', 'housing_overcrowding',
    'disaster_experience', 'violence_physical', 'violence_psychological', 'violence_sexual',
    'discrimination_experience', 'community_murder', 'alcohol_consumption', 'tobacco_use', 'obesity',
    'any_chronic_disease', 'diabetes', 'hypertension', 'gout', 'chronic_kidney_disease', 'cancer',
    'high_cholesterol', 'ischemic_heart_disease', 'liver_disease', 'stroke', 'hiv', 'mental_health',
    'allergies', 'bone_joint_disease', 'respiratory_disease', 'emphysema', 'anemia', 'stomach_ulcer',
    'epilepsy', 'intestinal_disease', 'paralysis', 'dementia', 'cardiovascular_diseases',
    'metabolic_diseases', 'multiple_chronic_conditions'
  ]);

  // Load GeoJSON data
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/district.geojson');
        if (!response.ok) {
          throw new Error('Could not load district GeoJSON data');
        }
        const data = await response.json();
        setGeoJsonData(data);
      } catch (error) {
        console.error('Error loading GeoJSON:', error);
      } finally {
        setLoading(false);
      }
    };

    loadGeoJSON();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

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

    return () => {
      if (mapInstanceRef.current) {
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
  };

  // Get opacity based on sample size
  const getDistrictOpacity = (districtName) => {
    if (!getIndicatorData || districtName === 'Bangkok Overall') return 0.3;
    
    const indicatorData = getIndicatorData(selectedDomain, districtName, selectedPopulationGroup);
    const domainScore = indicatorData.find(item => item.isDomainScore);
    
    if (!domainScore) return 0.3;
    
    // Opacity based on sample size reliability
    if (domainScore.sample_size >= 50) return 0.8;
    if (domainScore.sample_size >= 20) return 0.6;
    if (domainScore.sample_size >= 10) return 0.4;
    return 0.2;
  };

  // Update map layer when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || !geoJsonData) return;

    // Remove existing layer
    if (geoJsonLayerRef.current) {
      mapInstanceRef.current.removeLayer(geoJsonLayerRef.current);
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

  }, [geoJsonData, selectedDomain, selectedPopulationGroup, selectedDistrict, getIndicatorData, onDistrictClick, t, language]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{language === 'th' ? 'กำลังโหลดแผนที่...' : 'Loading map...'}</p>
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
                <span>less than 60% ({language === 'th' ? 'แย่' : 'Poor'})</span>
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
                <span>less than 40% ({language === 'th' ? 'แย่' : 'Poor'})</span>
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
    </div>
  );
};

export default BangkokMap;