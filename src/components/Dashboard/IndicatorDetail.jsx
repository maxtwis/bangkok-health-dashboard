import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ArrowLeft, Users, TrendingUp, Calculator, Info, Eye, Building, BarChart3 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import useIndicators from '../../hooks/useIndicators';
import { REVERSE_INDICATORS } from '../../constants/dashboardConstants';

const IndicatorDetail = ({ 
  indicator, 
  domain, 
  district, 
  populationGroup, 
  onBack, 
  surveyData,
  getIndicatorData,
  healthFacilitiesData
}) => {
  const { t, language } = useLanguage();
  const { getIndicatorInfo, loading: indicatorDetailsLoading } = useIndicators();
  const [activeTab, setActiveTab] = useState('overview');


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
      'bed_per_population': `${valueNum.toFixed(1)} per 10,000`
    };

    return unitMap[indicator] || `${valueNum.toFixed(1)}%`;
  };

  // Get current indicator data
  const indicatorData = getIndicatorData(domain, district, populationGroup);
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
      // Show facility type data for health_service_access (health facilities per capita)
      if (indicator === 'health_service_access') {
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
      }
      
      // For other supply indicators, no disaggregation available
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
        return record.district === district;
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
          return true; 
        }
        
        return false;
      });

      // Filter further to only include people who have the indicator
      const indicatorPositiveData = filteredData.filter(record => 
        calculateIndicatorPositive(record, indicator)
      );

      // Only show demographic breakdown if there are people with the indicator
      if (indicatorPositiveData.length > 0) {
        return calculateDemographicDisaggregation(indicatorPositiveData);
      } else {
        // Return null to show "No Data" message
        return null;
      }
    }

    return null;
  }, [surveyData, indicator, district, populationGroup, healthFacilitiesData, language]);

  // Calculate facility type breakdown for health_service_access
  function calculateFacilityTypeData() {
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
  function calculateDemographicDisaggregation(records) {
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

    return {
      age: calculateGroupedRates(record => getAgeGroup(record.age), records, ageGroupOrder),
      sex: calculateGroupedRates(record => getSexGroup(record.sex), records),
      occupation: calculateGroupedRates(record => getOccupationGroup(record.occupation_status, record.occupation_type), records),
      welfare: calculateGroupedRates(record => getWelfareGroup(record.welfare), records)
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
               record.community_disaster_3 === 1 || record.community_disaster_4 === 1;

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
        return record['discrimination/1'] === 1 || record['discrimination/2'] === 1 || 
               record['discrimination/3'] === 1 || record['discrimination/4'] === 1 || 
               record['discrimination/5'] === 1;
      case 'social_support':
        return record.helper === 1;
      case 'community_murder':
        return record.community_murder === 1;

      // Health Behaviors Indicators
      case 'alcohol_consumption':
        return record.drink_status === 1 || record.drink_status === 2;
      case 'tobacco_use':
        return record.smoke_status === 1;
      case 'exercise_regular':
        return record.exercise_status === 1;
      case 'physical_activity':
        // Insufficient physical activity (exercise_status 0 or 1 = insufficient)
        return record.exercise_status === 0 || record.exercise_status === 1;
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
                    <span className="flex items-center">
                      <Users className="w-4 h-4 mr-1" />
                      {t(`populationGroups.${populationGroup}`)}
                    </span>
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
                { id: 'details', label: language === 'th' ? 'รายละเอียด' : 'Details', icon: Info }
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
                {/* Healthcare Supply Indicators Message */}
                {['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                  'community_healthworker_per_population', 'bed_per_population'].includes(indicator) && (
                  <div className="text-center py-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                      <div className="flex items-center justify-center mb-4">
                        <div className="bg-blue-100 rounded-full p-3">
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-blue-900 mb-2">
                        {language === 'th' ? 'ตัวชี้วัดทรัพยากรสุขภาพ' : 'Healthcare Supply Indicator'}
                      </h3>
                      <p className="text-blue-800">
                        {language === 'th' 
                          ? 'ตัวชี้วัดนี้คำนวณจากข้อมูลสถานพยาบาลและประชากรรวม ไม่สามารถแยกย่อยตามลักษณะประชากรได้'
                          : 'This indicator is calculated from health facility data and total population. Demographic disaggregation is not available.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Health Service Access - Custom Horizontal Bar Chart */}
                {indicator === 'health_service_access' && disaggregationData?.facilityType && disaggregationData.facilityType.length > 0 && (
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
                          <Tooltip formatter={(value) => [`${value.toLocaleString()} facilities`, language === 'th' ? 'จำนวนสถานพยาบาล' : 'Facilities']} />
                          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                            {disaggregationData.facilityType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={facilityColors[index % facilityColors.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Summary Statistics */}
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="text-sm font-medium text-gray-800 mb-4">
                        {language === 'th' ? 'สรุปข้อมูลสถานพยาบาล' : 'Health Facility Summary'}
                      </h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {disaggregationData.facilityType.map((item, index) => {
                          const total = disaggregationData.facilityType.reduce((sum, i) => sum + i.value, 0);
                          const percentage = total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
                          return (
                            <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center mb-2">
                                <div 
                                  className="w-4 h-4 rounded mr-3 flex-shrink-0" 
                                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                ></div>
                                <span className="text-sm font-medium text-gray-800 truncate" title={item.name}>
                                  {item.name}
                                </span>
                              </div>
                              <div className="ml-7">
                                <div className="text-lg font-bold text-gray-900">{item.value.toLocaleString()}</div>
                                <div className="text-sm text-gray-500">{percentage}% of total</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex justify-between items-center">
                          <span className="text-base font-semibold text-gray-800">
                            {language === 'th' ? 'รวมสถานพยาบาลทั้งหมด' : 'Total Health Facilities'}:
                          </span>
                          <span className="text-xl font-bold text-blue-600">
                            {disaggregationData.facilityType.reduce((sum, item) => sum + item.value, 0).toLocaleString()} 
                            <span className="text-sm text-gray-500 ml-1">
                              {language === 'th' ? 'แห่ง' : 'facilities'}
                            </span>
                          </span>
                        </div>
                        {district !== 'Bangkok Overall' && (
                          <div className="mt-1">
                            <span className="text-sm text-gray-500">
                              {language === 'th' ? 'ใน' : 'in'} {district}
                            </span>
                          </div>
                        )}
                      </div>
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

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Indicator Metadata */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {language === 'th' ? 'ข้อมูลตัวชี้วัด' : 'Indicator Metadata'}
                    </h3>
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-600">
                          {language === 'th' ? 'โดเมน' : 'Domain'}
                        </dt>
                        <dd className="text-sm text-gray-900">{t(`domains.${domain}`)}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-600">
                          {language === 'th' ? 'ประเภท' : 'Type'}
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                            'community_healthworker_per_population', 'health_service_access', 'bed_per_population'].indexOf(indicator) >= 0
                            ? (language === 'th' ? 'ตัวชี้วัดทรัพยากรสุขภาพ' : 'Healthcare Supply Indicator')
                            : (language === 'th' ? 'ตัวชี้วัดจากการสำรวจ' : 'Survey-based Indicator')
                          }
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-600">
                          {language === 'th' ? 'การตีความ' : 'Interpretation Direction'}
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {indicatorInfo.reverse 
                            ? (language === 'th' ? 'ยิ่งต่ำยิ่งดี' : 'Lower is better')
                            : (language === 'th' ? 'ยิ่งสูงยิ่งดี' : 'Higher is better')
                          }
                        </dd>
                      </div>
                      {currentIndicator.sample_size && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600">
                            {language === 'th' ? 'ขนาดตัวอย่าง' : 'Sample Size'}
                          </dt>
                          <dd className="text-sm text-gray-900">{currentIndicator.sample_size.toLocaleString()}</dd>
                        </div>
                      )}
                      {currentIndicator.population && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600">
                            {language === 'th' ? 'ประชากรรวม' : 'Total Population'}
                          </dt>
                          <dd className="text-sm text-gray-900">{currentIndicator.population.toLocaleString()}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Performance Assessment */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      {language === 'th' ? 'การประเมินผลการปฏิบัติ' : 'Performance Assessment'}
                    </h3>
                    
                    {currentIndicator.value !== null && currentIndicator.value !== undefined ? (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-600">
                            {language === 'th' ? 'คะแนนปัจจุบัน' : 'Current Score'}
                          </span>
                          <span className="text-2xl font-bold text-blue-600">
                            {formatHealthcareSupplyValue(currentIndicator.value, indicator)}
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full ${
                              indicatorInfo.reverse
                                ? (currentIndicator.value <= 20 ? 'bg-green-500' : currentIndicator.value <= 40 ? 'bg-yellow-500' : 'bg-red-500')
                                : (currentIndicator.value >= 80 ? 'bg-green-500' : currentIndicator.value >= 60 ? 'bg-yellow-500' : 'bg-red-500')
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, currentIndicator.value))}%` }}
                          ></div>
                        </div>
                        
                        <div className="text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            indicatorInfo.reverse
                              ? (currentIndicator.value <= 20 ? 'bg-green-100 text-green-800' : 
                                 currentIndicator.value <= 40 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')
                              : (currentIndicator.value >= 80 ? 'bg-green-100 text-green-800' : 
                                 currentIndicator.value >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800')
                          }`}>
                            {indicatorInfo.reverse
                              ? (currentIndicator.value <= 20 ? (language === 'th' ? 'ดีเยี่ยม' : 'Excellent') :
                                 currentIndicator.value <= 40 ? (language === 'th' ? 'ดี' : 'Good') : 
                                 currentIndicator.value <= 60 ? (language === 'th' ? 'ปานกลาง' : 'Fair') : (language === 'th' ? 'ต้องปรับปรุง' : 'Needs Improvement'))
                              : (currentIndicator.value >= 80 ? (language === 'th' ? 'ดีเยี่ยม' : 'Excellent') :
                                 currentIndicator.value >= 60 ? (language === 'th' ? 'ดี' : 'Good') : 
                                 currentIndicator.value >= 40 ? (language === 'th' ? 'ปานกลาง' : 'Fair') : (language === 'th' ? 'ต้องปรับปรุง' : 'Needs Improvement'))
                            }
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-gray-500">
                          {language === 'th' ? 'ไม่มีข้อมูลสำหรับการประเมิน' : 'No data available for assessment'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                {/* Full Calculation Details */}
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Calculator className="w-5 h-5 mr-2" />
                    {language === 'th' ? 'รายละเอียดการคำนวณ' : 'Calculation Details'}
                  </h3>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 mb-4">
                      {indicatorInfo.calculation}
                    </p>
                    
                    {currentIndicator.sample_size && (
                      <div className="bg-white rounded p-4 mt-4">
                        <h4 className="font-medium text-gray-800 mb-2">
                          {language === 'th' ? 'ข้อมูลที่ใช้ในการคำนวณ' : 'Data Used in Calculation'}
                        </h4>
                        <ul className="text-sm text-gray-600 space-y-1">
                          <li>
                            <strong>{language === 'th' ? 'กลุ่มประชากร:' : 'Population Group:'}</strong> {t(`populationGroups.${populationGroup}`)}
                          </li>
                          <li>
                            <strong>{language === 'th' ? 'พื้นที่:' : 'Area:'}</strong> {district}
                          </li>
                          <li>
                            <strong>{language === 'th' ? 'ขนาดตัวอย่าง:' : 'Sample Size:'}</strong> {currentIndicator.sample_size.toLocaleString()} {language === 'th' ? 'คน' : 'people'}
                          </li>
                          {currentIndicator.population && (
                            <li>
                              <strong>{language === 'th' ? 'ประชากรรวม:' : 'Total Population:'}</strong> {currentIndicator.population.toLocaleString()} {language === 'th' ? 'คน' : 'people'}
                            </li>
                          )}
                          {currentIndicator.absolute_count && (
                            <li>
                              <strong>{language === 'th' ? 'จำนวนจริง:' : 'Absolute Count:'}</strong> {currentIndicator.absolute_count.toLocaleString()}
                            </li>
                          )}
                        </ul>
                      </div>
                    )}

                    {/* Additional calculation info for combined data */}
                    {currentIndicator.isCombined && (
                      <div className="bg-amber-50 border border-amber-200 rounded p-4 mt-4">
                        <h4 className="font-medium text-amber-800 mb-2">
                          {language === 'th' ? 'ข้อมูลรวม' : 'Combined Data'}
                        </h4>
                        <p className="text-sm text-amber-700 mb-2">
                          {language === 'th' 
                            ? 'ข้อมูลนี้รวมจากการสำรวจและข้อมูลอ้างอิงเพื่อให้ได้ค่าที่แม่นยำมากขึ้น'
                            : 'This data combines survey results with reference data for improved accuracy.'}
                        </p>
                        <div className="text-xs text-amber-600 space-y-1">
                          {currentIndicator.surveyValue !== null && (
                            <div>
                              <strong>{language === 'th' ? 'จากการสำรวจ:' : 'Survey value:'}</strong> {currentIndicator.surveyValue.toFixed(1)}%
                            </div>
                          )}
                          {currentIndicator.preCalculatedValue !== null && (
                            <div>
                              <strong>{language === 'th' ? 'ข้อมูลอ้างอิง:' : 'Reference value:'}</strong> {currentIndicator.preCalculatedValue.toFixed(1)}%
                            </div>
                          )}
                          {currentIndicator.combinationMethod && (
                            <div>
                              <strong>{language === 'th' ? 'วิธีการรวม:' : 'Combination method:'}</strong> {currentIndicator.combinationMethod}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Note for healthcare supply indicators */}
                    {['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                      'community_healthworker_per_population', 'health_service_access', 'bed_per_population'].includes(indicator) && (
                      <div className="bg-blue-50 border border-blue-200 rounded p-4 mt-4">
                        <h4 className="font-medium text-blue-800 mb-2">
                          {language === 'th' ? 'หมายเหตุ' : 'Note'}
                        </h4>
                        <p className="text-sm text-blue-700">
                          {language === 'th' 
                            ? 'ข้อมูลนี้คำนวณจากจำนวนบุคลากรและสถานพยาบาลในแต่ละเขต เทียบกับจำนวนประชากรรวมในเขตนั้น ๆ'
                            : 'This data is calculated from the number of healthcare personnel and facilities in each district, compared to the total population in that district.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetail;