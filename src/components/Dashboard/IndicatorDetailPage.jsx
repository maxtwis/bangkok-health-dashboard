// IndicatorDetailPage.jsx - Fixed version with proper hook usage
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, Users, TrendingUp, Calculator, Info, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import useIndicatorDetails from '../../hooks/useIndicatorDetails';

const IndicatorDetailPage = ({ 
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
  const { getIndicatorInfo, loading: indicatorDetailsLoading } = useIndicatorDetails();
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
    
    // Define reverse indicators (diseases and problems are bad when high)
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

    return {
      name: csvInfo.name,
      description: csvInfo.description,
      calculation: csvInfo.calculation,
      interpretation: reverseIndicators.has(indicator)
        ? (language === 'th' 
            ? 'ค่าที่ต่ำกว่าแสดงถึงผลลัพธ์ที่ดีกว่า (ตัวชี้วัดแบบย้อนกลับ)' 
            : 'Lower values indicate better outcomes (reverse indicator)')
        : (language === 'th'
            ? 'ค่าที่สูงกว่าแสดงถึงผลลัพธ์ที่ดีกว่า'
            : 'Higher values indicate better outcomes'),
      target: getTargetValue(indicator),
      reverse: reverseIndicators.has(indicator)
    };
  }, [indicator, language, indicatorDetailsLoading, getIndicatorInfo]);

  // Get target values for different indicators
  function getTargetValue(indicatorKey) {
    const targets = {
      'unemployment_rate': '< 5%',
      'alcohol_consumption': '< 15%',
      'tobacco_use': '< 10%',
      'diabetes': '< 8%',
      'hypertension': '< 25%',
      'obesity': '< 15%',
      'physical_activity': '< 30%',
    };
    return targets[indicatorKey] || (language === 'th' ? 'ไม่ระบุ' : 'Not specified');
  }

  const indicatorData = getIndicatorData(domain, district, populationGroup);
  const currentIndicator = indicatorData.find(item => item.indicator === indicator);

  // Calculate disaggregation data
  const disaggregationData = useMemo(() => {
    if (!surveyData || !indicator) return null;

    // Filter data for current selection
    let filteredData = surveyData.filter(record => {
      if (district !== 'Bangkok Overall' && record.district_name !== district) return false;
      if (record.population_group !== populationGroup) return false;
      return true;
    });

    return calculateDisaggregation(filteredData, indicator, language, healthFacilitiesData, district);
  }, [surveyData, indicator, district, populationGroup, language, healthFacilitiesData]);

  // Color schemes
  const ageColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc'];
  const sexColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const occupationColors = ['#dc2626', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
  const welfareColors = ['#2563eb', '#16a34a', '#eab308', '#dc2626', '#6b7280'];

  // Calculate disaggregation function
  function calculateDisaggregation(records, indicatorKey, language, healthFacilitiesData, district) {
    if (!records || records.length === 0) return null;

    // Health Facility Type classification (for health_service_access indicator)
    const getHealthFacilityType = (type) => {
      const facilityTypeMap = {
        1: language === 'th' ? 'คลินิกเอกชน' : 'Private Clinic',
        2: language === 'th' ? 'ศูนย์สุขภาพชุมชน' : 'Community Health Center',
        3: language === 'th' ? 'ศูนย์บริการสาธารณสุข' : 'Public Health Service Center',
        4: language === 'th' ? 'โรงพยาบาลเอกชน' : 'Private Hospital',
        5: language === 'th' ? 'โรงพยาบาลรัฐ' : 'Public Hospital',
        6: language === 'th' ? 'ร้านยาคุณภาพ (สปสช.)' : 'Quality Pharmacy (NHSO)'
      };
      
      return facilityTypeMap[type] || (language === 'th' ? 'ไม่ระบุประเภท' : 'Type Not Specified');
    };

    // Initialize empty arrays for all data types
    let ageData = [];
    let sexData = [];
    let occupationData = [];
    let welfareData = [];
    let facilityTypeData = [];

    // For healthcare supply indicators
    const healthcareSupplyIndicators = [
      'doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
      'community_healthworker_per_population', 'health_service_access', 'bed_per_population'
    ];

    if (healthcareSupplyIndicators.includes(indicatorKey)) {
      // Only process facility type data for health_service_access
      if (indicatorKey === 'health_service_access' && healthFacilitiesData) {
        // Get health facilities data for the current district
        const healthFacilitiesForDistrict = healthFacilitiesData.filter(facility => {
          if (district === 'Bangkok Overall') {
            return true; // Include all facilities for Bangkok Overall
          } else {
            return facility.dname === district;
          }
        });

        // Group facilities by type
        const facilityTypeGroups = {};
        healthFacilitiesForDistrict.forEach(facility => {
          const facilityType = getHealthFacilityType(facility.type_);
          if (!facilityTypeGroups[facilityType]) {
            facilityTypeGroups[facilityType] = [];
          }
          facilityTypeGroups[facilityType].push(facility);
        });

        // Calculate facility type data
        const totalFacilities = healthFacilitiesForDistrict.length;
        const totalPopulation = 1000000; // This should be actual population data for the district

        facilityTypeData = Object.keys(facilityTypeGroups).map(facilityType => {
          const facilityCount = facilityTypeGroups[facilityType].length;
          const percentageOfFacilities = totalFacilities > 0 ? (facilityCount / totalFacilities) * 100 : 0;
          const facilitiesPerPopulation = totalPopulation > 0 ? (facilityCount / totalPopulation) * 10000 : 0;
          
          return {
            group: facilityType,
            value: percentageOfFacilities,
            indicatorValue: facilitiesPerPopulation,
            count: facilityCount,
            type: 'facility_type'
          };
        }).sort((a, b) => b.count - a.count); // Sort by facility count
      }
    } else {
      // For non-healthcare supply indicators, process normally
      // Age group classification
      const getAgeGroup = (age) => {
        if (age < 18) return '< 18';
        if (age < 30) return '18-29';
        if (age < 45) return '30-44';
        if (age < 60) return '45-59';
        return '60+';
      };

      // Sex classification
      const getSexGroup = (sex) => {
        if (sex === 'lgbt') return 'LGBTQ+';
        if (sex === 'male' || sex === 'M' || sex === 1) return language === 'th' ? 'ชาย' : 'Male';
        if (sex === 'female' || sex === 'F' || sex === 2) return language === 'th' ? 'หญิง' : 'Female';
        return language === 'th' ? 'ไม่ระบุ' : 'Not specified';
      };

      // Combined occupation status and type classification
      const getOccupationGroup = (occupationStatus, occupationType) => {
        if (occupationStatus === 0) {
          return language === 'th' ? 'ไม่ได้ประกอบอาชีพ' : 'Not Working';
        }
        
        if (occupationStatus === 1) {
          const occupationMap = {
            1: language === 'th' ? 'รับราชการ' : 'Government',
            2: language === 'th' ? 'รัฐวิสาหกิจ' : 'State Enterprise',
            3: language === 'th' ? 'พนักงานบริษัท/ลูกจ้าง' : 'Company Employee',
            5: language === 'th' ? 'ธุรกิจส่วนตัว' : 'Private Business',
            6: language === 'th' ? 'อาชีพอิสระ' : 'Freelance/Independent',
            'other': language === 'th' ? 'อื่น ๆ' : 'Other'
          };
          
          return occupationMap[occupationType] || (language === 'th' ? 'ทำงานแต่ไม่ระบุประเภท' : 'Working (Type Unspecified)');
        }
        
        return language === 'th' ? 'ไม่ระบุสถานะ' : 'Status Unclear';
      };

      // Welfare classification
      const getWelfareGroup = (welfare) => {
        switch (welfare) {
          case 1:
            return language === 'th' 
              ? 'สิทธิสวัสดิการข้าราชการ/รัฐวิสาหกิจ/องค์กรของรัฐ/องค์กรปกครองส่วนท้องถิ่น'
              : 'Government/State Enterprise/Local Authority Welfare';
          case 2:
            return language === 'th' 
              ? 'สิทธิประกันสังคม'
              : 'Social Security';
          case 3:
            return language === 'th' 
              ? 'สิทธิหลักประกันสุขภาพ 30 บาท (บัตรทอง)'
              : 'Universal Health Coverage (30 Baht Gold Card)';
          case 'other':
            return language === 'th' ? 'อื่น ๆ' : 'Other';
          default:
            return language === 'th' ? 'ไม่มีสิทธิ/ไม่ระบุ' : 'No Coverage/Not Specified';
        }
      };

      // Group records
      const ageGroups = {};
      const sexGroups = {};
      const occupationGroups = {};
      const welfareGroups = {};

      records.forEach(record => {
        const ageGroup = getAgeGroup(record.age);
        const sexGroup = getSexGroup(record.sex);
        const occupationGroup = getOccupationGroup(record.occupation_status, record.occupation_type);

        if (!ageGroups[ageGroup]) ageGroups[ageGroup] = [];
        if (!sexGroups[sexGroup]) sexGroups[sexGroup] = [];
        if (!occupationGroups[occupationGroup]) occupationGroups[occupationGroup] = [];

        ageGroups[ageGroup].push(record);
        sexGroups[sexGroup].push(record);
        occupationGroups[occupationGroup].push(record);

        // Add welfare grouping for specific indicators
        if (['health_coverage', 'medical_consultation_skip_cost', 'medical_treatment_skip_cost', 'prescribed_medicine_skip_cost', 'dental_access'].includes(indicatorKey)) {
          const welfareGroup = getWelfareGroup(record.welfare);
          if (!welfareGroups[welfareGroup]) welfareGroups[welfareGroup] = [];
          welfareGroups[welfareGroup].push(record);
        }
      });

      // Calculate group data
      const calculateGroupData = (groupRecords, totalRecords) => {
        const demographicPercent = (groupRecords.length / totalRecords.length) * 100;
        const indicatorValue = calculateIndicatorValueForGroup(groupRecords, indicatorKey);
        
        return {
          demographicPercent,
          indicatorValue,
          count: groupRecords.length
        };
      };

      // Process age groups
      ageData = Object.keys(ageGroups).map(ageGroup => {
        const groupData = calculateGroupData(ageGroups[ageGroup], records);
        return {
          group: ageGroup,
          value: groupData.demographicPercent,
          indicatorValue: groupData.indicatorValue,
          count: groupData.count,
          type: 'age'
        };
      }).sort((a, b) => {
        const ageOrder = ['< 18', '18-29', '30-44', '45-59', '60+'];
        return ageOrder.indexOf(a.group) - ageOrder.indexOf(b.group);
      });

      // Process sex groups
      sexData = Object.keys(sexGroups).map(sexGroup => {
        const groupData = calculateGroupData(sexGroups[sexGroup], records);
        return {
          group: sexGroup,
          value: groupData.demographicPercent,
          indicatorValue: groupData.indicatorValue,
          count: groupData.count,
          type: 'sex'
        };
      });

      // Process occupation groups
      occupationData = Object.keys(occupationGroups).map(occupationGroup => {
        const groupData = calculateGroupData(occupationGroups[occupationGroup], records);
        return {
          group: occupationGroup,
          value: groupData.demographicPercent,
          indicatorValue: groupData.indicatorValue,
          count: groupData.count,
          type: 'occupation'
        };
      }).filter(item => item.count > 0)
      .sort((a, b) => {
        if (a.group.includes('ไม่ได้ประกอบอาชีพ') || a.group.includes('Not Working')) return -1;
        if (b.group.includes('ไม่ได้ประกอบอาชีพ') || b.group.includes('Not Working')) return 1;
        return b.count - a.count;
      });

      // Process welfare groups
      welfareData = ['health_coverage', 'medical_consultation_skip_cost', 'medical_treatment_skip_cost', 'prescribed_medicine_skip_cost', 'dental_access'].includes(indicatorKey)
        ? Object.keys(welfareGroups).map(welfareGroup => {
            const groupData = calculateGroupData(welfareGroups[welfareGroup], records);
            return {
              group: welfareGroup,
              value: groupData.demographicPercent,
              indicatorValue: groupData.indicatorValue,
              count: groupData.count,
              type: 'welfare'
            };
          }).filter(item => item.count > 0)
          .sort((a, b) => b.count - a.count)
        : [];
    }

    return {
      age: ageData,
      sex: sexData,
      occupation: occupationData,
      welfare: welfareData,
      facilityType: facilityTypeData,
      total: {
        value: calculateIndicatorValueForGroup(records, indicatorKey),
        count: records.length
      }
    };
  }

  // Calculate indicator value for a group of records
  function calculateIndicatorValueForGroup(groupRecords, indicatorKey) {
    // Simple calculation - you can expand this based on your needs
    switch (indicatorKey) {
      case 'unemployment_rate':
        const unemployed = groupRecords.filter(r => r.occupation_status === 0).length;
        return groupRecords.length > 0 ? (unemployed / groupRecords.length) * 100 : 0;
      
      case 'health_coverage':
        const healthCoverage = groupRecords.filter(r => 
          r.welfare !== null && r.welfare !== undefined && r.welfare !== 'other' && r.welfare !== 'Other'
        ).length;
        return groupRecords.length > 0 ? (healthCoverage / groupRecords.length) * 100 : 0;
      
      // Add more cases as needed
      default:
        return 0;
    }
  }

  if (indicatorDetailsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
          <div className="flex items-center space-x-3 mb-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-lg font-medium">
              {language === 'th' ? 'กำลังโหลดข้อมูลตัวชี้วัด...' : 'Loading indicator details...'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!currentIndicator) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">{t('ui.noData')}</p>
        <button 
          onClick={onBack}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {language === 'th' ? 'กลับ' : 'Back'}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <button 
              onClick={onBack}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>{language === 'th' ? 'กลับ' : 'Back'}</span>
            </button>
          </div>
          
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {indicatorInfo.name}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <span className="bg-blue-100 px-3 py-1 rounded-full">
                {t(`domains.${domain}`)}
              </span>
              <span className="bg-green-100 px-3 py-1 rounded-full">
                {t(`populationGroups.${populationGroup}`)}
              </span>
              <span className="bg-purple-100 px-3 py-1 rounded-full">
                {district === 'Bangkok Overall' && language === 'th' 
                  ? t('ui.bangkokOverall') 
                  : district}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', icon: Eye, label: language === 'th' ? 'ภาพรวม' : 'Overview' },
                { id: 'disaggregation', icon: Users, label: language === 'th' ? 'การแยกย่อยข้อมูล' : 'Disaggregation' },
                { id: 'methodology', icon: Calculator, label: language === 'th' ? 'วิธีการคำนวด' : 'Methodology' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'th' ? 'ค่าปัจจุบัน' : 'Current Value'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {currentIndicator.value.toFixed(1)}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    indicatorInfo.reverse 
                      ? (currentIndicator.value <= 20 ? 'bg-green-100' : 
                         currentIndicator.value <= 40 ? 'bg-yellow-100' : 'bg-red-100')
                      : (currentIndicator.value >= 80 ? 'bg-green-100' : 
                         currentIndicator.value >= 60 ? 'bg-yellow-100' : 'bg-red-100')
                  }`}>
                    <TrendingUp className={`w-6 h-6 ${
                      indicatorInfo.reverse 
                        ? (currentIndicator.value <= 20 ? 'text-green-600' : 
                           currentIndicator.value <= 40 ? 'text-yellow-600' : 'text-red-600')
                        : (currentIndicator.value >= 80 ? 'text-green-600' : 
                           currentIndicator.value >= 60 ? 'text-yellow-600' : 'text-red-600')
                    }`} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'th' ? 'ขนาดกลุ่มตัวอย่าง' : 'Sample Size'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {currentIndicator.sample_size.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {language === 'th' ? 'เป้าหมาย' : 'Target'}
                    </p>
                    <p className="text-3xl font-bold text-gray-900">
                      {indicatorInfo.target}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <Info className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {language === 'th' ? 'คำอธิบาย' : 'Description'}
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {indicatorInfo.description}
              </p>
              
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">
                  {language === 'th' ? 'การตีความ' : 'Interpretation'}
                </h4>
                <p className="text-blue-800 text-sm">
                  {indicatorInfo.interpretation}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Disaggregation Tab */}
        {activeTab === 'disaggregation' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {indicator === 'health_service_access'
                  ? (language === 'th' 
                      ? 'การแยกย่อยข้อมูลตามประเภทสถานพยาบาล' 
                      : 'Disaggregation by Health Facility Type')
                  : (['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                      'community_healthworker_per_population', 'bed_per_population'].includes(indicator)
                      ? (language === 'th' 
                          ? 'ตัวชี้วัดด้านทรัพยากรสุขภาพ (ไม่มีการแยกย่อยข้อมูลตามลักษณะประชากร)' 
                          : 'Healthcare Supply Indicator (No demographic disaggregation available)')
                      : (language === 'th' ? 'การแยกย่อยข้อมูลตามลักษณะประชากร' : 'Demographic Disaggregation')
                    )
                }
              </h3>
              
              {/* Show message for healthcare supply indicators except health_service_access */}
              {['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                'community_healthworker_per_population', 'bed_per_population'].includes(indicator) && (
                <div className="text-center py-8">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <p className="text-blue-800 font-medium mb-2">
                      {language === 'th' 
                        ? 'ตัวชี้วัดด้านทรัพยากรสุขภาพ' 
                        : 'Healthcare Supply Indicator'}
                    </p>
                    <p className="text-blue-700 text-sm">
                      {language === 'th' 
                        ? 'ตัวชี้วัดนี้คำนวณจากข้อมูลสถานพยาบาลและจำนวนประชากรรวม ไม่สามารถแยกย่อยตามลักษณะประชากรได้' 
                        : 'This indicator is calculated from health facility data and total population. Demographic disaggregation is not available.'}
                    </p>
                  </div>
                </div>
              )}
              
              {/* For health_service_access, show facility type disaggregation */}
              {indicator === 'health_service_access' && disaggregationData?.facilityType && disaggregationData.facilityType.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">
                    {language === 'th' ? 'ตามประเภทสถานพยาบาล' : 'By Health Facility Type'}
                  </h4>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={disaggregationData.facilityType}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="group" 
                          angle={-45}
                          textAnchor="end"
                          height={120}
                          tick={{ fontSize: 10 }}
                          interval={0}
                        />
                        <YAxis tickFormatter={(value) => `${value.toFixed(0)}`} />
                        <Tooltip 
                          formatter={(value, name) => [
                            `${value.toFixed(1)} per 10,000 population`, 
                            language === 'th' ? 'จำนวนต่อประชากร 10,000 คน' : 'Per 10,000 Population'
                          ]}
                          labelFormatter={(label) => `${language === 'th' ? 'ประเภทสถานพยาบาล' : 'Facility Type'}: ${label}`}
                        />
                        <Bar dataKey="indicatorValue" fill="#2563eb" radius={[4, 4, 0, 0]}>
                          {disaggregationData.facilityType.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={`hsl(${220 + index * 30}, 70%, ${50 + index * 8}%)`} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Facility Type Table */}
                  <div className="mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">{language === 'th' ? 'ประเภทสถานพยาบาล' : 'Facility Type'}</th>
                          <th className="text-right py-2">{language === 'th' ? 'สัดส่วน (%)' : 'Proportion (%)'}</th>
                          <th className="text-right py-2">{language === 'th' ? 'ต่อประชากร 10,000 คน' : 'Per 10,000 Population'}</th>
                          <th className="text-right py-2">{language === 'th' ? 'จำนวนสถานพยาบาล' : 'Number of Facilities'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disaggregationData.facilityType.map((item, index) => (
                          <tr key={item.group} className="border-b">
                            <td className="py-2 flex items-center">
                              <div 
                                className="w-3 h-3 rounded mr-2" 
                                style={{ backgroundColor: `hsl(${220 + index * 30}, 70%, ${50 + index * 8}%)` }}
                              ></div>
                              <span className="text-xs">{item.group}</span>
                            </td>
                            <td className="text-right py-2 font-medium">{item.value.toFixed(1)}%</td>
                            <td className="text-right py-2 text-blue-600">{item.indicatorValue?.toFixed(2) || 'N/A'}</td>
                            <td className="text-right py-2 text-gray-600">{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {/* For non-healthcare supply indicators, show regular disaggregation */}
              {!['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                 'community_healthworker_per_population', 'health_service_access', 'bed_per_population'].includes(indicator) && 
               disaggregationData && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Age Groups */}
                  {disaggregationData.age && disaggregationData.age.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-4">
                        {language === 'th' ? 'ตามกลุ่มอายุ' : 'By Age Group'}
                      </h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={disaggregationData.age}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="group" />
                            <YAxis tickFormatter={(value) => `${value}%`} />
                            <Tooltip 
                              formatter={(value, name) => [`${value.toFixed(1)}%`, language === 'th' ? 'อัตรา' : 'Rate']}
                              labelFormatter={(label) => `${language === 'th' ? 'กลุ่มอายุ' : 'Age Group'}: ${label}`}
                            />
                            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                              {disaggregationData.age.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={ageColors[index % ageColors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Sex Groups */}
                  {disaggregationData.sex && disaggregationData.sex.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-4">
                        {language === 'th' ? 'ตามเพศ' : 'By Sex'}
                      </h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={disaggregationData.sex}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              dataKey="value"
                              label={({group, value}) => `${group}: ${value.toFixed(1)}%`}
                            >
                              {disaggregationData.sex.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={sexColors[index % sexColors.length]} />
                              ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value.toFixed(1)}%`} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  {/* Occupation Groups */}
                  {disaggregationData.occupation && disaggregationData.occupation.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-4">
                        {language === 'th' ? 'ตามสถานะการทำงาน' : 'By Employment Status'}
                      </h4>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={disaggregationData.occupation}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="group" 
                              angle={-45}
                              textAnchor="end"
                              height={100}
                              tick={{ fontSize: 9 }}
                              interval={0}
                            />
                            <YAxis tickFormatter={(value) => `${value}%`} />
                            <Tooltip 
                              formatter={(value, name) => [`${value.toFixed(1)}%`, language === 'th' ? 'อัตรา' : 'Rate']}
                              labelFormatter={(label) => `${language === 'th' ? 'สถานะการทำงาน' : 'Employment Status'}: ${label}`}
                            />
                            <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]}>
                              {disaggregationData.occupation.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={occupationColors[index % occupationColors.length]} />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Methodology Tab */}
        {activeTab === 'methodology' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {language === 'th' ? 'วิธีการคำนวดและแหล่งข้อมูล' : 'Calculation Method and Data Source'}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">
                    {language === 'th' ? 'สูตรการคำนวด' : 'Calculation Formula'}
                  </h4>
                  <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                    {indicatorInfo.calculation}
                  </div>
                </div>     
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndicatorDetailPage;