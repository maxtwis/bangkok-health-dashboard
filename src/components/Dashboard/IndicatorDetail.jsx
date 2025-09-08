import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Users, TrendingUp, Calculator, Info, Eye, Building, BarChart3, Brain } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import useIndicators from '../../hooks/useIndicators';
import { REVERSE_INDICATORS } from '../../constants/dashboardConstants';
import { INDICATOR_TYPES, getIndicatorType } from '../../constants/indicatorTypes';
import CorrelationAnalysis from './CorrelationAnalysis';

const IndicatorDetail = ({ 
  indicator, 
  domain, 
  district, 
  populationGroup, 
  indicatorType,
  onBack, 
  surveyData,
  getIndicatorData,
  healthFacilitiesData,
  healthSupplyData
}) => {
  const { t, language } = useLanguage();
  const { getIndicatorInfo, loading: indicatorDetailsLoading } = useIndicators();
  const [activeTab, setActiveTab] = useState('overview');
  
  // District code mapping for health supply data
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


  // Get indicator metadata from CSV via hook
  const indicatorInfo = useMemo(() => {
    if (indicatorDetailsLoading) {
      return {
        name: indicator,
        description: language === 'th' ? 'กำลังโหลด...' : 'Loading...',
        calculation: language === 'th' ? 'กำลังโหลด...' : 'Loading...',
        interpretation: language === 'th' ? 'กำลังโหลด...' : 'Loading...',
        target: '...',
        reverse: false
      };
    }

    const csvInfo = getIndicatorInfo(indicator, language);

    return {
      name: csvInfo.name,
      description: csvInfo.description,
      calculation: csvInfo.calculation,
      interpretation: REVERSE_INDICATORS[indicator]
        ? (language === 'th' 
            ? 'ค่าที่ต่ำกว่าแสดงถึงผลลัพธ์ที่ดีกว่า (ปัญหาน้อยกว่า)'
            : 'Lower values indicate better outcomes (fewer problems)')
        : (language === 'th' 
            ? 'ค่าที่สูงกว่าแสดงถึงผลลัพธ์ที่ดีกว่า'
            : 'Higher values indicate better outcomes'),
      target: csvInfo.target || (language === 'th' ? 'ไม่ระบุ' : 'Not specified'),
      reverse: Boolean(REVERSE_INDICATORS[indicator])
    };
  }, [indicator, language, indicatorDetailsLoading, getIndicatorInfo]);

  // Function to format healthcare supply indicator values with proper units
  const formatHealthcareSupplyValue = (value, indicator) => {
    if (value === null || value === undefined || isNaN(value)) {
      return 'N/A';
    }

    const valueNum = Number(value);
    
    // Define units for each healthcare supply indicator
    const unitMap = {
      'doctor_per_population': `${valueNum.toFixed(1)} per 1,000`,
      'nurse_per_population': `${valueNum.toFixed(1)} per 1,000`, 
      'healthworker_per_population': `${valueNum.toFixed(1)} per 10,000`,
      'community_healthworker_per_population': `${valueNum.toFixed(1)} per 1,000`,
      'health_service_access': `${valueNum.toFixed(1)} per 10,000`,
      'bed_per_population': `${valueNum.toFixed(1)} per 10,000`,
      'market_per_population': `${valueNum.toFixed(1)} per 10,000`,
      'sportfield_per_population': `${valueNum.toFixed(1)} per 1,000`
    };

    return unitMap[indicator] || `${valueNum.toFixed(1)}%`;
  };

  // Get current indicator data - use 'all' for IMD indicators
  const effectivePopulationGroup = getIndicatorType(indicator) === INDICATOR_TYPES.IMD ? 'all' : populationGroup;
  const indicatorData = getIndicatorData(domain, district, effectivePopulationGroup, indicatorType);
  const currentIndicator = indicatorData ? indicatorData.find(item => item.indicator === indicator) : null;

  // Color schemes for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];
  const ageColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc'];
  const sexColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const occupationColors = ['#dc2626', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
  const welfareColors = ['#2563eb', '#16a34a', '#eab308', '#dc2626', '#6b7280'];
  const facilityColors = ['#0ea5e9', '#06b6d4', '#14b8a6', '#10b981', '#22c55e', '#65a30d', '#84cc16', '#eab308'];

  // Calculate disaggregation data
  const disaggregationData = useMemo(() => {
    if (!indicator) return null;

    // Healthcare supply indicators - limited disaggregation
    const healthcareSupplyIndicators = [
      'doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
      'community_healthworker_per_population', 'health_service_access', 'bed_per_population'
    ];

    if (healthcareSupplyIndicators.indexOf(indicator) >= 0) {
      // Show facility type data for all healthcare supply indicators
      if (healthFacilitiesData && Array.isArray(healthFacilitiesData) && healthFacilitiesData.length > 0) {
        const facilityTypeData = calculateFacilityTypeData();
        
        return {
          age: [],
          sex: [],
          occupation: [],
          welfare: [],
          facilityType: facilityTypeData
        };
      }
      
      // If no facility data available
      return {
        age: [],
        sex: [],
        occupation: [],
        welfare: [],
        facilityType: []
      };
    }

    // For regular survey indicators, calculate full disaggregation
    if (surveyData && Array.isArray(surveyData)) {
      // Filter by district first
      let filteredData = surveyData.filter(record => {
        if (district === 'Bangkok Overall') {
          return true;
        }
        return record.district_name === district;
      });

      // Filter by population group
      filteredData = filteredData.filter(record => {
        if (populationGroup === 'elderly') {
          return record.age >= 60; 
        } else if (populationGroup === 'disabled') {
          return record.disable_status === 1; 
        } else if (populationGroup === 'informal_workers') {
          return record.occupation_status === 1 && record.occupation_contract === 0; 
        } else if (populationGroup === 'lgbtq') {
          return record.sex === 'lgbt'; 
        } else if (populationGroup === 'normal_population') {
          // Only include people who are actually classified as normal_population
          // (not LGBTQ, not elderly, not disabled, not informal workers)
          return record.sex !== 'lgbt' && 
                 record.age < 60 && 
                 record.disable_status !== 1 && 
                 !(record.occupation_status === 1 && record.occupation_contract === 0);
        }
        
        return false;
      });

      // Filter further to only include people who have the indicator
      const indicatorPositiveData = filteredData.filter(record => 
        calculateIndicatorPositive(record, indicator)
      );

      // For dental_access, we need to pass all filtered data to analyze those WITHOUT access
      // For other indicators, pass only positive data
      if (indicator === 'dental_access') {
        // Pass all filtered data for dental_access to analyze reasons for no access
        return calculateDemographicDisaggregation(filteredData, indicator);
      } else if (indicatorPositiveData.length > 0) {
        return calculateDemographicDisaggregation(indicatorPositiveData, indicator);
      } else {
        // Return null to show "No Data" message
        return null;
      }
    }

    return null;
  }, [surveyData, indicator, district, populationGroup, healthFacilitiesData, language]);

  // Calculate facility type breakdown for healthcare indicators
  function calculateFacilityTypeData() {
    // For personnel indicators, use health supply data
    const personnelIndicators = ['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 'bed_per_population'];
    
    if (personnelIndicators.includes(indicator)) {
      // Use health supply data for personnel distribution
      if (!healthSupplyData || !Array.isArray(healthSupplyData)) {
        return [];
      }

      try {
        // Filter facilities for current district
        let facilitiesForDistrict;
        if (district === 'Bangkok Overall') {
          facilitiesForDistrict = healthSupplyData;
        } else {
          facilitiesForDistrict = healthSupplyData.filter(facility => {
            return facility && districtCodeMap[facility.dcode] === district;
          });
        }

        if (!facilitiesForDistrict || facilitiesForDistrict.length === 0) {
          return [];
        }

        // Map indicator to corresponding field in health supply data
        const fieldMap = {
          'doctor_per_population': 'doctor_count',
          'nurse_per_population': 'nurse_count',
          'healthworker_per_population': 'healthworker_count',
          'bed_per_population': 'bed_count'
        };
        const countField = fieldMap[indicator];

        // Group by facility type and sum personnel counts
        const typeGroups = {};
        facilitiesForDistrict.forEach((facility) => {
          if (facility && facility.HTYPE) {
            const type = facility.HTYPE;
            if (!typeGroups[type]) {
              typeGroups[type] = 0;
            }
            const count = parseInt(facility[countField]) || 0;
            typeGroups[type] += count;
          }
        });

        // Convert to chart data
        const facilityTypeMap = {
          'โรงพยาบาลทั่วไป': language === 'th' ? 'โรงพยาบาลทั่วไป' : 'General Hospital',
          'โรงพยาบาลศูนย์': language === 'th' ? 'โรงพยาบาลศูนย์' : 'Regional Hospital',
          'โรงพยาบาลชุมชน': language === 'th' ? 'โรงพยาบาลชุมชน' : 'Community Hospital',
          'ศูนย์บริการสาธารณสุข': language === 'th' ? 'ศูนย์บริการสาธารณสุข' : 'Public Health Service Center',
          'คลินิก': language === 'th' ? 'คลินิก' : 'Clinic',
          'สถานพยาบาลเอกชน': language === 'th' ? 'สถานพยาบาลเอกชน' : 'Private Healthcare Facility',
          'โรงพยาบาลเอกชน': language === 'th' ? 'โรงพยาบาลเอกชน' : 'Private Hospital'
        };

        const totalCount = Object.values(typeGroups).reduce((sum, count) => sum + count, 0);

        const result = Object.keys(typeGroups).map((type, index) => {
          const count = typeGroups[type];
          const percentage = totalCount > 0 ? (count / totalCount) * 100 : 0;
          
          return {
            name: facilityTypeMap[type] || type,
            value: count,
            percentage: percentage,
            fill: COLORS[index % COLORS.length]
          };
        }).sort((a, b) => b.value - a.value);

        return result;
      } catch (err) {
        console.error('Error calculating personnel facility type data:', err);
        return [];
      }
    }
    
    // For regular facility indicators, use existing logic
    if (!healthFacilitiesData || !Array.isArray(healthFacilitiesData)) {
      return [];
    }

    try {
      // Filter facilities for current district
      let facilitiesForDistrict;
      if (district === 'Bangkok Overall') {
        facilitiesForDistrict = healthFacilitiesData;
      } else {
        facilitiesForDistrict = healthFacilitiesData.filter(facility => {
          return facility && facility.dname === district;
        });
      }

      if (!facilitiesForDistrict || facilitiesForDistrict.length === 0) {
        return [];
      }

      // Group by facility type
      const typeGroups = {};
      facilitiesForDistrict.forEach((facility) => {
        if (facility && facility.type) {
          const type = facility.type;
          if (!typeGroups[type]) {
            typeGroups[type] = [];
          }
          typeGroups[type].push(facility);
        }
      });

      // Convert to chart data with correct Thai translations
      const facilityTypeMap = {
        // Handle string values from CSV
        'clinic': language === 'th' ? 'คลินิกเอกชน' : 'Private Clinic',
        'community_healthcenter': language === 'th' ? 'ศูนย์สุขภาพชุมชน' : 'Community Health Center',
        'healthcenter': language === 'th' ? 'ศูนย์บริการสาธารณสุข' : 'Public Health Service Center',
        'hospital_private': language === 'th' ? 'โรงพยาบาลเอกชน' : 'Private Hospital',
        'hospital_public': language === 'th' ? 'โรงพยาบาลรัฐ' : 'Public Hospital',
        'pharmacy_nhso': language === 'th' ? 'ร้านยาคุณภาพ (สปสช.)' : 'Quality Pharmacy (NHSO)',
        // Also handle numeric values as fallback
        '1': language === 'th' ? 'คลินิกเอกชน' : 'Private Clinic',
        '2': language === 'th' ? 'ศูนย์สุขภาพชุมชน' : 'Community Health Center', 
        '3': language === 'th' ? 'ศูนย์บริการสาธารณสุข' : 'Public Health Service Center',
        '4': language === 'th' ? 'โรงพยาบาลเอกชน' : 'Private Hospital',
        '5': language === 'th' ? 'โรงพยาบาลรัฐ' : 'Public Hospital',
        '6': language === 'th' ? 'ร้านยาคุณภาพ (สปสช.)' : 'Quality Pharmacy (NHSO)',
        1: language === 'th' ? 'คลินิกเอกชน' : 'Private Clinic',
        2: language === 'th' ? 'ศูนย์สุขภาพชุมชน' : 'Community Health Center',
        3: language === 'th' ? 'ศูนย์บริการสาธารณสุข' : 'Public Health Service Center',
        4: language === 'th' ? 'โรงพยาบาลเอกชน' : 'Private Hospital',
        5: language === 'th' ? 'โรงพยาบาลรัฐ' : 'Public Hospital',
        6: language === 'th' ? 'ร้านยาคุณภาพ (สปสช.)' : 'Quality Pharmacy (NHSO)'
      };

      const totalFacilities = facilitiesForDistrict.length;
      // Use approximate population - this should ideally come from district population data
      const approximatePopulation = 100000; // ~100k people per district average in Bangkok

      const result = Object.keys(typeGroups).map((type, index) => {
        const count = typeGroups[type].length;
        const percentage = totalFacilities > 0 ? (count / totalFacilities) * 100 : 0;
        const facilitiesPer10k = approximatePopulation > 0 ? (count / approximatePopulation) * 10000 : 0;
        
        return {
          name: facilityTypeMap[type] || type, // Fallback to original type name if not found
          value: count,
          percentage: percentage,
          facilitiesPer10k: facilitiesPer10k,
          fill: COLORS[index % COLORS.length]
        };
      }).sort((a, b) => b.value - a.value);

      return result;
      
    } catch (error) {
      return [];
    }
  }

  // Calculate demographic disaggregation for survey indicators
  function calculateDemographicDisaggregation(records, indicatorName = indicator) {
    if (!records || records.length === 0) return null;

    // Classification functions
    const getAgeGroup = (age) => {
      if (age < 18) return '< 18';
      if (age < 30) return '18-29';
      if (age < 45) return '30-44';
      if (age < 60) return '45-59';
      return '60+';
    };

    // FIXED: Order age groups in ascending order
    const ageGroupOrder = ['< 18', '18-29', '30-44', '45-59', '60+'];

    // Add freelance type classification for vulnerable_employment indicator
    const getFreelanceType = (occupationFreelanceType) => {
      const freelanceTypes = {
        1: language === 'th' ? 'รับจ้างทั่วไป' : 'General Labor',
        2: language === 'th' ? 'ขายของออนไลน์' : 'Online Seller',
        3: language === 'th' ? 'ไรเดอร์' : 'Rider',
        4: language === 'th' ? 'วินมอเตอร์ไซต์' : 'Motorcycle Taxi',
        5: language === 'th' ? 'ค้าขาย' : 'Trading',
        6: language === 'th' ? 'ผู้ค้าหาบเร่แผงลอย' : 'Street Vendor'
      };
      return freelanceTypes[occupationFreelanceType] || (language === 'th' ? 'ไม่ระบุ' : 'Not specified');
    };

    const getDiscriminationType = (discriminationValue) => {
      const discriminationTypes = {
        1: language === 'th' ? 'เชื้อชาติ' : 'Race/Ethnicity',
        2: language === 'th' ? 'ศาสนา' : 'Religion',
        3: language === 'th' ? 'เพศ' : 'Gender',
        4: language === 'th' ? 'อายุ' : 'Age',
        5: language === 'th' ? 'สถานะทางเศรษฐกิจ' : 'Economic Status',
        6: language === 'th' ? 'อื่น ๆ' : 'Others'
      };
      return discriminationTypes[discriminationValue] || (language === 'th' ? 'ไม่ระบุ' : 'Not specified');
    };

    const getDisasterType = (disasterValue) => {
      const disasterTypes = {
        1: language === 'th' ? 'น้ำท่วม' : 'Flooding',
        2: language === 'th' ? 'อากาศร้อนจัด' : 'Extreme Heat',
        3: language === 'th' ? 'อากาศเย็นจัด' : 'Extreme Cold',
        4: language === 'th' ? 'ไฟไหม้' : 'Fire',
        5: language === 'th' ? 'แผ่นดินไหว' : 'Earthquake',
        6: language === 'th' ? 'โรคระบาด' : 'Epidemic',
        7: language === 'th' ? 'หลุมยุบ' : 'Sinkhole',
        8: language === 'th' ? 'มลพิษ (ฝุ่น)' : 'Pollution (Dust)'
      };
      return disasterTypes[disasterValue] || (language === 'th' ? 'ไม่ระบุ' : 'Not specified');
    };

    // Add oral health access reason classification
    const getOralHealthReason = (reasonText) => {
      if (!reasonText || reasonText === '') {
        return language === 'th' ? 'ไม่ระบุเหตุผล' : 'No reason specified';
      }
      
      const textLower = reasonText.toString().toLowerCase();
      
      // Check for "too expensive" keywords (แพง, สูง, ค่า, เงิน)
      if (textLower.includes('แพง') || textLower.includes('สูง') || textLower.includes('ค่า') || textLower.includes('เงิน')) {
        return language === 'th' ? 'ค่าใช้จ่ายสูง/ไม่มีเงิน' : 'Too expensive/No money';
      }
      
      // Check for "fear of dentist" keywords (กลัว)
      if (textLower.includes('กลัว')) {
        return language === 'th' ? 'กลัวหมอฟัน' : 'Fear of dentist';
      }
      
      // Check for "distance/far" keywords (เดิน, ไกล)
      if (textLower.includes('เดิน') || textLower.includes('ไกล')) {
        return language === 'th' ? 'ระยะทางไกล' : 'Too far/Distance';
      }
      
      // Check for "no time" keywords (ไม่มีเวลา)
      if (textLower.includes('ไม่มีเวลา') || textLower.includes('เวลา')) {
        return language === 'th' ? 'ไม่มีเวลา' : 'No time';
      }
      
      // Check for "long wait time" keywords (รอ, นาน, คิว)
      if (textLower.includes('รอ') || textLower.includes('นาน') || textLower.includes('คิว')) {
        return language === 'th' ? 'รอนาน/คิวยาว' : 'Long wait time';
      }
      
      // Check for "self-treatment" keywords (หาย, ยา, เอง)
      if (textLower.includes('หาย') || textLower.includes('ยา') || textLower.includes('เอง')) {
        return language === 'th' ? 'รักษาเอง/รอหายเอง' : 'Self-treatment';
      }
      
      // Other reasons
      return language === 'th' ? 'เหตุผลอื่นๆ' : 'Other reasons';
    };

    const getSexGroup = (sex) => {
      if (sex === 'lgbt') return 'LGBTQ+';
      if (sex === 'male' || sex === 'M' || sex === 1) return language === 'th' ? 'ชาย' : 'Male';
      if (sex === 'female' || sex === 'F' || sex === 2) return language === 'th' ? 'หญิง' : 'Female';
      return language === 'th' ? 'ไม่ระบุ' : 'Not specified';
    };

    // FIXED: Improved occupation group classification with proper mapping
    const getOccupationGroup = (occupationStatus, occupationType) => {
      if (occupationStatus === 0) {
        return language === 'th' ? 'ว่างงาน' : 'Unemployed';
      }
      
      if (occupationStatus === 1) {
        // Map occupation_type values properly
        if (occupationType === 1) {
          return language === 'th' ? 'รับราชการ' : 'Government Employee';
        } else if (occupationType === 2) {
          return language === 'th' ? 'รัฐวิสาหกิจ' : 'State Enterprise';
        } else if (occupationType === 3) {
          return language === 'th' ? 'พนักงานบริษัท/ลูกจ้าง' : 'Company Employee';
        } else if (occupationType === 5) {
          return language === 'th' ? 'ธุรกิจส่วนตัว' : 'Private Business';
        } else if (occupationType === 6) {
          return language === 'th' ? 'อาชีพอิสระ' : 'Freelance';
        } else {
          return language === 'th' ? 'อื่นๆ' : 'Others';
        }
      }
      
      return language === 'th' ? 'ไม่ระบุ' : 'Not specified';
    };

    // FIXED: Improved welfare group with proper mapping
    const getWelfareGroup = (welfare) => {
      if (welfare === 1) {
        return language === 'th' ? 'สิทธิสวัสดิการข้าราชการ/รัฐวิสาหกิจ' : 'Civil Servant Welfare';
      } else if (welfare === 2) {
        return language === 'th' ? 'สิทธิประกันสังคม' : 'Social Security';
      } else if (welfare === 3) {
        return language === 'th' ? 'สิทธิหลักประกันสุขภาพ 30 บาท (บัตรทอง)' : 'Universal Health Coverage (30 Baht)';
      } else if (welfare === 'other' || welfare === 'Other') {
        return language === 'th' ? 'อื่น ๆ' : 'Others';
      } else {
        return language === 'th' ? 'ไม่ระบุ' : 'Not specified';
      }
    };

    // Calculate demographic composition (population distribution) for each group
    const calculateGroupedRates = (groupFunction, records, customOrder = null) => {
      const groups = {};
      const totalRecords = records.length;
      
      // Count how many people belong to each demographic group
      records.forEach(record => {
        if (record) {
          const group = groupFunction(record);
          if (!groups[group]) {
            groups[group] = { count: 0 };
          }
          groups[group].count++;
        }
      });

      // Calculate composition percentages
      let result = Object.keys(groups).map((group, index) => ({
        name: group,
        value: totalRecords > 0 ? (groups[group].count / totalRecords) * 100 : 0, // Composition percentage
        count: groups[group].count, // Actual count
        total: totalRecords, // Total population being analyzed
        fill: COLORS[index % COLORS.length]
      }));

      // Apply custom ordering if provided
      if (customOrder) {
        result = result.sort((a, b) => {
          const aIndex = customOrder.indexOf(a.name);
          const bIndex = customOrder.indexOf(b.name);
          if (aIndex === -1 && bIndex === -1) return 0;
          if (aIndex === -1) return 1;
          if (bIndex === -1) return -1;
          return aIndex - bIndex;
        });
      }

      return result;
    };

    // For vulnerable_employment, also calculate freelance type distribution
    let freelanceType = null;
    if (indicatorName === 'vulnerable_employment') {
      // Filter only freelance workers (occupation_type === 6) who meet vulnerable employment criteria
      const freelanceRecords = records.filter(record => 
        record.occupation_status === 1 && 
        record.occupation_type === 6 &&
        record.occupation_contract === 0
      );
      
      if (freelanceRecords.length > 0) {
        freelanceType = calculateGroupedRates(
          record => getFreelanceType(record.occupation_freelance_type),
          freelanceRecords
        );
      }
    }

    // For employment indicators, calculate income and working hours
    let incomeData = null;
    let workingHoursData = null;
    
    if (indicatorName === 'vulnerable_employment' || indicatorName === 'non_vulnerable_employment') {
      // Calculate average income by type (daily vs monthly)
      // IMPORTANT: income_type=1 stores actual daily wage, income_type=2 stores actual monthly salary
      const dailyIncomeRecords = records.filter(record => record.income_type === 1 && record.income > 0);
      const monthlyIncomeRecords = records.filter(record => record.income_type === 2 && record.income > 0);
      const totalIncomeRecords = dailyIncomeRecords.length + monthlyIncomeRecords.length;
      
      incomeData = {
        daily: dailyIncomeRecords.length > 0 ? {
          average: dailyIncomeRecords.reduce((sum, r) => sum + r.income, 0) / dailyIncomeRecords.length,
          count: dailyIncomeRecords.length,
          percentage: totalIncomeRecords > 0 ? (dailyIncomeRecords.length / totalIncomeRecords * 100).toFixed(1) : 0,
          min: Math.min(...dailyIncomeRecords.map(r => r.income)),
          max: Math.max(...dailyIncomeRecords.map(r => r.income)),
          // Calculate monthly equivalent for comparison
          monthlyEquivalent: (dailyIncomeRecords.reduce((sum, r) => sum + r.income, 0) / dailyIncomeRecords.length) * 25
        } : null,
        monthly: monthlyIncomeRecords.length > 0 ? {
          average: monthlyIncomeRecords.reduce((sum, r) => sum + r.income, 0) / monthlyIncomeRecords.length,
          count: monthlyIncomeRecords.length,
          percentage: totalIncomeRecords > 0 ? (monthlyIncomeRecords.length / totalIncomeRecords * 100).toFixed(1) : 0,
          min: Math.min(...monthlyIncomeRecords.map(r => r.income)),
          max: Math.max(...monthlyIncomeRecords.map(r => r.income))
        } : null,
        totalCount: totalIncomeRecords
      };
      
      // Calculate average working hours
      const workingHoursRecords = records.filter(record => record.working_hours > 0);
      if (workingHoursRecords.length > 0) {
        workingHoursData = {
          average: workingHoursRecords.reduce((sum, r) => sum + r.working_hours, 0) / workingHoursRecords.length,
          count: workingHoursRecords.length,
          min: Math.min(...workingHoursRecords.map(r => r.working_hours)),
          max: Math.max(...workingHoursRecords.map(r => r.working_hours)),
          distribution: [
            { range: '< 6 hours', count: workingHoursRecords.filter(r => r.working_hours < 6).length },
            { range: '6-8 hours', count: workingHoursRecords.filter(r => r.working_hours >= 6 && r.working_hours <= 8).length },
            { range: '9-10 hours', count: workingHoursRecords.filter(r => r.working_hours >= 9 && r.working_hours <= 10).length },
            { range: '> 10 hours', count: workingHoursRecords.filter(r => r.working_hours > 10).length }
          ]
        };
      }
    }

    // For discrimination indicator, calculate discrimination type distribution
    let discriminationType = null;
    if (indicatorName === 'discrimination_experience') {
      // Filter only people who experienced discrimination
      const discriminationRecords = records.filter(record => 
        record.discrimination_1 === 1 || record.discrimination_2 === 1 || 
        record.discrimination_3 === 1 || record.discrimination_4 === 1 || 
        record.discrimination_5 === 1 || record.discrimination_other === 1
      );
      
      if (discriminationRecords.length > 0) {
        // Count each type of discrimination
        const discriminationCounts = [];
        for (let type = 1; type <= 5; type++) {
          const count = discriminationRecords.filter(record => record[`discrimination_${type}`] === 1).length;
          if (count > 0) {
            discriminationCounts.push({
              name: getDiscriminationType(type),
              value: count,
              rate: (count / discriminationRecords.length * 100).toFixed(1)
            });
          }
        }
        
        // Check for "other" discrimination type
        const otherCount = discriminationRecords.filter(record => record.discrimination_other === 1).length;
        if (otherCount > 0) {
          discriminationCounts.push({
            name: getDiscriminationType(6),
            value: otherCount,
            rate: (otherCount / discriminationRecords.length * 100).toFixed(1)
          });
        }
        
        discriminationType = discriminationCounts.sort((a, b) => b.value - a.value);
      }
    }

    // For disaster experience indicator, calculate disaster type distribution
    let disasterType = null;
    if (indicatorName === 'disaster_experience') {
      // Filter only people who experienced disasters
      const disasterRecords = records.filter(record => 
        record.community_disaster_1 === 1 || record.community_disaster_2 === 1 || 
        record.community_disaster_3 === 1 || record.community_disaster_4 === 1 || 
        record.community_disaster_5 === 1 || record.community_disaster_6 === 1 || 
        record.community_disaster_7 === 1 || record.community_disaster_8 === 1
      );
      
      if (disasterRecords.length > 0) {
        // Count each type of disaster
        const disasterCounts = [];
        for (let type = 1; type <= 8; type++) {
          const count = disasterRecords.filter(record => record[`community_disaster_${type}`] === 1).length;
          if (count > 0) {
            disasterCounts.push({
              name: getDisasterType(type),
              value: count,
              rate: (count / disasterRecords.length * 100).toFixed(1)
            });
          }
        }
        
        disasterType = disasterCounts.sort((a, b) => b.value - a.value);
      }
    }

    // For dental_access indicator, calculate oral health access reason distribution
    let oralHealthReason = null;
    if (indicatorName === 'dental_access') {
      // Filter only people who DON'T have access to dental care (oral_health_access === 0)
      const noAccessRecords = records.filter(record => 
        record.oral_health === 1 && record.oral_health_access === 0
      );
      
      if (noAccessRecords.length > 0) {
        // Group by reason classification
        const reasonGroups = {};
        noAccessRecords.forEach(record => {
          const reason = getOralHealthReason(record.oral_health_access_reason);
          if (!reasonGroups[reason]) {
            reasonGroups[reason] = 0;
          }
          reasonGroups[reason]++;
        });
        
        // Convert to array format for chart
        oralHealthReason = Object.entries(reasonGroups).map(([reason, count]) => ({
          name: reason,
          value: count,
          percentage: (count / noAccessRecords.length * 100).toFixed(1)
        })).sort((a, b) => b.value - a.value);
      }
    }

    return {
      age: calculateGroupedRates(record => getAgeGroup(record.age), records, ageGroupOrder),
      sex: calculateGroupedRates(record => getSexGroup(record.sex), records),
      occupation: calculateGroupedRates(record => getOccupationGroup(record.occupation_status, record.occupation_type), records),
      welfare: calculateGroupedRates(record => getWelfareGroup(record.welfare), records),
      freelanceType: freelanceType,
      income: incomeData,
      workingHours: workingHoursData,
      discriminationType: discriminationType,
      disasterType: disasterType,
      oralHealthReason: oralHealthReason
    };
  }

  // Calculate if a record meets the indicator criteria
  function calculateIndicatorPositive(record, indicator) {
    if (!record) return false;
    
    switch (indicator) {
      // Economic Security Indicators
      case 'unemployment_rate':
        return record.occupation_status === 0;
      case 'employment_rate':
        return record.occupation_status === 1;
      case 'vulnerable_employment':
        return record.occupation_status === 1 && record.occupation_contract === 0;
      case 'non_vulnerable_employment':
        return record.occupation_contract === 1;
      case 'food_insecurity_moderate':
        return record.food_insecurity_1 === 1;
      case 'food_insecurity_severe':
        return record.food_insecurity_2 === 1;
      case 'work_injury_fatal':
        return record.occupation_injury === 1;
      case 'work_injury_non_fatal':
        return record.occupation_small_injury === 1;

      // Healthcare Access Indicators
      case 'health_coverage':
        return record.welfare !== null && record.welfare !== undefined && record.welfare !== 'other';
      case 'medical_consultation_skip_cost':
        return record.medical_skip_1 === 1;
      case 'medical_treatment_skip_cost':
        return record.medical_skip_2 === 1;
      case 'prescribed_medicine_skip_cost':
        return record.medical_skip_3 === 1;
      case 'dental_access':
        return record.oral_health_access === 1;
      case 'catastrophic_health_spending_household':
        // Spending >40% of capacity to pay (using hh_health_expense for household level)
        return record.hh_health_expense && record.income && 
               (record.hh_health_expense / record.income) > 0.40;
      case 'health_spending_over_10_percent':
        // Individual spending >10% of income
        return record.health_expense && record.income && 
               (record.health_expense / record.income) > 0.10;
      case 'health_spending_over_25_percent':
        // Individual spending >25% of income
        return record.health_expense && record.income && 
               (record.health_expense / record.income) > 0.25;

      // Education Indicators
      case 'functional_literacy':
        return record.speak === 1 && record.read === 1 && record.write === 1 && record.math === 1;
      case 'primary_completion':
        return record.education >= 2;
      case 'secondary_completion':
        return record.education >= 4;
      case 'tertiary_completion':
        return record.education >= 7;
      case 'training_participation':
        return record.training === 1;

      // Physical Environment Indicators
      case 'electricity_access':
        return record.community_environment_4 !== 1;
      case 'clean_water_access':
        return record.community_environment_3 !== 1;
      case 'sanitation_facilities':
        return record.house_sink === 1;
      case 'waste_management':
        return record.community_environment_5 !== 1;
      case 'housing_overcrowding':
        return record.community_environment_1 === 1 || record.community_environment_2 === 1;
      case 'home_ownership':
        return record.house_status === 1;
      case 'disaster_experience':
        return record.community_disaster_1 === 1 || record.community_disaster_2 === 1 || 
               record.community_disaster_3 === 1 || record.community_disaster_4 === 1 ||
               record.community_disaster_5 === 1 || record.community_disaster_6 === 1 ||
               record.community_disaster_7 === 1 || record.community_disaster_8 === 1;

      // Social Context Indicators
      case 'community_safety':
        // For community_safety, we consider it "positive" if safety score >= 3 (safe/very safe)
        return record.community_safety >= 3;
      case 'violence_physical':
        return record.physical_violence === 1;
      case 'violence_psychological':
        return record.psychological_violence === 1;
      case 'violence_sexual':
        return record.sexual_violence === 1;
      case 'discrimination_experience':
        return record.discrimination_1 === 1 || record.discrimination_2 === 1 || 
               record.discrimination_3 === 1 || record.discrimination_4 === 1 || 
               record.discrimination_5 === 1 || record.discrimination_other === 1;
      case 'social_support':
        return record.helper === 1;
      case 'community_murder':
        return record.community_murder === 1;

      // Health Behaviors Indicators
      case 'alcohol_consumption':
        return record.drink_status === 1 || record.drink_status === 2;
      case 'tobacco_use':
        return record.smoke_status === 1;
      case 'physical_activity':
        // Regular exercise (exercise_status 1 = regular exercise)
        return record.exercise_status === 1;
      case 'obesity':
        // Calculate BMI and check if >= 30
        if (record.height > 0 && record.weight > 0) {
          const bmi = record.weight / Math.pow(record.height / 100, 2);
          return !isNaN(bmi) && isFinite(bmi) && bmi >= 30;
        }
        return false;

      // Health Outcomes Indicators (All diseases)
      case 'any_chronic_disease':
        return record.diseases_status === 1;
      case 'diabetes':
        return record.diseases_status === 1 && record['diseases_type/1'] === 1;
      case 'hypertension':
        return record.diseases_status === 1 && record['diseases_type/2'] === 1;
      case 'gout':
        return record.diseases_status === 1 && record['diseases_type/3'] === 1;
      case 'chronic_kidney_disease':
        return record.diseases_status === 1 && record['diseases_type/4'] === 1;
      case 'cancer':
        return record.diseases_status === 1 && record['diseases_type/5'] === 1;
      case 'high_cholesterol':
        return record.diseases_status === 1 && record['diseases_type/6'] === 1;
      case 'ischemic_heart_disease':
        return record.diseases_status === 1 && record['diseases_type/7'] === 1;
      case 'liver_disease':
        return record.diseases_status === 1 && record['diseases_type/8'] === 1;
      case 'stroke':
        return record.diseases_status === 1 && record['diseases_type/9'] === 1;
      case 'hiv':
        return record.diseases_status === 1 && record['diseases_type/10'] === 1;
      case 'mental_health':
        return record.diseases_status === 1 && record['diseases_type/11'] === 1;
      case 'allergies':
        return record.diseases_status === 1 && record['diseases_type/12'] === 1;
      case 'bone_joint_disease':
        return record.diseases_status === 1 && record['diseases_type/13'] === 1;
      case 'respiratory_disease':
        return record.diseases_status === 1 && record['diseases_type/14'] === 1;
      case 'emphysema':
        return record.diseases_status === 1 && record['diseases_type/15'] === 1;
      case 'anemia':
        return record.diseases_status === 1 && record['diseases_type/16'] === 1;
      case 'stomach_ulcer':
        return record.diseases_status === 1 && record['diseases_type/17'] === 1;
      case 'epilepsy':
        return record.diseases_status === 1 && record['diseases_type/18'] === 1;
      case 'intestinal_disease':
        return record.diseases_status === 1 && record['diseases_type/19'] === 1;
      case 'paralysis':
        return record.diseases_status === 1 && record['diseases_type/20'] === 1;
      case 'dementia':
        return record.diseases_status === 1 && record['diseases_type/21'] === 1;

      // Complex Health Outcomes (calculated indicators)
      case 'cardiovascular_diseases':
        return record.diseases_status === 1 && (
          record['diseases_type/2'] === 1 || // Hypertension
          record['diseases_type/6'] === 1 || // High cholesterol
          record['diseases_type/7'] === 1 || // Ischemic heart disease
          record['diseases_type/9'] === 1    // Stroke
        );
      case 'metabolic_diseases':
        return record.diseases_status === 1 && (
          record['diseases_type/1'] === 1 || // Diabetes
          record['diseases_type/3'] === 1 || // Gout
          record['diseases_type/6'] === 1    // High cholesterol
        );
      case 'multiple_chronic_conditions':
        if (record.diseases_status === 1) {
          const diseaseCount = Object.keys(record)
            .filter(key => key.startsWith('diseases_type/') && 
                          key !== 'diseases_type/other' && 
                          record[key] === 1)
            .length;
          return diseaseCount >= 2;
        }
        return false;

      default:
        return false;
    }
  }

  if (indicatorDetailsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {language === 'th' ? 'กำลังโหลดข้อมูลตัวชี้วัด...' : 'Loading indicator details...'}
          </h2>
        </div>
      </div>
    );
  }

  if (!currentIndicator) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {language === 'th' ? 'กลับ' : 'Back'}
          </button>
          
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">
              {language === 'th' ? 'ไม่พบข้อมูลตัวชี้วัด' : 'Indicator data not found'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {language === 'th' ? 'กลับ' : 'Back'}
          </button>
        </div>

       {/* Indicator Overview Card */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2">
              <div className="flex items-start space-x-4">
                <div className={`p-3 rounded-lg ${indicatorInfo.reverse ? 'bg-orange-100' : 'bg-blue-100'}`}>
                  {indicatorInfo.reverse ? (
                    <TrendingUp className={`w-6 h-6 ${indicatorInfo.reverse ? 'text-orange-600' : 'text-blue-600'} transform rotate-180`} />
                  ) : (
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    {indicatorInfo.name}
                  </h1>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    {getIndicatorType(indicator) !== INDICATOR_TYPES.IMD && (
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {t(`populationGroups.${populationGroup}`)}
                      </span>
                    )}
                    <span className="flex items-center">
                      <Building className="w-4 h-4 mr-1" />
                      {district}
                    </span>
                    <span className="flex items-center">
                      <BarChart3 className="w-4 h-4 mr-1" />
                      {t(`domains.${domain}`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Score */}
            <div className="flex items-center justify-center lg:justify-end">
              <div className="text-center">
                <div className={`text-4xl font-bold mb-2 ${
                  currentIndicator.value !== null 
                    ? (indicatorInfo.reverse 
                        ? (currentIndicator.value <= 20 ? 'text-green-600' : currentIndicator.value <= 40 ? 'text-yellow-600' : 'text-red-600')
                        : (currentIndicator.value >= 80 ? 'text-green-600' : currentIndicator.value >= 60 ? 'text-yellow-600' : 'text-red-600'))
                    : 'text-gray-400'
                }`}>
                  {currentIndicator.value !== null && currentIndicator.value !== undefined 
                    ? formatHealthcareSupplyValue(currentIndicator.value, indicator)
                    : 'N/A'}
                </div>
                <div className="text-sm text-gray-500 mb-1">
                  {language === 'th' ? 'คะแนน' : 'Score'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'overview', label: language === 'th' ? 'ภาพรวม' : 'Overview', icon: Eye },
                { id: 'demographics', label: language === 'th' ? 'การแยกย่อยข้อมูล' : 'Demographics', icon: Users },
                { id: 'correlations', label: language === 'th' ? 'ความสัมพันธ์' : 'Correlations', icon: Brain }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4 mr-2" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-2">
                      {language === 'th' ? 'คำอธิบาย' : 'Description'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {indicatorInfo.description}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-medium text-gray-800 mb-2">
                      {language === 'th' ? 'การตีความ' : 'Interpretation'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {indicatorInfo.interpretation}
                    </p>
                  </div>
                </div>

                {/* Calculation Method */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-medium text-gray-800 mb-2 flex items-center">
                    <Calculator className="w-4 h-4 mr-2" />
                    {language === 'th' ? 'วิธีการคำนวณ' : 'Calculation Method'}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {indicatorInfo.calculation}
                  </p>
                </div>
              </div>
            )}

            {/* Demographics Tab */}
            {activeTab === 'demographics' && (
              <div className="space-y-8">

                {/* Healthcare Supply Indicators - Facility Type Chart */}
                {['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                  'community_healthworker_per_population', 'health_service_access', 'bed_per_population'].includes(indicator) && disaggregationData?.facilityType && disaggregationData.facilityType.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {language === 'th' ? 'ตามประเภทสถานพยาบาล' : 'By Health Facility Type'}
                    </h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={disaggregationData.facilityType.sort((a, b) => b.value - a.value)}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="name" 
                            angle={-15}
                            textAnchor="end"
                            height={100}
                            tick={{ fontSize: 11 }}
                            interval={0}
                          />
                          <YAxis tickFormatter={(value) => `${value.toLocaleString()}`} />
                          <Tooltip formatter={(value) => {
                            const personnelIndicators = ['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 'bed_per_population'];
                            if (personnelIndicators.includes(indicator)) {
                              const labelMap = {
                                'doctor_per_population': language === 'th' ? 'แพทย์' : 'Doctors',
                                'nurse_per_population': language === 'th' ? 'พยาบาล' : 'Nurses',
                                'healthworker_per_population': language === 'th' ? 'บุคลากรสุขภาพ' : 'Health Workers',
                                'bed_per_population': language === 'th' ? 'เตียง' : 'Beds'
                              };
                              return [`${value.toLocaleString()}`, labelMap[indicator]];
                            }
                            return [`${value.toLocaleString()} facilities`, language === 'th' ? 'จำนวนสถานพยาบาล' : 'Facilities'];
                          }} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {disaggregationData.facilityType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={facilityColors[index % facilityColors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}

                {/* Regular Survey Indicators - Show demographic disaggregation */}
                {disaggregationData && disaggregationData.age && disaggregationData.age.length > 0 && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Age Groups */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {language === 'th' ? 'ตามกลุ่มอายุ' : 'By Age Group'}
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={disaggregationData.age}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                            <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, language === 'th' ? 'สัดส่วน' : 'Composition']} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {disaggregationData.age.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={ageColors[index % ageColors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Sex */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {language === 'th' ? 'ตามเพศ' : 'By Sex'}
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={disaggregationData.sex}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                            <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, language === 'th' ? 'สัดส่วน' : 'Composition']} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {disaggregationData.sex.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={sexColors[index % sexColors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Occupation */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {language === 'th' ? 'ตามสถานะการทำงาน' : 'By Employment Status'}
                      </h3>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={disaggregationData.occupation}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              angle={-15}
                              textAnchor="end"
                              height={100}
                              tick={{ fontSize: 11 }}
                              interval={0}
                            />
                            <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                            <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, language === 'th' ? 'สัดส่วน' : 'Composition']} />
                            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                              {disaggregationData.occupation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={occupationColors[index % occupationColors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Welfare/Insurance */}
                    {disaggregationData.welfare && disaggregationData.welfare.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          {language === 'th' ? 'ตามประเภทสิทธิประกันสุขภาพ' : 'By Health Insurance Type'}
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={disaggregationData.welfare}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="name" 
                                angle={-15}
                                textAnchor="end"
                                height={100}
                                tick={{ fontSize: 11 }}
                                interval={0}
                              />
                              <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                              <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, language === 'th' ? 'สัดส่วน' : 'Composition']} />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {disaggregationData.welfare.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={welfareColors[index % welfareColors.length]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    )}

                    {/* Freelance Type Distribution - Only for vulnerable_employment indicator */}
                    {indicator === 'vulnerable_employment' && disaggregationData.freelanceType && disaggregationData.freelanceType.length > 0 && (
                      <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          {language === 'th' ? 'ประเภทอาชีพอิสระ (เฉพาะผู้ที่อยู่ในการจ้างงานเปราะบาง)' : 'Freelance Job Types (Among Vulnerable Employment)'}
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={disaggregationData.freelanceType.sort((a, b) => b.value - a.value)}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="name" 
                                angle={-15}
                                textAnchor="end"
                                height={100}
                                tick={{ fontSize: 11 }}
                                interval={0}
                              />
                              <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                              <Tooltip 
                                formatter={(value, name, props) => [
                                  `${value.toFixed(1)}% (${props.payload.count} ${language === 'th' ? 'คน' : 'people'})`,
                                  language === 'th' ? 'สัดส่วน' : 'Proportion'
                                ]}
                              />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {disaggregationData.freelanceType.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'][index % 6]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4 text-sm text-gray-600">
                          <p className="font-medium">
                            {language === 'th' 
                              ? `จากผู้ที่อยู่ในการจ้างงานเปราะบางทั้งหมด มีผู้ประกอบอาชีพอิสระ ${disaggregationData.freelanceType.reduce((sum, item) => sum + item.count, 0)} คน`
                              : `Among all vulnerable employment, ${disaggregationData.freelanceType.reduce((sum, item) => sum + item.count, 0)} are freelance workers`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Discrimination Type Distribution - For discrimination_experience indicator */}
                    {indicator === 'discrimination_experience' && disaggregationData.discriminationType && disaggregationData.discriminationType.length > 0 && (
                      <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          {language === 'th' ? 'ประเภทการเลือกปฏิบัติ (เฉพาะผู้ที่ประสบการเลือกปฏิบัติ)' : 'Types of Discrimination (Among Those Who Experienced Discrimination)'}
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={disaggregationData.discriminationType}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="name" 
                                angle={-15}
                                textAnchor="end"
                                height={100}
                                tick={{ fontSize: 11 }}
                                interval={0}
                              />
                              <YAxis />
                              <Tooltip formatter={(value, name, props) => [
                                `${value} คน (${props.payload.rate}%)`, 
                                language === 'th' ? 'จำนวนคน' : 'Number of People'
                              ]} />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {disaggregationData.discriminationType.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'][index % 6]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">
                            {language === 'th' 
                              ? `จากผู้ที่ประสบการเลือกปฏิบัติทั้งหมด ${disaggregationData.discriminationType.reduce((sum, item) => sum + item.value, 0)} คน สามารถแบ่งตามประเภทการเลือกปฏิบัติได้ดังนี้`
                              : `Among all ${disaggregationData.discriminationType.reduce((sum, item) => sum + item.value, 0)} people who experienced discrimination, types of discrimination are as follows`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Oral Health Access Reason Distribution - For dental_access indicator */}
                    {indicator === 'dental_access' && disaggregationData.oralHealthReason && disaggregationData.oralHealthReason.length > 0 && (
                      <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          {language === 'th' ? 'เหตุผลที่ไม่เข้าถึงบริการทันตกรรม (เฉพาะผู้ที่ไม่สามารถเข้าถึง)' : 'Reasons for Not Accessing Dental Care (Among Those Without Access)'}
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={disaggregationData.oralHealthReason}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="name" 
                                angle={-15}
                                textAnchor="end"
                                height={100}
                                tick={{ fontSize: 11 }}
                                interval={0}
                              />
                              <YAxis />
                              <Tooltip formatter={(value, name, props) => [
                                `${value} คน (${props.payload.percentage}%)`,
                                language === 'th' ? 'จำนวนคน' : 'Number of People'
                              ]} />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {disaggregationData.oralHealthReason.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6'][index % 7]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">
                            {language === 'th' 
                              ? `จากผู้ที่ต้องการบริการทันตกรรมแต่ไม่สามารถเข้าถึงได้ ${disaggregationData.oralHealthReason.reduce((sum, item) => sum + item.value, 0)} คน แบ่งตามเหตุผลหลักได้ดังนี้`
                              : `Among ${disaggregationData.oralHealthReason.reduce((sum, item) => sum + item.value, 0)} people who needed but couldn't access dental care, the main reasons are as follows`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Disaster Type Distribution - For disaster_experience indicator */}
                    {indicator === 'disaster_experience' && disaggregationData.disasterType && disaggregationData.disasterType.length > 0 && (
                      <div className="lg:col-span-2">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">
                          {language === 'th' ? 'ประเภทภัยพิบัติ (เฉพาะผู้ที่ประสบภัยพิบัติ)' : 'Types of Disasters (Among Those Who Experienced Disasters)'}
                        </h3>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={disaggregationData.disasterType}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis 
                                dataKey="name" 
                                angle={-15}
                                textAnchor="end"
                                height={100}
                                tick={{ fontSize: 11 }}
                                interval={0}
                              />
                              <YAxis />
                              <Tooltip formatter={(value, name, props) => [
                                `${value} คน (${props.payload.rate}%)`, 
                                language === 'th' ? 'จำนวนคน' : 'Number of People'
                              ]} />
                              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                {disaggregationData.disasterType.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#FB923C'][index % 8]} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">
                            {language === 'th' 
                              ? `จากผู้ที่ประสบภัยพิบัติทั้งหมด ${disaggregationData.disasterType.reduce((sum, item) => sum + item.value, 0)} คน สามารถแบ่งตามประเภทภัยพิบัติได้ดังนี้`
                              : `Among all ${disaggregationData.disasterType.reduce((sum, item) => sum + item.value, 0)} people who experienced disasters, types of disasters are as follows`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Income and Working Hours - For employment indicators */}
                    {(indicator === 'vulnerable_employment' || indicator === 'non_vulnerable_employment') && 
                     (disaggregationData.income || disaggregationData.workingHours) && (
                      <div className="lg:col-span-2 space-y-6">
                        
                        {/* Income Statistics */}
                        {disaggregationData.income && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                              {language === 'th' ? 'รายได้เฉลี่ย' : 'Average Income'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              
                              {/* Daily Income */}
                              {disaggregationData.income.daily && (
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-medium text-gray-800 mb-3">
                                    {language === 'th' ? 'รายได้รายวัน' : 'Daily Income'} ({disaggregationData.income.daily.percentage}%)
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">{language === 'th' ? 'ค่าเฉลี่ย:' : 'Average:'}</span>
                                      <span className="font-semibold">฿{disaggregationData.income.daily.average.toFixed(0).toLocaleString()}/วัน</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">{language === 'th' ? 'ต่ำสุด:' : 'Min:'}</span>
                                      <span>฿{disaggregationData.income.daily.min.toFixed(0).toLocaleString()}/วัน</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">{language === 'th' ? 'สูงสุด:' : 'Max:'}</span>
                                      <span>฿{disaggregationData.income.daily.max.toFixed(0).toLocaleString()}/วัน</span>
                                    </div>
                                    <div className="pt-2 border-t border-blue-200">
                                      <div className="text-xs text-gray-500">
                                        {language === 'th' 
                                          ? `เทียบเท่ารายเดือน: ฿${(disaggregationData.income.daily.monthlyEquivalent || 0).toFixed(0).toLocaleString()}`
                                          : `Monthly equivalent: ฿${(disaggregationData.income.daily.monthlyEquivalent || 0).toFixed(0).toLocaleString()}`}
                                      </div>
                                    </div>
                                    <div className="pt-2 border-t border-blue-200">
                                      <span className="text-xs text-gray-500">
                                        {language === 'th' 
                                          ? `จำนวนตัวอย่าง: ${disaggregationData.income.daily.count} คน`
                                          : `Sample size: ${disaggregationData.income.daily.count} people`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Monthly Income */}
                              {disaggregationData.income.monthly && (
                                <div className="border rounded-lg p-4">
                                  <h4 className="font-medium text-gray-800 mb-3">
                                    {language === 'th' ? 'รายได้รายเดือน' : 'Monthly Income'} ({disaggregationData.income.monthly.percentage}%)
                                  </h4>
                                  <div className="space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">{language === 'th' ? 'ค่าเฉลี่ย:' : 'Average:'}</span>
                                      <span className="font-semibold">฿{disaggregationData.income.monthly.average.toFixed(0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">{language === 'th' ? 'ต่ำสุด:' : 'Min:'}</span>
                                      <span>฿{disaggregationData.income.monthly.min.toFixed(0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-sm text-gray-600">{language === 'th' ? 'สูงสุด:' : 'Max:'}</span>
                                      <span>฿{disaggregationData.income.monthly.max.toFixed(0).toLocaleString()}</span>
                                    </div>
                                    <div className="pt-2 border-t border-green-200">
                                      <span className="text-xs text-gray-500">
                                        {language === 'th' 
                                          ? `จำนวนตัวอย่าง: ${disaggregationData.income.monthly.count} คน`
                                          : `Sample size: ${disaggregationData.income.monthly.count} people`}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                        
                        {/* Working Hours Statistics */}
                        {disaggregationData.workingHours && (
                          <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">
                              {language === 'th' ? 'ชั่วโมงการทำงาน' : 'Working Hours'}
                            </h3>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Average Working Hours */}
                              <div className="border rounded-lg p-4">
                                <h4 className="font-medium text-gray-800 mb-3">
                                  {language === 'th' ? 'สถิติชั่วโมงทำงาน' : 'Working Hours Statistics'}
                                </h4>
                                <div className="space-y-2">
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">{language === 'th' ? 'ค่าเฉลี่ย:' : 'Average:'}</span>
                                    <span className="font-semibold">{disaggregationData.workingHours.average.toFixed(1)} {language === 'th' ? 'ชั่วโมง/วัน' : 'hours/day'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">{language === 'th' ? 'ต่ำสุด:' : 'Min:'}</span>
                                    <span>{disaggregationData.workingHours.min} {language === 'th' ? 'ชั่วโมง' : 'hours'}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-sm text-gray-600">{language === 'th' ? 'สูงสุด:' : 'Max:'}</span>
                                    <span>{disaggregationData.workingHours.max} {language === 'th' ? 'ชั่วโมง' : 'hours'}</span>
                                  </div>
                                  <div className="pt-2 border-t border-purple-200">
                                    <span className="text-xs text-gray-500">
                                      {language === 'th' 
                                        ? `จำนวนตัวอย่าง: ${disaggregationData.workingHours.count} คน`
                                        : `Sample size: ${disaggregationData.workingHours.count} people`}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Working Hours Distribution */}
                              <div className="border rounded-lg p-4">
                                <h4 className="font-medium text-gray-800 mb-3">
                                  {language === 'th' ? 'การกระจายชั่วโมงทำงาน' : 'Working Hours Distribution'}
                                </h4>
                                <div className="space-y-2">
                                  {disaggregationData.workingHours.distribution.map((item, index) => (
                                    <div key={index} className="flex justify-between">
                                      <span className="text-sm text-gray-600">{item.range}:</span>
                                      <span className="font-medium">
                                        {item.count} {language === 'th' ? 'คน' : 'people'} 
                                        ({((item.count / disaggregationData.workingHours.count) * 100).toFixed(1)}%)
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* No Data Message */}
                {(!disaggregationData || 
                  ((!disaggregationData.age || disaggregationData.age.length === 0) && 
                   (!disaggregationData.facilityType || disaggregationData.facilityType.length === 0))) && (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                      <div className="text-gray-400 mb-4">
                        <Users className="w-12 h-12 mx-auto" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {language === 'th' ? 'ไม่มีข้อมูลการแยกย่อย' : 'No Disaggregation Data'}
                      </h3>
                      <p className="text-gray-600">
                        {language === 'th' 
                          ? 'ไม่มีข้อมูลสำหรับการแยกย่อยในตัวชี้วัดนี้'
                          : 'No disaggregation data available for this indicator'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Correlations Tab */}
            {activeTab === 'correlations' && (
              <div>
                {/* Check if this is a healthcare supply indicator */}
                {['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                  'community_healthworker_per_population', 'health_service_access', 'bed_per_population', 'market_per_population', 'sportfield_per_population'].includes(indicator) ? (
                  <div className="text-center py-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-blue-100 rounded-full p-3">
                          <Brain className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-blue-900 mb-2">
                        {language === 'th' ? 'การวิเคราะห์ความสัมพันธ์ไม่พร้อมใช้งาน' : 'Correlation Analysis Not Available'}
                      </h3>
                      <p className="text-blue-800">
                        {language === 'th' 
                          ? 'ตัวชี้วัดทรัพยากรสุขภาพไม่มีข้อมูลระดับบุคคล จึงไม่สามารถคำนวณความสัมพันธ์กับตัวชี้วัดอื่นได้'
                          : 'Healthcare supply indicators do not have individual-level data, so correlations with other indicators cannot be calculated.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <CorrelationAnalysis 
                    currentIndicator={indicator}
                    surveyData={surveyData}
                    district={district}
                    populationGroup={populationGroup}
                    calculateIndicatorPositive={calculateIndicatorPositive}
                  />
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetail;