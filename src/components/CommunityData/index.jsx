import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Users, MapPin, BarChart3, Info } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import { useLanguage } from '../../contexts/LanguageContext';
import { DOMAINS } from '../../constants/dashboardConstants';
import useCommunityData from '../../hooks/useCommunityData';

const CommunityData = ({ onBack }) => {
  const { language } = useLanguage();
  const { data: communityData, loading, error } = useCommunityData();

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');

  // District code to name mapping
  const districtCodeMap = useMemo(() => ({
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
  }), []);

  // Extract unique districts and communities
  const districts = useMemo(() => {
    if (!communityData) return [];
    const uniqueDistrictCodes = [...new Set(communityData.map(d => d.dname))].filter(Boolean);
    return uniqueDistrictCodes
      .map(code => ({
        code: code,
        name: districtCodeMap[code] || code
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'th'));
  }, [communityData, districtCodeMap]);

  const communities = useMemo(() => {
    if (!communityData || !selectedDistrict) return [];
    const districtCode = parseInt(selectedDistrict);
    const filtered = communityData
      .filter(d => d.dname === districtCode)
      .map(d => d.community_name)
      .filter(Boolean);
    return [...new Set(filtered)].sort();
  }, [communityData, selectedDistrict]);

  // Auto-select first community when district changes
  useEffect(() => {
    if (communities.length > 0 && !selectedCommunity) {
      setSelectedCommunity(communities[0]);
    }
  }, [communities, selectedCommunity]);

  // Filter data for selected community
  const communityRecords = useMemo(() => {
    if (!communityData || !selectedDistrict || !selectedCommunity) return [];
    // Convert selectedDistrict to number for comparison since dname is a number in CSV
    const districtCode = parseInt(selectedDistrict);
    const filtered = communityData.filter(d =>
      d.dname === districtCode && d.community_name === selectedCommunity
    );
    console.log('Filtering:', { districtCode, selectedCommunity, totalRecords: communityData.length, filtered: filtered.length });
    return filtered;
  }, [communityData, selectedDistrict, selectedCommunity]);

  // Calculate demographic distributions
  const demographics = useMemo(() => {
    if (communityRecords.length === 0) return null;

    // Age distribution
    const ageGroups = {
      '< 18': 0,
      '18-29': 0,
      '30-44': 0,
      '45-59': 0,
      '60+': 0
    };

    // Sex distribution
    const sexGroups = {
      [language === 'th' ? 'ชาย' : 'Male']: 0,
      [language === 'th' ? 'หญิง' : 'Female']: 0,
      'LGBTQ+': 0
    };

    // Disability status
    const disabilityGroups = {
      [language === 'th' ? 'มีความพิการ' : 'Disabled']: 0,
      [language === 'th' ? 'ไม่มีความพิการ' : 'Not Disabled']: 0
    };

    // Occupation status
    const occupationGroups = {
      [language === 'th' ? 'มีงานทำ' : 'Employed']: 0,
      [language === 'th' ? 'ว่างงาน' : 'Unemployed']: 0
    };

    // Welfare type
    const welfareGroups = {
      [language === 'th' ? 'สิทธิข้าราชการ' : 'Civil Servant']: 0,
      [language === 'th' ? 'ประกันสังคม' : 'Social Security']: 0,
      [language === 'th' ? 'บัตรทอง (30 บาท)' : 'Universal Coverage']: 0,
      [language === 'th' ? 'อื่นๆ' : 'Others']: 0
    };

    communityRecords.forEach(record => {
      // Age
      const age = record.age;
      if (age < 18) ageGroups['< 18']++;
      else if (age < 30) ageGroups['18-29']++;
      else if (age < 45) ageGroups['30-44']++;
      else if (age < 60) ageGroups['45-59']++;
      else ageGroups['60+']++;

      // Sex
      if (record.sex === 'male') sexGroups[language === 'th' ? 'ชาย' : 'Male']++;
      else if (record.sex === 'female') sexGroups[language === 'th' ? 'หญิง' : 'Female']++;
      else if (record.sex === 'lgbt') sexGroups['LGBTQ+']++;

      // Disability
      if (record.disable_status === 1) {
        disabilityGroups[language === 'th' ? 'มีความพิการ' : 'Disabled']++;
      } else {
        disabilityGroups[language === 'th' ? 'ไม่มีความพิการ' : 'Not Disabled']++;
      }

      // Occupation
      if (record.occupation_status === 1) {
        occupationGroups[language === 'th' ? 'มีงานทำ' : 'Employed']++;
      } else {
        occupationGroups[language === 'th' ? 'ว่างงาน' : 'Unemployed']++;
      }

      // Welfare
      if (record.welfare === 1) welfareGroups[language === 'th' ? 'สิทธิข้าราชการ' : 'Civil Servant']++;
      else if (record.welfare === 2) welfareGroups[language === 'th' ? 'ประกันสังคม' : 'Social Security']++;
      else if (record.welfare === 3) welfareGroups[language === 'th' ? 'บัตรทอง (30 บาท)' : 'Universal Coverage']++;
      else welfareGroups[language === 'th' ? 'อื่นๆ' : 'Others']++;
    });

    const total = communityRecords.length;

    return {
      age: Object.entries(ageGroups).map(([name, count]) => ({
        name,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      })),
      sex: Object.entries(sexGroups).map(([name, count]) => ({
        name,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      })),
      disability: Object.entries(disabilityGroups).map(([name, count]) => ({
        name,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      })),
      occupation: Object.entries(occupationGroups).map(([name, count]) => ({
        name,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      })),
      welfare: Object.entries(welfareGroups).map(([name, count]) => ({
        name,
        count,
        percentage: ((count / total) * 100).toFixed(1)
      }))
    };
  }, [communityRecords, language]);

  // Calculate SDHE indicators for each domain
  const domainSummaries = useMemo(() => {
    if (communityRecords.length === 0) return [];

    const summaries = [];

    // Economic Security
    const employed = communityRecords.filter(r => r.occupation_status === 1).length;
    const vulnerable = communityRecords.filter(r => r.occupation_status === 1 && r.occupation_contract === 0).length;
    const foodInsecure = communityRecords.filter(r => r.food_insecurity_1 === 1 || r.food_insecurity_2 === 1).length;

    summaries.push({
      domain: language === 'th' ? 'ความมั่นคงทางเศรษฐกิจ' : 'Economic Security',
      color: '#3B82F6',
      indicators: [
        {
          name: language === 'th' ? 'อัตราการมีงานทำ' : 'Employment Rate',
          value: ((employed / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${employed} จาก ${communityRecords.length} คน (${((employed / communityRecords.length) * 100).toFixed(1)}%) มีงานทำ`
            : `${employed} out of ${communityRecords.length} people (${((employed / communityRecords.length) * 100).toFixed(1)}%) are employed`
        },
        {
          name: language === 'th' ? 'การจ้างงานเปราะบาง' : 'Vulnerable Employment',
          value: employed > 0 ? ((vulnerable / employed) * 100).toFixed(1) : '0',
          description: language === 'th'
            ? `${vulnerable} จาก ${employed} ผู้มีงานทำ (${employed > 0 ? ((vulnerable / employed) * 100).toFixed(1) : 0}%) อยู่ในสถานะการจ้างงานเปราะบาง (ไม่มีสัญญาจ้าง)`
            : `${vulnerable} out of ${employed} employed (${employed > 0 ? ((vulnerable / employed) * 100).toFixed(1) : 0}%) are in vulnerable employment (no contract)`
        },
        {
          name: language === 'th' ? 'ความไม่มั่นคงทางอาหาร' : 'Food Insecurity',
          value: ((foodInsecure / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${foodInsecure} คน (${((foodInsecure / communityRecords.length) * 100).toFixed(1)}%) ประสบปัญหาความไม่มั่นคงทางอาหาร`
            : `${foodInsecure} people (${((foodInsecure / communityRecords.length) * 100).toFixed(1)}%) experience food insecurity`
        }
      ]
    });

    // Healthcare Access
    const healthCoverage = communityRecords.filter(r => r.welfare && r.welfare !== 'other').length;
    const dentalAccess = communityRecords.filter(r => r.oral_health_access === 1).length;
    const skipMedical = communityRecords.filter(r => r.medical_skip_1 === 1 || r.medical_skip_2 === 1 || r.medical_skip_3 === 1).length;

    summaries.push({
      domain: language === 'th' ? 'การเข้าถึงบริการสุขภาพ' : 'Healthcare Access',
      color: '#EF4444',
      indicators: [
        {
          name: language === 'th' ? 'มีหลักประกันสุขภาพ' : 'Health Coverage',
          value: ((healthCoverage / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${healthCoverage} คน (${((healthCoverage / communityRecords.length) * 100).toFixed(1)}%) มีหลักประกันสุขภาพ`
            : `${healthCoverage} people (${((healthCoverage / communityRecords.length) * 100).toFixed(1)}%) have health insurance`
        },
        {
          name: language === 'th' ? 'เข้าถึงบริการทันตกรรม' : 'Dental Access',
          value: ((dentalAccess / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${dentalAccess} คน (${((dentalAccess / communityRecords.length) * 100).toFixed(1)}%) สามารถเข้าถึงบริการทันตกรรมได้`
            : `${dentalAccess} people (${((dentalAccess / communityRecords.length) * 100).toFixed(1)}%) can access dental services`
        },
        {
          name: language === 'th' ? 'งดรับบริการสุขภาพเนื่องจากค่าใช้จ่าย' : 'Skip Medical Due to Cost',
          value: ((skipMedical / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${skipMedical} คน (${((skipMedical / communityRecords.length) * 100).toFixed(1)}%) งดรับบริการสุขภาพเนื่องจากค่าใช้จ่าย`
            : `${skipMedical} people (${((skipMedical / communityRecords.length) * 100).toFixed(1)}%) skip medical services due to cost`
        }
      ]
    });

    // Physical Environment
    const homeOwnership = communityRecords.filter(r => r.house_status === 1).length;
    const cleanWater = communityRecords.filter(r => r.community_environment_3 !== 1).length;
    const disasterExp = communityRecords.filter(r =>
      r.community_disaster_1 === 1 || r.community_disaster_2 === 1 ||
      r.community_disaster_3 === 1 || r.community_disaster_4 === 1 ||
      r.community_disaster_5 === 1 || r.community_disaster_6 === 1 ||
      r.community_disaster_7 === 1 || r.community_disaster_8 === 1
    ).length;

    summaries.push({
      domain: language === 'th' ? 'สภาพแวดล้อมทางกายภาพ' : 'Physical Environment',
      color: '#10B981',
      indicators: [
        {
          name: language === 'th' ? 'เป็นเจ้าของบ้าน' : 'Home Ownership',
          value: ((homeOwnership / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${homeOwnership} คน (${((homeOwnership / communityRecords.length) * 100).toFixed(1)}%) เป็นเจ้าของบ้าน`
            : `${homeOwnership} people (${((homeOwnership / communityRecords.length) * 100).toFixed(1)}%) own their homes`
        },
        {
          name: language === 'th' ? 'เข้าถึงน้ำสะอาด' : 'Clean Water Access',
          value: ((cleanWater / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${cleanWater} คน (${((cleanWater / communityRecords.length) * 100).toFixed(1)}%) มีการเข้าถึงน้ำสะอาด`
            : `${cleanWater} people (${((cleanWater / communityRecords.length) * 100).toFixed(1)}%) have access to clean water`
        },
        {
          name: language === 'th' ? 'ประสบภัยพิบัติ' : 'Disaster Experience',
          value: ((disasterExp / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${disasterExp} คน (${((disasterExp / communityRecords.length) * 100).toFixed(1)}%) เคยประสบภัยพิบัติ`
            : `${disasterExp} people (${((disasterExp / communityRecords.length) * 100).toFixed(1)}%) experienced disasters`
        }
      ]
    });

    // Social Context
    const socialSupport = communityRecords.filter(r => r.helper === 1).length;
    const discrimination = communityRecords.filter(r =>
      r.discrimination_1 === 1 || r.discrimination_2 === 1 ||
      r.discrimination_3 === 1 || r.discrimination_4 === 1 ||
      r.discrimination_5 === 1 || r.discrimination_other === 1
    ).length;
    const violence = communityRecords.filter(r =>
      r.physical_violence === 1 || r.psychological_violence === 1 || r.sexual_violence === 1
    ).length;

    summaries.push({
      domain: language === 'th' ? 'บริบททางสังคม' : 'Social Context',
      color: '#8B5CF6',
      indicators: [
        {
          name: language === 'th' ? 'มีผู้ช่วยเหลือเมื่อเจ็บป่วย' : 'Social Support',
          value: ((socialSupport / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${socialSupport} คน (${((socialSupport / communityRecords.length) * 100).toFixed(1)}%) มีผู้ช่วยเหลือเมื่อเจ็บป่วย`
            : `${socialSupport} people (${((socialSupport / communityRecords.length) * 100).toFixed(1)}%) have social support when ill`
        },
        {
          name: language === 'th' ? 'ประสบการณ์ถูกเลือกปฏิบัติ' : 'Discrimination Experience',
          value: ((discrimination / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${discrimination} คน (${((discrimination / communityRecords.length) * 100).toFixed(1)}%) เคยถูกเลือกปฏิบัติ`
            : `${discrimination} people (${((discrimination / communityRecords.length) * 100).toFixed(1)}%) experienced discrimination`
        },
        {
          name: language === 'th' ? 'ประสบความรุนแรง' : 'Violence Experience',
          value: ((violence / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${violence} คน (${((violence / communityRecords.length) * 100).toFixed(1)}%) เคยประสบความรุนแรง`
            : `${violence} people (${((violence / communityRecords.length) * 100).toFixed(1)}%) experienced violence`
        }
      ]
    });

    // Health Behaviors
    const exercise = communityRecords.filter(r => r.exercise_status === 1).length;
    const smoking = communityRecords.filter(r => r.smoke_status === 1).length;
    const drinking = communityRecords.filter(r => r.drink_status === 1 || r.drink_status === 2).length;

    summaries.push({
      domain: language === 'th' ? 'พฤติกรรมสุขภาพ' : 'Health Behaviors',
      color: '#F59E0B',
      indicators: [
        {
          name: language === 'th' ? 'ออกกำลังกายสม่ำเสมอ' : 'Regular Exercise',
          value: ((exercise / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${exercise} คน (${((exercise / communityRecords.length) * 100).toFixed(1)}%) ออกกำลังกายสม่ำเสมอ`
            : `${exercise} people (${((exercise / communityRecords.length) * 100).toFixed(1)}%) exercise regularly`
        },
        {
          name: language === 'th' ? 'สูบบุหรี่' : 'Tobacco Use',
          value: ((smoking / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${smoking} คน (${((smoking / communityRecords.length) * 100).toFixed(1)}%) สูบบุหรี่`
            : `${smoking} people (${((smoking / communityRecords.length) * 100).toFixed(1)}%) use tobacco`
        },
        {
          name: language === 'th' ? 'ดื่มแอลกอฮอล์' : 'Alcohol Consumption',
          value: ((drinking / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${drinking} คน (${((drinking / communityRecords.length) * 100).toFixed(1)}%) ดื่มแอลกอฮอล์`
            : `${drinking} people (${((drinking / communityRecords.length) * 100).toFixed(1)}%) consume alcohol`
        }
      ]
    });

    // Health Outcomes
    const chronicDisease = communityRecords.filter(r => r.diseases_status === 1).length;
    const diabetes = communityRecords.filter(r => r.diseases_status === 1 && r.diseases_type_1 === 1).length;
    const hypertension = communityRecords.filter(r => r.diseases_status === 1 && r.diseases_type_2 === 1).length;

    summaries.push({
      domain: language === 'th' ? 'ผลลัพธ์ทางสุขภาพ' : 'Health Outcomes',
      color: '#EC4899',
      indicators: [
        {
          name: language === 'th' ? 'มีโรคเรื้อรัง' : 'Chronic Disease',
          value: ((chronicDisease / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${chronicDisease} คน (${((chronicDisease / communityRecords.length) * 100).toFixed(1)}%) มีโรคเรื้อรัง`
            : `${chronicDisease} people (${((chronicDisease / communityRecords.length) * 100).toFixed(1)}%) have chronic diseases`
        },
        {
          name: language === 'th' ? 'โรคเบาหวาน' : 'Diabetes',
          value: ((diabetes / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${diabetes} คน (${((diabetes / communityRecords.length) * 100).toFixed(1)}%) เป็นโรคเบาหวาน`
            : `${diabetes} people (${((diabetes / communityRecords.length) * 100).toFixed(1)}%) have diabetes`
        },
        {
          name: language === 'th' ? 'โรคความดันโลหิตสูง' : 'Hypertension',
          value: ((hypertension / communityRecords.length) * 100).toFixed(1),
          description: language === 'th'
            ? `${hypertension} คน (${((hypertension / communityRecords.length) * 100).toFixed(1)}%) เป็นโรคความดันโลหิตสูง`
            : `${hypertension} people (${((hypertension / communityRecords.length) * 100).toFixed(1)}%) have hypertension`
        }
      ]
    });

    return summaries;
  }, [communityRecords, language]);

  const colors = {
    age: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc'],
    sex: ['#ef4444', '#f97316', '#ec4899'],
    disability: ['#dc2626', '#10b981'],
    occupation: ['#10b981', '#ef4444'],
    welfare: ['#2563eb', '#16a34a', '#eab308', '#dc2626']
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {language === 'th' ? 'กำลังโหลดข้อมูลชุมชน...' : 'Loading community data...'}
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
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
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center text-blue-600 hover:text-blue-800"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            {language === 'th' ? 'กลับ' : 'Back'}
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {language === 'th' ? 'ข้อมูลชุมชน' : 'Community Data'}
          </h1>
          <div className="w-24"></div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'เลือกเขต' : 'Select District'}
              </label>
              <select
                value={selectedDistrict}
                onChange={(e) => {
                  setSelectedDistrict(e.target.value);
                  setSelectedCommunity('');
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">{language === 'th' ? 'เลือกเขต...' : 'Select district...'}</option>
                {districts.map(district => (
                  <option key={district.code} value={district.code}>{district.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {language === 'th' ? 'เลือกชุมชน' : 'Select Community'}
              </label>
              <select
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={!selectedDistrict}
              >
                <option value="">{language === 'th' ? 'เลือกชุมชน...' : 'Select community...'}</option>
                {communities.map(community => (
                  <option key={community} value={community}>{community}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedDistrict && selectedCommunity && communityRecords.length > 0 ? (
          <>
            {/* Summary Card */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-center mb-4">
                <MapPin className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCommunity}</h2>
                  <p className="text-gray-600">{districtCodeMap[selectedDistrict] || selectedDistrict}</p>
                </div>
              </div>
              <div className="flex items-center text-gray-700">
                <Users className="w-5 h-5 mr-2" />
                <span className="font-semibold">
                  {language === 'th' ? 'จำนวนผู้ตอบแบบสอบถาม:' : 'Survey Respondents:'} {communityRecords.length} {language === 'th' ? 'คน' : 'people'}
                </span>
              </div>
            </div>

            {/* Demographics Section */}
            {demographics && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-blue-600" />
                  {language === 'th' ? 'การกระจายประชากร' : 'Population Distribution'}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Age Distribution */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">{language === 'th' ? 'กลุ่มอายุ' : 'Age Groups'}</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={demographics.age}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value) => [`${value}%`, language === 'th' ? 'สัดส่วน' : 'Percentage']} />
                          <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                            {demographics.age.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors.age[index % colors.age.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Sex Distribution */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">{language === 'th' ? 'เพศ' : 'Sex'}</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={demographics.sex}
                            dataKey="percentage"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percentage }) => `${name}: ${percentage}%`}
                          >
                            {demographics.sex.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors.sex[index % colors.sex.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Disability Distribution */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">{language === 'th' ? 'สถานะความพิการ' : 'Disability Status'}</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={demographics.disability}
                            dataKey="percentage"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percentage }) => `${percentage}%`}
                          >
                            {demographics.disability.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors.disability[index % colors.disability.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Occupation Distribution */}
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-3">{language === 'th' ? 'สถานะการทำงาน' : 'Employment Status'}</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={demographics.occupation}
                            dataKey="percentage"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ name, percentage }) => `${percentage}%`}
                          >
                            {demographics.occupation.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors.occupation[index % colors.occupation.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value}%`} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Welfare Distribution */}
                  <div className="lg:col-span-2">
                    <h4 className="font-semibold text-gray-800 mb-3">{language === 'th' ? 'ประเภทหลักประกันสุขภาพ' : 'Health Insurance Type'}</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={demographics.welfare}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="name"
                            angle={-15}
                            textAnchor="end"
                            height={100}
                            tick={{ fontSize: 11 }}
                            interval={0}
                          />
                          <YAxis tickFormatter={(value) => `${value}%`} />
                          <Tooltip formatter={(value) => [`${value}%`, language === 'th' ? 'สัดส่วน' : 'Percentage']} />
                          <Bar dataKey="percentage" radius={[4, 4, 0, 0]}>
                            {demographics.welfare.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={colors.welfare[index % colors.welfare.length]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SDHE Domain Summaries */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Info className="w-6 h-6 mr-2 text-blue-600" />
                {language === 'th' ? 'สรุปตัวชี้วัดตามมิติ SDHE' : 'SDHE Domain Summaries'}
              </h3>

              {domainSummaries.map((domain, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow-sm p-6" style={{ borderLeft: `4px solid ${domain.color}` }}>
                  <h4 className="text-lg font-bold mb-4" style={{ color: domain.color }}>
                    {domain.domain}
                  </h4>
                  <div className="space-y-3">
                    {domain.indicators.map((indicator, i) => (
                      <div key={i} className="border-l-2 border-gray-200 pl-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800">{indicator.name}</span>
                          <span className="text-2xl font-bold" style={{ color: domain.color }}>
                            {indicator.value}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">{indicator.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {language === 'th' ? 'เลือกเขตและชุมชน' : 'Select District and Community'}
            </h3>
            <p className="text-gray-500">
              {language === 'th'
                ? 'กรุณาเลือกเขตและชุมชนเพื่อดูข้อมูล'
                : 'Please select a district and community to view data'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityData;
