// Complete IndicatorDetailPage.jsx - With all disaggregations preserved
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
  const currentIndicator = indicatorData ? indicatorData.find(item => item.indicator === indicator) : null;

  // Color schemes
  const ageColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc'];
  const sexColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const occupationColors = ['#dc2626', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
  const welfareColors = ['#2563eb', '#16a34a', '#eab308', '#dc2626', '#6b7280'];

  // Calculate disaggregation data
  const disaggregationData = useMemo(() => {
    if (!surveyData || !indicator) return null;

    // Healthcare supply indicators - no demographic disaggregation
    const healthcareSupplyIndicators = [
      'doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
      'community_healthworker_per_population', 'health_service_access', 'bed_per_population'
    ];

    if (healthcareSupplyIndicators.includes(indicator)) {
      // Only calculate facility type data for health_service_access
      if (indicator === 'health_service_access' && healthFacilitiesData) {
        const facilityTypeData = calculateFacilityTypeData();
        return {
          age: [],
          sex: [],
          occupation: [],
          welfare: [],
          facilityType: facilityTypeData
        };
      }
      
      // For other healthcare supply indicators, return empty arrays
      return {
        age: [],
        sex: [],
        occupation: [],
        welfare: [],
        facilityType: []
      };
    }

    // For non-healthcare supply indicators, calculate demographic disaggregation
    let filteredData = surveyData.filter(record => {
      if (district !== 'Bangkok Overall' && record.district_name !== district) return false;
      if (record.population_group !== populationGroup) return false;
      return true;
    });

    return calculateDemographicDisaggregation(filteredData);
  }, [surveyData, indicator, district, populationGroup, healthFacilitiesData, language]);

  // Calculate facility type data for health_service_access
  function calculateFacilityTypeData() {
    try {
      // Filter facilities for current district
      const facilitiesForDistrict = district === 'Bangkok Overall' 
        ? healthFacilitiesData 
        : healthFacilitiesData.filter(facility => facility.dname === district);

      // Group by facility type
      const typeGroups = {};
      facilitiesForDistrict.forEach(facility => {
        const type = facility.type_;
        if (!typeGroups[type]) {
          typeGroups[type] = [];
        }
        typeGroups[type].push(facility);
      });

      // Convert to chart data
      const facilityTypeMap = {
        1: language === 'th' ? 'คลินิกเอกชน' : 'Private Clinic',
        2: language === 'th' ? 'ศูนย์สุขภาพชุมชน' : 'Community Health Center',
        3: language === 'th' ? 'ศูนย์บริการสาธารณสุข' : 'Public Health Service Center',
        4: language === 'th' ? 'โรงพยาบาลเอกชน' : 'Private Hospital',
        5: language === 'th' ? 'โรงพยาบาลรัฐ' : 'Public Hospital',
        6: language === 'th' ? 'ร้านยาคุณภาพ (สปสช.)' : 'Quality Pharmacy (NHSO)'
      };

      const totalFacilities = facilitiesForDistrict.length;
      const totalPopulation = 1000000; // This should be actual population for the district

      return Object.keys(typeGroups).map(type => {
        const count = typeGroups[type].length;
        const percentage = totalFacilities > 0 ? (count / totalFacilities) * 100 : 0;
        const facilitiesPer10k = totalPopulation > 0 ? (count / totalPopulation) * 10000 : 0;
        
        return {
          group: facilityTypeMap[type] || `Type ${type}`,
          value: percentage,
          indicatorValue: facilitiesPer10k,
          count: count,
          type: 'facility_type'
        };
      }).sort((a, b) => b.count - a.count);
    } catch (error) {
      console.error('Error calculating facility type data:', error);
      return [];
    }
  }

  // Calculate demographic disaggregation for regular indicators
  function calculateDemographicDisaggregation(records) {
    if (!records || records.length === 0) return null;

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
      if (['health_coverage', 'medical_consultation_skip_cost', 'medical_treatment_skip_cost', 'prescribed_medicine_skip_cost', 'dental_access'].includes(indicator)) {
        const welfareGroup = getWelfareGroup(record.welfare);
        if (!welfareGroups[welfareGroup]) welfareGroups[welfareGroup] = [];
        welfareGroups[welfareGroup].push(record);
      }
    });

    // Calculate group data
    const calculateGroupData = (groupRecords, totalRecords) => {
      const demographicPercent = (groupRecords.length / totalRecords.length) * 100;
      const indicatorValue = calculateIndicatorValueForGroup(groupRecords, indicator);
      
      return {
        demographicPercent,
        indicatorValue,
        count: groupRecords.length
      };
    };

    // Process age groups
    const ageData = Object.keys(ageGroups).map(ageGroup => {
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
    const sexData = Object.keys(sexGroups).map(sexGroup => {
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
    const occupationData = Object.keys(occupationGroups).map(occupationGroup => {
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
    const welfareData = ['health_coverage', 'medical_consultation_skip_cost', 'medical_treatment_skip_cost', 'prescribed_medicine_skip_cost', 'dental_access'].includes(indicator)
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

    return {
      age: ageData,
      sex: sexData,
      occupation: occupationData,
      welfare: welfareData,
      facilityType: []
    };
  }

  // Calculate indicator value for a group of records
  function calculateIndicatorValueForGroup(groupRecords, indicatorKey) {
    if (!groupRecords || groupRecords.length === 0) return 0;

    switch (indicatorKey) {
      case 'unemployment_rate':
        const unemployed = groupRecords.filter(r => r.occupation_status === 0).length;
        return groupRecords.length > 0 ? (unemployed / groupRecords.length) * 100 : 0;
        
      case 'employment_rate':
        const employed = groupRecords.filter(r => r.occupation_status === 1).length;
        return groupRecords.length > 0 ? (employed / groupRecords.length) * 100 : 0;
        
      case 'vulnerable_employment':
        const vulnerable = groupRecords.filter(r => 
          r.occupation_status === 1 && r.occupation_contract === 0
        ).length;
        return groupRecords.length > 0 ? (vulnerable / groupRecords.length) * 100 : 0;
        
      case 'alcohol_consumption':
        const drinkers = groupRecords.filter(r => r.drink_status === 1 || r.drink_status === 2).length;
        return groupRecords.length > 0 ? (drinkers / groupRecords.length) * 100 : 0;
        
      case 'tobacco_use':
        const smokers = groupRecords.filter(r => 
          r.age >= 15 && (r.smoke_status === 2 || r.smoke_status === 3)
        ).length;
        const adults = groupRecords.filter(r => r.age >= 15).length;
        return adults > 0 ? (smokers / adults) * 100 : 0;

      case 'physical_activity':
        const insufficient = groupRecords.filter(r => 
          r.exercise_status === 0 || r.exercise_status === 1
        ).length;
        return groupRecords.length > 0 ? (insufficient / groupRecords.length) * 100 : 0;

      case 'obesity':
        const validBMI = groupRecords.filter(r => r.height > 0 && r.weight > 0);
        if (validBMI.length === 0) return 0;
        const obese = validBMI.filter(r => {
          const bmi = r.weight / Math.pow(r.height / 100, 2);
          return bmi >= 30;
        }).length;
        return (obese / validBMI.length) * 100;
        
      case 'diabetes':
        const diabetics = groupRecords.filter(r => 
          r.diseases_status === 1 && r['diseases_type/1'] === 1
        ).length;
        return groupRecords.length > 0 ? (diabetics / groupRecords.length) * 100 : 0;

      case 'hypertension':
        const hypertensive = groupRecords.filter(r => 
          r.diseases_status === 1 && r['diseases_type/2'] === 1
        ).length;
        return groupRecords.length > 0 ? (hypertensive / groupRecords.length) * 100 : 0;

      case 'health_coverage':
        const healthCoverage = groupRecords.filter(r => 
          r.welfare !== null && r.welfare !== undefined && r.welfare !== 'other' && r.welfare !== 'Other'
        ).length;
        return groupRecords.length > 0 ? (healthCoverage / groupRecords.length) * 100 : 0;

      case 'violence_physical':
        const physicalViolence = groupRecords.filter(r => r.physical_violence === 1).length;
        return groupRecords.length > 0 ? (physicalViolence / groupRecords.length) * 100 : 0;

      case 'discrimination_experience':
        const discrimination = groupRecords.filter(r => 
          r['discrimination/1'] === 1 || r['discrimination/2'] === 1 || 
          r['discrimination/3'] === 1 || r['discrimination/4'] === 1 || 
          r['discrimination/5'] === 1
        ).length;
        return groupRecords.length > 0 ? (discrimination / groupRecords.length) * 100 : 0;

      // Add more indicator calculations as needed
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
                      {currentIndicator.value?.toFixed ? currentIndicator.value.toFixed(1) : currentIndicator.value}
                      {['health_service_access', 'doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 'community_healthworker_per_population', 'bed_per_population'].includes(indicator) ? '' : '%'}
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
                      {typeof currentIndicator.sample_size === 'string' ? currentIndicator.sample_size : (currentIndicator.sample_size?.toLocaleString ? currentIndicator.sample_size.toLocaleString() : currentIndicator.sample_size)}
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
        {activeTab === 'disaggregation' && disaggregationData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {/* Different titles based on indicator type */}
                {['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                  'community_healthworker_per_population', 'health_service_access', 'bed_per_population'].includes(indicator)
                  ? (indicator === 'health_service_access'
                      ? (language === 'th' 
                          ? 'การแยกย่อยข้อมูลตามประเภทสถานพยาบาล' 
                          : 'Disaggregation by Health Facility Type')
                      : (language === 'th' 
                          ? 'ตัวชี้วัดด้านทรัพยากรสุขภาพ (ไม่มีการแยกย่อยข้อมูลตามลักษณะประชากร)' 
                          : 'Healthcare Supply Indicator (No demographic disaggregation available)')
                    )
                  : (['health_coverage', 'medical_consultation_skip_cost', 'medical_treatment_skip_cost', 'prescribed_medicine_skip_cost', 'dental_access'].includes(indicator)
                      ? (language === 'th' ? 'การแยกย่อยข้อมูลตามกลุ่มอายุ เพศ สถานะการทำงาน และประเภทสิทธิประกันสุขภาพ' : 'Disaggregation by Age, Sex, Employment Status and Health Insurance Type')
                      : (language === 'th' ? 'การแยกย่อยข้อมูลตามกลุ่มอายุ เพศ และสถานะการทำงาน' : 'Disaggregation by Age, Sex and Employment Status')
                    )
                }
              </h3>
              
              {/* For healthcare supply indicators except health_service_access, show message */}
              {['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                'community_healthworker_per_population', 'bed_per_population'].includes(indicator) && (
                <div className="text-center py-8 text-gray-500">
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
              {indicator === 'health_service_access' && disaggregationData.facilityType && disaggregationData.facilityType.length > 0 && (
                <div className="grid grid-cols-1 gap-8">
                  {/* Health Facility Types */}
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
                </div>
              )}
              
              {/* For non-healthcare supply indicators, show regular disaggregation */}
              {!['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                 'community_healthworker_per_population', 'health_service_access', 'bed_per_population'].includes(indicator) && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Age Groups */}
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
                    
                    {/* Age Group Table */}
                    <div className="mt-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">{language === 'th' ? 'กลุ่มอายุ' : 'Age Group'}</th>
                            <th className="text-right py-2">{language === 'th' ? 'สัดส่วน (%)' : 'Proportion (%)'}</th>
                            <th className="text-right py-2">{language === 'th' ? 'ค่าตัวชี้วัด (%)' : 'Indicator (%)'}</th>
                            <th className="text-right py-2">{language === 'th' ? 'จำนวน' : 'Count'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {disaggregationData.age.map((item, index) => (
                            <tr key={item.group} className="border-b">
                              <td className="py-2 flex items-center">
                                <div 
                                  className="w-3 h-3 rounded mr-2" 
                                  style={{ backgroundColor: ageColors[index % ageColors.length] }}
                                ></div>
                                {item.group}
                              </td>
                              <td className="text-right py-2 font-medium">{item.value.toFixed(1)}%</td>
                              <td className="text-right py-2 text-blue-600">{item.indicatorValue?.toFixed(1) || 'N/A'}%</td>
                              <td className="text-right py-2 text-gray-600">
                                {Math.round((item.indicatorValue || 0) * item.count / 100)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Sex Groups */}
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
                    
                    {/* Sex Group Table */}
                    <div className="mt-4">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2">{language === 'th' ? 'เพศ' : 'Sex'}</th>
                            <th className="text-right py-2">{language === 'th' ? 'สัดส่วน (%)' : 'Proportion (%)'}</th>
                            <th className="text-right py-2">{language === 'th' ? 'ค่าตัวชี้วัด (%)' : 'Indicator (%)'}</th>
                            <th className="text-right py-2">{language === 'th' ? 'จำนวน' : 'Count'}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {disaggregationData.sex.map((item, index) => (
                            <tr key={item.group} className="border-b">
                              <td className="py-2 flex items-center">
                                <div 
                                  className="w-3 h-3 rounded mr-2" 
                                  style={{ backgroundColor: sexColors[index % sexColors.length] }}
                                ></div>
                                {item.group}
                              </td>
                              <td className="text-right py-2 font-medium">{item.value.toFixed(1)}%</td>
                              <td className="text-right py-2 text-blue-600">{item.indicatorValue?.toFixed(1) || 'N/A'}%</td>
                              <td className="text-right py-2 text-gray-600">
                                {Math.round((item.indicatorValue || 0) * item.count / 100)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Combined Employment Status and Occupation Type */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-4">
                      {language === 'th' ? 'ตามสถานะการทำงาน' : 'By Employment Status'}
                    </h4>
                    
                    {disaggregationData.occupation.length > 0 ? (
                      <>
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
                        
                        {/* Enhanced Occupation Group Table */}
                        <div className="mt-4">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">{language === 'th' ? 'สถานะ/ประเภทการทำงาน' : 'Employment Status/Type'}</th>
                                <th className="text-right py-2">{language === 'th' ? 'สัดส่วน (%)' : 'Proportion (%)'}</th>
                                <th className="text-right py-2">{language === 'th' ? 'ค่าตัวชี้วัด (%)' : 'Indicator (%)'}</th>
                                <th className="text-right py-2">{language === 'th' ? 'จำนวน' : 'Count'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {disaggregationData.occupation.map((item, index) => (
                                <tr key={item.group} className="border-b">
                                  <td className="py-2 flex items-center">
                                    <div 
                                      className="w-3 h-3 rounded mr-2" 
                                      style={{ backgroundColor: occupationColors[index % occupationColors.length] }}
                                    ></div>
                                    <span className="text-xs">{item.group}</span>
                                  </td>
                                  <td className="text-right py-2 font-medium">{item.value.toFixed(1)}%</td>
                                  <td className="text-right py-2 text-blue-600">{item.indicatorValue?.toFixed(1) || 'N/A'}%</td>
                                  <td className="text-right py-2 text-gray-600">
                                    {Math.round((item.indicatorValue || 0) * item.count / 100)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div className="h-80 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <p className="text-sm">
                            {language === 'th' 
                              ? 'ไม่มีข้อมูลสถานะการทำงานสำหรับกลุ่มนี้' 
                              : 'No employment status data available for this group'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* WELFARE GROUPS (only for health_coverage indicator) */}
              {!['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                 'community_healthworker_per_population', 'health_service_access', 'bed_per_population'].includes(indicator) &&
               indicator === 'health_coverage' && disaggregationData.welfare.length > 0 && (
                <div className="mt-8">
                  <h4 className="font-medium text-gray-800 mb-4">
                    {language === 'th' ? 'ตามประเภทสิทธิประกันสุขภาพ' : 'By Health Insurance Type'}
                  </h4>
                  
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={disaggregationData.welfare}>
                        <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="group" 
                            angle={0}
                            textAnchor="middle"
                            height={60}
                            tick={{ fontSize: 12 }}
                            interval={0}
                            width={200}
                          />
                        <YAxis tickFormatter={(value) => `${value}%`} />
                        <Tooltip 
                          formatter={(value, name) => [`${value.toFixed(1)}%`, language === 'th' ? 'อัตรา' : 'Rate']}
                          labelFormatter={(label) => `${language === 'th' ? 'ประเภทสิทธิ' : 'Insurance Type'}: ${label}`}
                        />
                        <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]}>
                          {disaggregationData.welfare.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={welfareColors[index % welfareColors.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Welfare Group Table */}
                  <div className="mt-4">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">{language === 'th' ? 'ประเภทสิทธิประกันสุขภาพ' : 'Health Insurance Type'}</th>
                          <th className="text-right py-2">{language === 'th' ? 'สัดส่วน (%)' : 'Proportion (%)'}</th>
                          <th className="text-right py-2">{language === 'th' ? 'ค่าตัวชี้วัด (%)' : 'Indicator (%)'}</th>
                          <th className="text-right py-2">{language === 'th' ? 'จำนวน' : 'Count'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disaggregationData.welfare.map((item, index) => (
                          <tr key={item.group} className="border-b">
                            <td className="py-2 flex items-center">
                              <div 
                                className="w-3 h-3 rounded mr-2" 
                                style={{ backgroundColor: welfareColors[index % welfareColors.length] }}
                              ></div>
                              <span className="text-xs">{item.group}</span>
                            </td>
                            <td className="text-right py-2 font-medium">{item.value.toFixed(1)}%</td>
                            <td className="text-right py-2 text-blue-600">{item.indicatorValue?.toFixed(1) || 'N/A'}%</td>
                            <td className="text-right py-2 text-gray-600">
                              {Math.round((item.indicatorValue || 0) * item.count / 100)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
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