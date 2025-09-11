// Updated IndicatorAnalysis with Language Support
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import Papa from 'papaparse';

const IndicatorAnalysis = () => {
  const { t } = useLanguage();
  const [selectedIndicator, setSelectedIndicator] = useState('population_distribution');
  const [surveyData, setSurveyData] = useState(null);
  const [loading, setLoading] = useState(true);

  const populationGroups = [
    { value: 'informal_workers', color: '#ef4444' },
    { value: 'elderly', color: '#3b82f6' },
    { value: 'disabled', color: '#10b981' },
    { value: 'lgbtq', color: '#fbbf24' }
  ];

  // Available indicators for selection
  const availableIndicators = [
    { value: 'population_distribution', labelKey: 'populationDistribution' },
    { value: 'alcohol_consumption', labelKey: 'alcoholConsumption' },
    { value: 'tobacco_use', labelKey: 'tobaccoUse' },
    { value: 'physical_activity', labelKey: 'physicalActivity' },
    { value: 'obesity', labelKey: 'obesity' },
    { value: 'unemployment_rate', labelKey: 'unemploymentRate' },
    { value: 'violence_physical', labelKey: 'physicalViolence' },
    { value: 'discrimination_experience', labelKey: 'discriminationExperience' },
    { value: 'dental_access', labelKey: 'dentalAccess' }
  ];

  // Thai translations for hot issues indicators
  const hotIssuesTranslations = {
    en: {
      populationDistribution: 'Population Distribution by Group',
      alcoholConsumption: 'Alcohol Consumption',
      tobaccoUse: 'Tobacco Use',
      physicalActivity: 'Insufficient Physical Activity',
      obesity: 'Obesity',
      unemploymentRate: 'Unemployment Rate',
      physicalViolence: 'Physical Violence',
      discriminationExperience: 'Discrimination Experience',
      dentalAccess: 'No Access to Dental Care'
    },
    th: {
      populationDistribution: 'การกระจายประชากรตามกลุ่ม',
      alcoholConsumption: 'การดื่มเครื่องดื่มแอลกอฮอล์',
      tobaccoUse: 'การสูบบุหรี่',
      physicalActivity: 'การออกกำลังกายไม่เพียงพอ',
      obesity: 'ความอ้วน',
      unemploymentRate: 'อัตราการว่างงาน',
      physicalViolence: 'ความรุนแรงทางร่างกาย',
      discriminationExperience: 'การถูกเลือกปฏิบัติ',
      dentalAccess: 'ไม่ได้รับบริการทันตกรรม'
    }
  };

  // District code mapping (same as BasicSDHEProcessor)
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

  // Classify population groups (EXACT same logic as BasicSDHEProcessor)
  const classifyPopulationGroup = (record) => {
    if (record.sex === 'lgbt') return 'lgbtq';
    if (record.age >= 60) return 'elderly';  
    if (record.disable_status === 1) return 'disabled';
    if (record.occupation_status === 1 && record.occupation_contract === 0) return 'informal_workers';
    return 'general_population';
  };

  // Load and process survey data
  React.useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/survey_sampling.csv');
        if (!response.ok) throw new Error('Could not load survey data');
        
        const csvContent = await response.text();
        
        const parsed = Papa.parse(csvContent, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });

        // Process the data with same logic as BasicSDHEProcessor
        const processedData = parsed.data.map(record => ({
          ...record,
          district_name: districtCodeMap[record.dname] || `District_${record.dname}`,
          population_group: classifyPopulationGroup(record)
        }));

        setSurveyData(processedData);
        
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Calculate percentage for specific indicator
  const calculatePercentage = (records, indicator) => {
    if (!records || records.length === 0) return 0;

    let matchCount = 0;
    let totalCount = records.length;

    // Validate records array
    if (!Array.isArray(records)) {
      return 0;
    }

    try {
      switch (indicator) {
        case 'alcohol_consumption':
          // drink_status 1 OR 2
          matchCount = records.filter(r => 
            r && (r.drink_status === 1 || r.drink_status === 2)
          ).length;
          break;
          
        case 'tobacco_use':
          // Age 15+ who smoke (smoke_status 2 or 3)
          const smokingRecords = records.filter(r => r && typeof r.age === 'number' && r.age >= 15);
          totalCount = smokingRecords.length;
          matchCount = smokingRecords.filter(r => 
            r && (r.smoke_status === 2 || r.smoke_status === 3)
          ).length;
          break;
          
        case 'physical_activity':
          // exercise_status 0 or 1 = insufficient physical activity
          matchCount = records.filter(r => 
            r && typeof r.exercise_status === 'number' && (r.exercise_status === 0 || r.exercise_status === 1)
          ).length;
          break;
          
        case 'obesity':
          // BMI >= 30
          const validBMI = records.filter(r => 
            r && typeof r.height === 'number' && typeof r.weight === 'number' && 
            r.height > 0 && r.weight > 0
          );
          totalCount = validBMI.length;
          
          if (totalCount === 0) return 0;
          
          matchCount = validBMI.filter(r => {
            const bmi = r.weight / Math.pow(r.height / 100, 2);
            return !isNaN(bmi) && isFinite(bmi) && bmi >= 30;
          }).length;
          break;
          
        case 'unemployment_rate':
          // occupation_status === 0
          matchCount = records.filter(r => 
            r && r.occupation_status === 0
          ).length;
          break;
          
        case 'violence_physical':
          // physical_violence === 1
          matchCount = records.filter(r => 
            r && r.physical_violence === 1
          ).length;
          break;
          
        case 'discrimination_experience':
          // Any discrimination/1 to discrimination/5 === 1
          matchCount = records.filter(r => 
            r && (r['discrimination/1'] === 1 || r['discrimination/2'] === 1 || 
                  r['discrimination/3'] === 1 || r['discrimination/4'] === 1 || 
                  r['discrimination/5'] === 1)
          ).length;
          break;
          
        case 'dental_access':
          // oral_health_access === 0 (no access to dental care - the problem)
          matchCount = records.filter(r => 
            r && r.oral_health_access === 0
          ).length;
          break;
          
        default:
          return 0;
      }

      // Safety checks
      if (totalCount === 0) return 0;
      if (matchCount < 0) matchCount = 0;
      if (matchCount > totalCount) matchCount = totalCount;

      const percentage = (matchCount / totalCount) * 100;
      
      // Final validation
      if (isNaN(percentage) || !isFinite(percentage) || percentage < 0) {
        return 0;
      }

      return Math.min(100, percentage); // Cap at 100%
      
    } catch (error) {
      return 0;
    }
  };

  // Generate chart data
  const chartData = useMemo(() => {
    if (!surveyData) return [];

    // Special handling for population distribution
    if (selectedIndicator === 'population_distribution') {
      return populationGroups.map(group => {
        const districtValues = [];
        
        // Get unique districts
        const districts = [...new Set(surveyData.map(r => r.district_name))];
        
        districts.forEach(district => {
          const allRecordsInDistrict = surveyData.filter(r => r.district_name === district);
          const groupRecordsInDistrict = surveyData.filter(r => 
            r.district_name === district && r.population_group === group.value
          );
          
          if (allRecordsInDistrict.length >= 5) { // Minimum sample size for district
            const percentage = (groupRecordsInDistrict.length / allRecordsInDistrict.length) * 100;
            
            districtValues.push({
              district: district,
              value: Math.min(100, Math.max(0, percentage)),
              sampleSize: groupRecordsInDistrict.length,
              totalInDistrict: allRecordsInDistrict.length
            });
          }
        });

        // Sort by highest values
        const sortedDistricts = districtValues.sort((a, b) => b.value - a.value);
        
        return {
          group: group.value,
          groupLabel: t(`populationGroups.${group.value}`),
          color: group.color,
          chartData: sortedDistricts.slice(0, 5), // Top 5
          totalDistricts: districtValues.length
        };
      });
    }

    // Regular indicator handling
    return populationGroups.map(group => {
      const districtValues = [];
      
      // Get unique districts
      const districts = [...new Set(surveyData.map(r => r.district_name))];
      
      districts.forEach(district => {
        const records = surveyData.filter(r => 
          r.district_name === district && r.population_group === group.value
        );
        
        if (records.length >= 5) { // Minimum sample size
          const percentage = calculatePercentage(records, selectedIndicator);
          
          // Skip invalid percentages
          if (percentage > 100 || isNaN(percentage) || !isFinite(percentage)) {
            return; // Skip this district
          }
          
          districtValues.push({
            district: district,
            value: Math.min(100, Math.max(0, percentage)),
            sampleSize: records.length
          });
        }
      });

      // Sort by highest values
      const sortedDistricts = districtValues.sort((a, b) => b.value - a.value);
      
      return {
        group: group.value,
        groupLabel: t(`populationGroups.${group.value}`),
        color: group.color,
        chartData: sortedDistricts.slice(0, 5), // Top 5
        totalDistricts: districtValues.length
      };
    });
  }, [surveyData, selectedIndicator, t]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p>{t('ui.loading')}</p>
        </div>
      </div>
    );
  }

  const getIndicatorLabel = (indicator) => {
    const indicatorObj = availableIndicators.find(ind => ind.value === indicator);
    if (indicatorObj) {
      return hotIssuesTranslations[t('').split('.')[0] || 'en'][indicatorObj.labelKey] || indicator;
    }
    return indicator;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">📊 {t('ui.hotIssuesTitle')}</h2>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('ui.selectIndicator')}
          </label>
          <select 
            value={selectedIndicator}
            onChange={(e) => setSelectedIndicator(e.target.value)}
            className="w-full max-w-md p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableIndicators.map(indicator => (
              <option key={indicator.value} value={indicator.value}>
                {getIndicatorLabel(indicator.value)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {chartData.map((groupData) => (
          <div key={groupData.group} className="bg-white rounded-lg shadow-lg p-8">
            <div className="flex items-center mb-6">
              <div 
                className="w-5 h-5 rounded-full mr-4" 
                style={{ backgroundColor: groupData.color }}
              ></div>
              <h3 className="text-xl font-semibold text-gray-900">
                {getIndicatorLabel(selectedIndicator)} - {groupData.groupLabel}
              </h3>
            </div>

            <div className="mb-4">
              <div className="text-sm text-gray-600">
                {selectedIndicator === 'population_distribution' 
                  ? `${t('ui.top5Districts')} ${groupData.groupLabel} (${t('ui.from')} ${groupData.totalDistricts} ${t('ui.totalDistricts')})`
                  : `${t('ui.top5Districts')} (${t('ui.from')} ${groupData.totalDistricts} ${t('ui.totalDistricts')})`
                }
              </div>
            </div>

            {/* Chart */}
            {groupData.chartData.length > 0 ? (
              <div className="h-80 -mb-4" role="img" aria-label={`Hot issues analysis chart for ${groupData.groupLabel}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={groupData.chartData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <XAxis 
                      dataKey="district" 
                      angle={-15}
                      textAnchor="end"
                      height={80}
                      tick={{ fontSize: 11 }}
                      interval={0}
                    />
                    <YAxis 
                      domain={[0, 100]} 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => `${value}%`}
                    />
                    {/* Single bar */}
                    <Bar 
                      dataKey="value" 
                      fill={groupData.color}
                      radius={[4, 4, 0, 0]}
                    >
                      <LabelList 
                        dataKey="value" 
                        position="center"
                        style={{ 
                          fill: 'white', 
                          fontWeight: 'bold', 
                          fontSize: '14px' 
                        }}
                        formatter={(value) => `${value.toFixed(1)}%`}
                      />
                      {groupData.chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={groupData.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-80 flex items-center justify-center text-gray-500 -mb-4">
                <p>{t('ui.noDataForGroup')}</p>
              </div>
            )}

            {/* Rankings */}
            <div className="space-y-3">
              {groupData.chartData.map((district, index) => (
                <div key={district.district} className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                  <span className={`${index === 0 ? 'font-bold text-red-600' : index === 1 ? 'font-semibold text-orange-600' : 'text-gray-700'}`}>
                    #{index + 1}. {district.district}
                  </span>
                  <div className="text-right">
                    <span className="font-medium text-red-600">
                      {district.value.toFixed(1)}%
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      {selectedIndicator === 'population_distribution' 
                        ? `(${district.sampleSize}/${district.totalInDistrict} คน)`
                        : `(${district.sampleSize} คน)`
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IndicatorAnalysis;