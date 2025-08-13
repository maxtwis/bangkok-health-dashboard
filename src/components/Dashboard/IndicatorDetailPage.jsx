// IndicatorDetailPage.jsx - Fixed version
import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, Users, TrendingUp, Calculator, Info, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

// Simple fallback hook if useIndicatorDetails doesn't load
const useFallbackIndicatorDetails = () => {
  return {
    getIndicatorInfo: (indicator, language) => ({
      name: indicator,
      description: language === 'th' ? 'ไม่มีคำอธิบาย' : 'No description available',
      calculation: language === 'th' ? 'ไม่ระบุวิธีการคำนวณ' : 'Calculation method not specified'
    }),
    loading: false
  };
};

// Try to import the hook, but provide fallback if it fails
let useIndicatorDetailsHook;
try {
  useIndicatorDetailsHook = require('../../hooks/useIndicatorDetails').default;
} catch (error) {
  console.warn('useIndicatorDetails hook not found, using fallback');
  useIndicatorDetailsHook = useFallbackIndicatorDetails;
}

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
  const { getIndicatorInfo, loading: indicatorDetailsLoading } = useIndicatorDetailsHook();
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

    return calculateDisaggregation(filteredData, indicator);
  }, [surveyData, indicator, district, populationGroup]);

  // Calculate disaggregation by age and sex
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

    // Group by age and sex
    const ageGroups = {};
    const sexGroups = {};

    records.forEach(record => {
      const ageGroup = getAgeGroup(record.age);
      const sexGroup = getSexGroup(record.sex);

      if (!ageGroups[ageGroup]) ageGroups[ageGroup] = [];
      if (!sexGroups[sexGroup]) sexGroups[sexGroup] = [];

      ageGroups[ageGroup].push(record);
      sexGroups[sexGroup].push(record);
    });

    // Calculate indicator for each group
    const calculateIndicatorValue = (groupRecords) => {
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
          
        default:
          return 0;
      }
    };

    // Process age groups
    const ageData = Object.keys(ageGroups).map(ageGroup => ({
      group: ageGroup,
      value: calculateIndicatorValue(ageGroups[ageGroup]),
      count: ageGroups[ageGroup].length,
      type: 'age'
    })).sort((a, b) => {
      const ageOrder = ['< 18', '18-29', '30-44', '45-59', '60+'];
      return ageOrder.indexOf(a.group) - ageOrder.indexOf(b.group);
    });

    // Process sex groups
    const sexData = Object.keys(sexGroups).map(sexGroup => ({
      group: sexGroup,
      value: calculateIndicatorValue(sexGroups[sexGroup]),
      count: sexGroups[sexGroup].length,
      type: 'sex'
    }));

    return {
      age: ageData,
      sex: sexData,
      total: {
        value: calculateIndicatorValue(records),
        count: records.length
      }
    };
  }

  // Color schemes
  const ageColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc'];
  const sexColors = ['#ef4444', '#f97316', '#eab308', '#22c55e'];

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

        {/* Disaggregation Tab */}
        {activeTab === 'disaggregation' && disaggregationData && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                {language === 'th' ? 'การแยกย่อยข้อมูลตามกลุ่มอายุและเพศ' : 'Disaggregation by Age and Sex'}
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                          <th className="text-right py-2">{language === 'th' ? 'อัตรา (%)' : 'Rate (%)'}</th>
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
                            <td className="text-right py-2 text-gray-600">{item.count}</td>
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
                          <th className="text-right py-2">{language === 'th' ? 'อัตรา (%)' : 'Rate (%)'}</th>
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
                            <td className="text-right py-2 text-gray-600">{item.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Equity Analysis */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {language === 'th' ? 'การวิเคราะห์ความเท่าเทียม' : 'Equity Analysis'}
              </h3>
              
              {disaggregationData.age.length > 1 && (
                <div className="mb-4 p-4 bg-yellow-50 rounded-lg">
                  <h4 className="font-medium text-yellow-900 mb-2">
                    {language === 'th' ? 'ความแตกต่างตามอายุ' : 'Age Disparities'}
                  </h4>
                  <p className="text-yellow-800 text-sm">
                    {(() => {
                      const values = disaggregationData.age.map(d => d.value);
                      const max = Math.max(...values);
                      const min = Math.min(...values);
                      const ratio = max / min;
                      
                      return language === 'th' 
                        ? `ความแตกต่างระหว่างกลุ่มอายุสูงสุดและต่ำสุด: ${(max - min).toFixed(1)} เปอร์เซ็นต์พอยต์ (อัตราส่วน: ${ratio.toFixed(1)}:1)`
                        : `Difference between highest and lowest age groups: ${(max - min).toFixed(1)} percentage points (ratio: ${ratio.toFixed(1)}:1)`;
                    })()}
                  </p>
                </div>
              )}
              
              {disaggregationData.sex.length > 1 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">
                    {language === 'th' ? 'ความแตกต่างตามเพศ' : 'Sex Disparities'}
                  </h4>
                  <p className="text-blue-800 text-sm">
                    {(() => {
                      const values = disaggregationData.sex.map(d => d.value);
                      const max = Math.max(...values);
                      const min = Math.min(...values);
                      const ratio = max / min;
                      
                      return language === 'th' 
                        ? `ความแตกต่างระหว่างเพศ: ${(max - min).toFixed(1)} เปอร์เซ็นต์พอยต์ (อัตราส่วน: ${ratio.toFixed(1)}:1)`
                        : `Difference between sexes: ${(max - min).toFixed(1)} percentage points (ratio: ${ratio.toFixed(1)}:1)`;
                    })()}
                  </p>
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
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">
                    {language === 'th' ? 'แหล่งข้อมูล' : 'Data Source'}
                  </h4>
                  <p className="text-gray-700">
                    {language === 'th' 
                      ? 'ข้อมูลจากโครงการการพัฒนาตัวชี้วัดและระบบกลไกเก็บข้อมูล เพื่อลดความเหลื่อมล้ำทางสุขภาวะในเขตเมือง พื้นที่กรุงเทพมหานคร กรมการแพทย์ กรุงเทพมหานคร'
                      : 'Data from Million Health Check Project, Medical Department, Bangkok Metropolitan Administration'
                    }
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 mb-3">
                    {language === 'th' ? 'ข้อจำกัด' : 'Limitations'}
                  </h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>
                      {language === 'th' 
                        ? 'ข้อมูลจากการสำรวจในช่วงเวลาหนึ่ง อาจไม่สะท้อนการเปลี่ยนแปลงตามเวลา'
                        : 'Cross-sectional data may not reflect changes over time'
                      }
                    </li>
                    <li>
                      {language === 'th' 
                        ? 'การจำแนกกลุ่มประชากรอาจมีข้อจำกัดในการครอบคลุมความหลากหลาย'
                        : 'Population group classifications may have limitations in capturing diversity'
                      }
                    </li>
                    <li>
                      {language === 'th' 
                        ? 'ขนาดกลุ่มตัวอย่างในบางเขตอาจมีจำนวนจำกัด'
                        : 'Sample sizes in some districts may be limited'
                      }
                    </li>
                  </ul>
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