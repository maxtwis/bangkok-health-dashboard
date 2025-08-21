import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';

const IndicatorDetailPage = ({ 
  indicator, 
  domain, 
  district, 
  populationGroup, 
  onBack, 
  getIndicatorData,
  surveyData,
  healthFacilitiesData
}) => {
  const { language, t } = useLanguage();

  // Define welfare mapping
  const getWelfareGroup = (welfare) => {
    const welfareMap = {
      'สปสช.': language === 'th' ? 'สปสช.' : 'NHSO',
      'สปส.': language === 'th' ? 'สปส.' : 'SSO', 
      'ข้าราชการ': language === 'th' ? 'ข้าราชการ' : 'Civil Servant',
      'จ่ายเอง': language === 'th' ? 'จ่ายเอง' : 'Self-pay',
      'อื่นๆ': language === 'th' ? 'อื่นๆ' : 'Others'
    };
    
    if (welfare && welfareMap[welfare]) {
      return welfareMap[welfare];
    }
    
    return welfare || (language === 'th' ? 'ไม่ระบุ' : 'Not specified');
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
    if (!healthFacilitiesData) {
      console.warn('healthFacilitiesData is not available');
      return [];
    }

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
        return language === 'th' ? 'ว่างงาน' : 'Unemployed';
      }
      
      if (occupationStatus === 1) {
        if (occupationType && occupationType.includes('เกษตร')) {
          return language === 'th' ? 'เกษตรกรรม' : 'Agriculture';
        } else if (occupationType && (occupationType.includes('ค้าขาย') || occupationType.includes('ธุรกิจ'))) {
          return language === 'th' ? 'ค้าขาย/ธุรกิจ' : 'Trade/Business';
        } else if (occupationType && occupationType.includes('รับจ้าง')) {
          return language === 'th' ? 'รับจ้าง' : 'Daily Labor';
        } else if (occupationType && occupationType.includes('ข้าราชการ')) {
          return language === 'th' ? 'ข้าราชการ' : 'Government';
        } else if (occupationType && occupationType.includes('พนักงานบริษัท')) {
          return language === 'th' ? 'พนักงานบริษัท' : 'Company Employee';
        } else {
          return language === 'th' ? 'อื่นๆ' : 'Others';
        }
      }
      
      return language === 'th' ? 'ไม่ระบุ' : 'Not specified';
    };

    // Calculate rates for each demographic group
    const calculateGroupedRates = (groupFunction, records) => {
      const groups = {};
      
      records.forEach(record => {
        const group = groupFunction(record);
        if (!groups[group]) {
          groups[group] = { total: 0, positive: 0 };
        }
        groups[group].total++;
        
        // Calculate positive cases based on indicator
        if (calculateIndicatorPositive(record, indicator)) {
          groups[group].positive++;
        }
      });

      return Object.keys(groups).map(group => ({
        group,
        value: groups[group].total > 0 ? (groups[group].positive / groups[group].total) * 100 : 0,
        count: groups[group].positive,
        total: groups[group].total,
        type: 'demographic'
      }));
    };

    return {
      age: calculateGroupedRates(record => getAgeGroup(record.age), records),
      sex: calculateGroupedRates(record => getSexGroup(record.sex), records),
      occupation: calculateGroupedRates(record => getOccupationGroup(record.occupation_status, record.occupation_type), records),
      welfare: calculateGroupedRates(record => getWelfareGroup(record.welfare), records)
    };
  }

  // Calculate if a record meets the indicator criteria (positive case)
  function calculateIndicatorPositive(record, indicator) {
    switch (indicator) {
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
      
      case 'health_coverage':
        return record.welfare !== null && record.welfare !== undefined && record.welfare !== 'other' && record.welfare !== 'Other';
      
      case 'medical_consultation_skip_cost':
        return record.medical_skip_1 === 1;
      
      case 'medical_treatment_skip_cost':
        return record.medical_skip_2 === 1;
      
      case 'prescribed_medicine_skip_cost':
        return record.medical_skip_3 === 1;
      
      case 'dental_access':
        return record.oral_health_access === 1;
      
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
      
      case 'alcohol_consumption':
        return record.drink_status === 1 || record.drink_status === 2;
      
      case 'tobacco_use':
        return record.smoke_status === 1;
      
      case 'exercise_regular':
        return record.exercise_status === 1;
      
      case 'any_chronic_disease':
        return record.diseases_status === 1;
      
      case 'diabetes':
        return record['diseases_type/1'] === 1;
      
      case 'hypertension':
        return record['diseases_type/2'] === 1;
      
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
      
      default:
        return false;
    }
  }

  // Get indicator title
  const getIndicatorTitle = () => {
    if (!currentIndicator) return indicator;
    return currentIndicator.label || indicator;
  };

  if (!currentIndicator) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
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
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            {language === 'th' ? 'กลับ' : 'Back'}
          </button>
        </div>

        {/* Indicator Overview */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-3">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {getIndicatorTitle()}
              </h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>
                  <strong>{language === 'th' ? 'โดเมน' : 'Domain'}:</strong> {t(`domains.${domain}`)}
                </span>
                <span>
                  <strong>{language === 'th' ? 'กลุ่มประชากร' : 'Population'}:</strong> {t(`populationGroups.${populationGroup}`)}
                </span>
                <span>
                  <strong>{language === 'th' ? 'เขต' : 'District'}:</strong> {district}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {currentIndicator.value !== null && currentIndicator.value !== undefined 
                    ? `${currentIndicator.value.toFixed(1)}%` 
                    : 'N/A'}
                </div>
                <div className="text-sm text-gray-500">
                  {language === 'th' ? 'คะแนน' : 'Score'}
                </div>
                {currentIndicator.sample_size && (
                  <div className="text-xs text-gray-400 mt-1">
                    n = {currentIndicator.sample_size.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Disaggregation Analysis */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {disaggregationData && (disaggregationData.age.length > 0 || disaggregationData.facilityType.length > 0)
                ? (indicator === 'health_service_access'
                    ? (language === 'th' ? 'การแยกย่อยข้อมูลตามประเภทสถานพยาบาล' : 'Disaggregation by Health Facility Type')
                    : disaggregationData.welfare && disaggregationData.welfare.length > 0
                      ? (language === 'th' ? 'การแยกย่อยข้อมูลตามกลุ่มอายุ เพศ สถานะการทำงาน และประเภทสิทธิประกันสุขภาพ' : 'Disaggregation by Age, Sex, Employment Status and Health Insurance Type')
                      : (language === 'th' ? 'การแยกย่อยข้อมูลตามกลุ่มอายุ เพศ และสถานะการทำงาน' : 'Disaggregation by Age, Sex and Employment Status')
                    )
                : (language === 'th' ? 'การแยกย่อยข้อมูลตามกลุ่มอายุ เพศ และสถานะการทำงาน' : 'Disaggregation by Age, Sex and Employment Status')
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
                      ? 'ตัวชี้วัดนี้คำนวดจากข้อมูลสถานพยาบาลและจำนวนประชากรรวม ไม่สามารถแยกย่อยตามลักษณะประชากรได้' 
                      : 'This indicator is calculated from health facility data and total population. Demographic disaggregation is not available.'}
                  </p>
                </div>
              </div>
            )}
            
            {/* For health_service_access, show facility type disaggregation */}
            {indicator === 'health_service_access' && disaggregationData?.facilityType && disaggregationData.facilityType.length > 0 && (
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
                          <th className="text-right py-2">{language === 'th' ? 'จำนวน' : 'Count'}</th>
                          <th className="text-right py-2">{language === 'th' ? 'ต่อประชากร 10,000 คน' : 'Per 10,000 Population'}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {disaggregationData.facilityType.map((item, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-2">{item.group}</td>
                            <td className="text-right py-2">{item.value.toFixed(1)}%</td>
                            <td className="text-right py-2">{item.count}</td>
                            <td className="text-right py-2">{item.indicatorValue.toFixed(1)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
            
            {/* For regular indicators, show demographic disaggregation */}
            {disaggregationData && disaggregationData.age && disaggregationData.age.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Age Groups */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">
                    {language === 'th' ? 'ตามกลุ่มอายุ' : 'By Age Group'}
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={disaggregationData.age}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="group" />
                        <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                        <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, language === 'th' ? 'อัตรา' : 'Rate']} />
                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
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
                  <h4 className="font-medium text-gray-800 mb-4">
                    {language === 'th' ? 'ตามเพศ' : 'By Sex'}
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={disaggregationData.sex}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="group" />
                        <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                        <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, language === 'th' ? 'อัตรา' : 'Rate']} />
                        <Bar dataKey="value" fill="#ef4444" radius={[4, 4, 0, 0]}>
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
                  <h4 className="font-medium text-gray-800 mb-4">
                    {language === 'th' ? 'ตามสถานะการทำงาน' : 'By Employment Status'}
                  </h4>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={disaggregationData.occupation}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="group" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          tick={{ fontSize: 10 }}
                        />
                        <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                        <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, language === 'th' ? 'อัตรา' : 'Rate']} />
                        <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]}>
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
                    <h4 className="font-medium text-gray-800 mb-4">
                      {language === 'th' ? 'ตามประเภทสิทธิประกันสุขภาพ' : 'By Health Insurance Type'}
                    </h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={disaggregationData.welfare}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="group" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            tick={{ fontSize: 10 }}
                          />
                          <YAxis tickFormatter={(value) => `${value.toFixed(0)}%`} />
                          <Tooltip formatter={(value) => [`${value.toFixed(1)}%`, language === 'th' ? 'อัตรา' : 'Rate']} />
                          <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]}>
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

            {/* No data message for indicators without disaggregation */}
            {(!disaggregationData || 
              (disaggregationData.age.length === 0 && 
               disaggregationData.facilityType.length === 0)) && (
              <div className="text-center py-8 text-gray-500">
                <p>
                  {language === 'th' 
                    ? 'ไม่มีข้อมูลสำหรับการแยกย่อยในตัวชี้วัดนี้' 
                    : 'No disaggregation data available for this indicator'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            {language === 'th' ? 'ข้อมูลเพิ่มเติม' : 'Additional Information'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                {language === 'th' ? 'รายละเอียดตัวชี้วัด' : 'Indicator Details'}
              </h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">{language === 'th' ? 'โดเมน:' : 'Domain:'}</span> {t(`domains.${domain}`)}
                </div>
                <div>
                  <span className="font-medium">{language === 'th' ? 'ประเภท:' : 'Type:'}</span> 
                  {['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                    'community_healthworker_per_population', 'health_service_access', 'bed_per_population'].includes(indicator)
                    ? (language === 'th' ? ' ตัวชี้วัดทรัพยากรสุขภาพ' : ' Healthcare Supply Indicator')
                    : (language === 'th' ? ' ตัวชี้วัดจากการสำรวจ' : ' Survey-based Indicator')
                  }
                </div>
                {currentIndicator.sample_size && (
                  <div>
                    <span className="font-medium">{language === 'th' ? 'ขนาดตัวอย่าง:' : 'Sample Size:'}</span> {currentIndicator.sample_size.toLocaleString()}
                  </div>
                )}
                {currentIndicator.population && (
                  <div>
                    <span className="font-medium">{language === 'th' ? 'ประชากรรวม:' : 'Total Population:'}</span> {currentIndicator.population.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-700 mb-2">
                {language === 'th' ? 'การตีความผลลัพธ์' : 'Result Interpretation'}
              </h4>
              <div className="text-sm text-gray-600">
                {currentIndicator.value !== null && currentIndicator.value !== undefined ? (
                  <div>
                    <p className="mb-2">
                      {language === 'th' 
                        ? `ตัวชี้วัดนี้มีค่า ${currentIndicator.value.toFixed(1)}% ในกลุ่ม${t(`populationGroups.${populationGroup}`)} ในเขต${district}`
                        : `This indicator shows ${currentIndicator.value.toFixed(1)}% for ${t(`populationGroups.${populationGroup}`)} in ${district}`
                      }
                    </p>
                    
                    {/* Interpretation based on indicator type */}
                    {['doctor_per_population', 'nurse_per_population', 'healthworker_per_population', 
                      'community_healthworker_per_population', 'health_service_access', 'bed_per_population'].includes(indicator) ? (
                      <p className="text-blue-700">
                        {language === 'th' 
                          ? 'ค่าที่สูงกว่าแสดงถึงการเข้าถึงทรัพยากรสุขภาพที่ดีกว่า' 
                          : 'Higher values indicate better access to healthcare resources'}
                      </p>
                    ) : (
                      <p className="text-blue-700">
                        {language === 'th' 
                          ? 'การตีความผลลัพธ์ขึ้นอยู่กับลักษณะของตัวชี้วัด' 
                          : 'Result interpretation depends on the nature of the indicator'}
                      </p>
                    )}
                  </div>
                ) : (
                  <p>
                    {language === 'th' 
                      ? 'ไม่มีข้อมูลสำหรับตัวชี้วัดนี้' 
                      : 'No data available for this indicator'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndicatorDetailPage;