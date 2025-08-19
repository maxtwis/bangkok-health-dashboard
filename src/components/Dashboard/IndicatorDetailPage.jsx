// IndicatorDetailPage.jsx - Enhanced with Combined Occupation Status and Type Disaggregation
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
  getIndicatorData 
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

  // Calculate disaggregation data - ENHANCED with combined occupation status and type
  const disaggregationData = useMemo(() => {
    if (!surveyData || !indicator) return null;

    // Filter data for current selection
    let filteredData = surveyData.filter(record => {
      if (district !== 'Bangkok Overall' && record.district_name !== district) return false;
      if (record.population_group !== populationGroup) return false;
      return true;
    });

    return calculateDisaggregation(filteredData, indicator);
  }, [surveyData, indicator, district, populationGroup]);

  // ENHANCED: Calculate disaggregation by age, sex, and combined occupation
  function calculateDisaggregation(records, indicatorKey) {
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

    // ENHANCED: Combined occupation status and type classification
    const getOccupationGroup = (occupationStatus, occupationType) => {
      // First check occupation status
      if (occupationStatus === 0) {
        return language === 'th' ? 'ไม่ได้ประกอบอาชีพ' : 'Not Working';
      }
      
      // If working (occupation_status === 1), then categorize by type
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
      
      // Fallback for unclear cases
      return language === 'th' ? 'ไม่ระบุสถานะ' : 'Status Unclear';
    };

    // Group by age, sex, and enhanced occupation
    const ageGroups = {};
    const sexGroups = {};
    const occupationGroups = {};

    records.forEach(record => {
      const ageGroup = getAgeGroup(record.age);
      const sexGroup = getSexGroup(record.sex);
      const occupationGroup = getOccupationGroup(record.occupation_status, record.occupation_type);

      if (!ageGroups[ageGroup]) ageGroups[ageGroup] = [];
      if (!sexGroups[sexGroup]) sexGroups[sexGroup] = [];
      if (!occupationGroups[occupationGroup]) occupationGroups[occupationGroup] = [];

      ageGroups[ageGroup].push(record);
      sexGroups[sexGroup].push(record);
      
      // Add to occupation groups for all people (not just employed)
      occupationGroups[occupationGroup].push(record);
    });

    // Calculate both demographic distribution AND indicator prevalence for each group
    const calculateGroupData = (groupRecords, totalRecords) => {
      // Demographic percentage (what % of total population this group represents)
      const demographicPercent = (groupRecords.length / totalRecords.length) * 100;
      
      // Indicator prevalence within this specific demographic group
      const indicatorValue = calculateIndicatorValueForGroup(groupRecords, indicatorKey);
      
      return {
        demographicPercent,
        indicatorValue,
        count: groupRecords.length
      };
    };

    // Calculate indicator for each group
    const calculateIndicatorValueForGroup = (groupRecords, indicatorKey) => {
      // Regular indicator calculations - comprehensive set
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

        case 'gout':
          const goutCases = groupRecords.filter(r => 
            r.diseases_status === 1 && r['diseases_type/3'] === 1
          ).length;
          return groupRecords.length > 0 ? (goutCases / groupRecords.length) * 100 : 0;

        case 'chronic_kidney_disease':
          const kidneyDisease = groupRecords.filter(r => 
            r.diseases_status === 1 && r['diseases_type/4'] === 1
          ).length;
          return groupRecords.length > 0 ? (kidneyDisease / groupRecords.length) * 100 : 0;

        case 'cancer':
          const cancerCases = groupRecords.filter(r => 
            r.diseases_status === 1 && r['diseases_type/5'] === 1
          ).length;
          return groupRecords.length > 0 ? (cancerCases / groupRecords.length) * 100 : 0;

        case 'high_cholesterol':
          const highCholesterol = groupRecords.filter(r => 
            r.diseases_status === 1 && r['diseases_type/6'] === 1
          ).length;
          return groupRecords.length > 0 ? (highCholesterol / groupRecords.length) * 100 : 0;

        case 'ischemic_heart_disease':
          const heartDisease = groupRecords.filter(r => 
            r.diseases_status === 1 && r['diseases_type/7'] === 1
          ).length;
          return groupRecords.length > 0 ? (heartDisease / groupRecords.length) * 100 : 0;

        case 'liver_disease':
          const liverDisease = groupRecords.filter(r => 
            r.diseases_status === 1 && r['diseases_type/8'] === 1
          ).length;
          return groupRecords.length > 0 ? (liverDisease / groupRecords.length) * 100 : 0;

        case 'stroke':
          const strokeCases = groupRecords.filter(r => 
            r.diseases_status === 1 && r['diseases_type/9'] === 1
          ).length;
          return groupRecords.length > 0 ? (strokeCases / groupRecords.length) * 100 : 0;

        case 'hiv':
          const hivCases = groupRecords.filter(r => 
            r.diseases_status === 1 && r['diseases_type/10'] === 1
          ).length;
          return groupRecords.length > 0 ? (hivCases / groupRecords.length) * 100 : 0;

        case 'mental_health':
          const mentalHealth = groupRecords.filter(r => 
            r.diseases_status === 1 && r['diseases_type/11'] === 1
          ).length;
          return groupRecords.length > 0 ? (mentalHealth / groupRecords.length) * 100 : 0;

        case 'any_chronic_disease':
          const chronicDisease = groupRecords.filter(r => r.diseases_status === 1).length;
          return groupRecords.length > 0 ? (chronicDisease / groupRecords.length) * 100 : 0;

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

        case 'food_insecurity_moderate':
          const moderateFoodInsecurity = groupRecords.filter(r => r.food_insecurity_1 === 1).length;
          return groupRecords.length > 0 ? (moderateFoodInsecurity / groupRecords.length) * 100 : 0;

        case 'food_insecurity_severe':
          const severeFoodInsecurity = groupRecords.filter(r => r.food_insecurity_2 === 1).length;
          return groupRecords.length > 0 ? (severeFoodInsecurity / groupRecords.length) * 100 : 0;

        case 'work_injury_fatal':
          const fatalInjury = groupRecords.filter(r => r.occupation_injury === 1).length;
          return groupRecords.length > 0 ? (fatalInjury / groupRecords.length) * 100 : 0;

        case 'work_injury_non_fatal':
          const nonFatalInjury = groupRecords.filter(r => r.occupation_small_injury === 1).length;
          return groupRecords.length > 0 ? (nonFatalInjury / groupRecords.length) * 100 : 0;

        case 'medical_consultation_skip_cost':
          const skipConsultation = groupRecords.filter(r => r.medical_skip_1 === 1).length;
          return groupRecords.length > 0 ? (skipConsultation / groupRecords.length) * 100 : 0;

        case 'medical_treatment_skip_cost':
          const skipTreatment = groupRecords.filter(r => r.medical_skip_2 === 1).length;
          return groupRecords.length > 0 ? (skipTreatment / groupRecords.length) * 100 : 0;

        case 'prescribed_medicine_skip_cost':
          const skipMedicine = groupRecords.filter(r => r.medical_skip_3 === 1).length;
          return groupRecords.length > 0 ? (skipMedicine / groupRecords.length) * 100 : 0;

        case 'dental_access':
          const dentalAccess = groupRecords.filter(r => r.oral_health_access === 1).length;
          return groupRecords.length > 0 ? (dentalAccess / groupRecords.length) * 100 : 0;

        case 'functional_literacy':
          const literate = groupRecords.filter(r => 
            r.speak === 1 && r.read === 1 && r.write === 1 && r.math === 1
          ).length;
          return groupRecords.length > 0 ? (literate / groupRecords.length) * 100 : 0;

        case 'health_coverage':
          const healthCoverage = groupRecords.filter(r => 
            r.welfare !== null && r.welfare !== undefined && r.welfare !== 'other' && r.welfare !== 'Other'
          ).length;
          return groupRecords.length > 0 ? (healthCoverage / groupRecords.length) * 100 : 0;

        // EDUCATION INDICATORS
        case 'primary_completion':
          const primaryCompletion = groupRecords.filter(r => r.education >= 2).length;
          return groupRecords.length > 0 ? (primaryCompletion / groupRecords.length) * 100 : 0;

        case 'secondary_completion':
          const secondaryCompletion = groupRecords.filter(r => r.education >= 4).length;
          return groupRecords.length > 0 ? (secondaryCompletion / groupRecords.length) * 100 : 0;

        case 'tertiary_completion':
          const tertiaryCompletion = groupRecords.filter(r => r.education >= 7).length;
          return groupRecords.length > 0 ? (tertiaryCompletion / groupRecords.length) * 100 : 0;

        case 'training_participation':
          const trainingParticipation = groupRecords.filter(r => r.training === 1).length;
          return groupRecords.length > 0 ? (trainingParticipation / groupRecords.length) * 100 : 0;

        // ECONOMIC SECURITY INDICATORS
        case 'catastrophic_health_spending_household':
          const validHouseholdRecords = groupRecords.filter(r => 
            r.hh_health_expense !== null && r.hh_health_expense !== undefined && 
            r.income !== null && r.income !== undefined && r.income > 0
          );
          if (validHouseholdRecords.length === 0) return 0;
          
          const catastrophicHouseholds = validHouseholdRecords.filter(r => {
            const monthlyIncome = r.income_type === 1 ? r.income * 30 : r.income;
            const healthSpendingRatio = (r.hh_health_expense / monthlyIncome) * 100;
            return healthSpendingRatio > 40;
          });
          return (catastrophicHouseholds.length / validHouseholdRecords.length) * 100;

        case 'health_spending_over_10_percent':
          const validPersonalRecords = groupRecords.filter(r => 
            r.health_expense !== null && r.health_expense !== undefined && 
            r.income !== null && r.income !== undefined && r.income > 0
          );
          if (validPersonalRecords.length === 0) return 0;
          
          const highSpenders = validPersonalRecords.filter(r => {
            const monthlyIncome = r.income_type === 1 ? r.income * 30 : r.income;
            const healthSpendingRatio = (r.health_expense / monthlyIncome) * 100;
            return healthSpendingRatio > 10;
          });
          return (highSpenders.length / validPersonalRecords.length) * 100;

        case 'health_spending_over_25_percent':
          const validPersonalRecords25 = groupRecords.filter(r => 
            r.health_expense !== null && r.health_expense !== undefined && 
            r.income !== null && r.income !== undefined && r.income > 0
          );
          if (validPersonalRecords25.length === 0) return 0;
          
          const veryHighSpenders = validPersonalRecords25.filter(r => {
            const monthlyIncome = r.income_type === 1 ? r.income * 30 : r.income;
            const healthSpendingRatio = (r.health_expense / monthlyIncome) * 100;
            return healthSpendingRatio > 25;
          });
          return (veryHighSpenders.length / validPersonalRecords25.length) * 100;

        // PHYSICAL ENVIRONMENT INDICATORS
        case 'electricity_access':
          const electricityAccess = groupRecords.filter(r => r['community_environment/4'] !== 1).length;
          return groupRecords.length > 0 ? (electricityAccess / groupRecords.length) * 100 : 0;

        case 'clean_water_access':
          const cleanWaterAccess = groupRecords.filter(r => r['community_environment/3'] !== 1).length;
          return groupRecords.length > 0 ? (cleanWaterAccess / groupRecords.length) * 100 : 0;

        case 'sanitation_facilities':
          const sanitationAccess = groupRecords.filter(r => r.house_sink === 1).length;
          return groupRecords.length > 0 ? (sanitationAccess / groupRecords.length) * 100 : 0;

        case 'waste_management':
          const wasteManagement = groupRecords.filter(r => r['community_environment/5'] !== 1).length;
          return groupRecords.length > 0 ? (wasteManagement / groupRecords.length) * 100 : 0;

        case 'housing_overcrowding':
          const overcrowding = groupRecords.filter(r => 
            r['community_environment/1'] === 1 || r['community_environment/2'] === 1
          ).length;
          return groupRecords.length > 0 ? (overcrowding / groupRecords.length) * 100 : 0;

        case 'home_ownership':
          const homeOwnership = groupRecords.filter(r => r.house_status === 1).length;
          return groupRecords.length > 0 ? (homeOwnership / groupRecords.length) * 100 : 0;

        case 'disaster_experience':
          const disasterExperience = groupRecords.filter(r => 
            r['community_disaster/1'] === 1 || r['community_disaster/2'] === 1 || 
            r['community_disaster/3'] === 1 || r['community_disaster/4'] === 1
          ).length;
          return groupRecords.length > 0 ? (disasterExperience / groupRecords.length) * 100 : 0;

        // SOCIAL CONTEXT INDICATORS
        case 'community_safety':
          const safetyResponses = groupRecords.filter(r => r.community_safety);
          if (safetyResponses.length === 0) return 0;
          
          return safetyResponses.reduce((sum, r) => {
            if (r.community_safety === '4') return sum + 100;
            if (r.community_safety === '3') return sum + 75;
            if (r.community_safety === '2') return sum + 50;
            if (r.community_safety === '1') return sum + 25;
            return sum;
          }, 0) / safetyResponses.length;

        case 'violence_psychological':
          const psychologicalViolence = groupRecords.filter(r => r.psychological_violence === 1).length;
          return groupRecords.length > 0 ? (psychologicalViolence / groupRecords.length) * 100 : 0;

        case 'violence_sexual':
          const sexualViolence = groupRecords.filter(r => r.sexual_violence === 1).length;
          return groupRecords.length > 0 ? (sexualViolence / groupRecords.length) * 100 : 0;

        case 'social_support':
          const socialSupport = groupRecords.filter(r => r.helper === 1).length;
          return groupRecords.length > 0 ? (socialSupport / groupRecords.length) * 100 : 0;

        case 'community_murder':
          const communityMurder = groupRecords.filter(r => r.community_murder === 1).length;
          return groupRecords.length > 0 ? (communityMurder / groupRecords.length) * 100 : 0;
          
        default:
          return 0;
      }
    };

    // Process age groups - Show demographic composition
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

    // Process sex groups - Show demographic composition
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

    // ENHANCED: Process combined occupation groups - Show both working and non-working
    const occupationData = Object.keys(occupationGroups).map(occupationGroup => {
      const groupData = calculateGroupData(occupationGroups[occupationGroup], records);
      return {
        group: occupationGroup,
        value: groupData.demographicPercent,
        indicatorValue: groupData.indicatorValue,
        count: groupData.count,
        type: 'occupation'
      };
    }).filter(item => item.count > 0) // Only show occupation groups with data
    .sort((a, b) => {
      // Custom sort: Not Working first, then by count (largest first)
      if (a.group.includes('ไม่ได้ประกอบอาชีพ') || a.group.includes('Not Working')) return -1;
      if (b.group.includes('ไม่ได้ประกอบอาชีพ') || b.group.includes('Not Working')) return 1;
      return b.count - a.count;
    });

    return {
      age: ageData,
      sex: sexData,
      occupation: occupationData, // Enhanced with combined status and type
      total: {
        value: calculateIndicatorValueForGroup(records, indicatorKey),
        count: records.length
      }
    };
  }

  // Color schemes
  const ageColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc'];
  const sexColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];
  const occupationColors = ['#dc2626', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']; // Red for "Not Working"

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
                { id: 'methodology', icon: Calculator, label: language === 'th' ? 'วิธีการคำนวณ' : 'Methodology' }
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

        {/* Disaggregation Tab - ENHANCED with combined occupation status and type */}
        {activeTab === 'disaggregation' && disaggregationData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {language === 'th' ? 'การแยกย่อยข้อมูลตามกลุ่มอายุ เพศ และสถานะการทำงาน' : 'Disaggregation by Age, Sex and Employment Status'}
              </h3>
              
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

                {/* ENHANCED: Combined Employment Status and Occupation Type */}
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
            </div>
          </div>
        )}

        {/* Methodology Tab */}
        {activeTab === 'methodology' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {language === 'th' ? 'วิธีการคำนวณและแหล่งข้อมูล' : 'Calculation Method and Data Source'}
              </h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">
                    {language === 'th' ? 'สูตรการคำนวณ' : 'Calculation Formula'}
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