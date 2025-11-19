import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import useCommunityData from '../../hooks/useCommunityData';

const CommunityProfile = ({ onBack }) => {
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
    const districtCode = parseInt(selectedDistrict);
    return communityData.filter(d =>
      d.dname === districtCode && d.community_name === selectedCommunity
    );
  }, [communityData, selectedDistrict, selectedCommunity]);

  // Calculate profile data
  const profileData = useMemo(() => {
    if (communityRecords.length === 0) return null;

    const total = communityRecords.length;

    // Demographics
    const ageGroups = { '<18': 0, '18-29': 0, '30-44': 0, '45-59': 0, '60+': 0 };
    const sexGroups = { male: 0, female: 0, lgbt: 0 };

    communityRecords.forEach(r => {
      // Age
      if (r.age < 18) ageGroups['<18']++;
      else if (r.age < 30) ageGroups['18-29']++;
      else if (r.age < 45) ageGroups['30-44']++;
      else if (r.age < 60) ageGroups['45-59']++;
      else ageGroups['60+']++;

      // Sex
      if (r.sex === 'male') sexGroups.male++;
      else if (r.sex === 'female') sexGroups.female++;
      else if (r.sex === 'lgbt') sexGroups.lgbt++;
    });

    // Economic indicators
    const employed = communityRecords.filter(r => r.occupation_status === 1).length;
    const vulnerable = communityRecords.filter(r => r.occupation_status === 1 && r.occupation_contract === 0).length;
    const foodInsecure = communityRecords.filter(r => r.food_insecurity_1 === 1 || r.food_insecurity_2 === 1).length;

    // Health access
    const healthCoverage = communityRecords.filter(r => r.welfare && r.welfare !== 'other').length;
    const dentalAccess = communityRecords.filter(r => r.oral_health_access === 1).length;
    const skipMedical = communityRecords.filter(r => r.medical_skip_1 === 1 || r.medical_skip_2 === 1 || r.medical_skip_3 === 1).length;

    // Environment
    const homeOwnership = communityRecords.filter(r => r.house_status === 1).length;
    const cleanWater = communityRecords.filter(r => r.community_environment_3 !== 1).length;
    const disasters = communityRecords.filter(r =>
      r.community_disaster_1 === 1 || r.community_disaster_2 === 1 ||
      r.community_disaster_3 === 1 || r.community_disaster_4 === 1 ||
      r.community_disaster_5 === 1 || r.community_disaster_6 === 1 ||
      r.community_disaster_7 === 1 || r.community_disaster_8 === 1
    ).length;

    // Social
    const socialSupport = communityRecords.filter(r => r.helper === 1).length;
    const discrimination = communityRecords.filter(r =>
      r.discrimination_1 === 1 || r.discrimination_2 === 1 ||
      r.discrimination_3 === 1 || r.discrimination_4 === 1 ||
      r.discrimination_5 === 1 || r.discrimination_other === 1
    ).length;
    const violence = communityRecords.filter(r =>
      r.physical_violence === 1 || r.psychological_violence === 1 || r.sexual_violence === 1
    ).length;

    // Health behaviors
    const exercise = communityRecords.filter(r => r.exercise_status === 1).length;
    const smoking = communityRecords.filter(r => r.smoke_status === 1).length;
    const drinking = communityRecords.filter(r => r.drink_status === 1 || r.drink_status === 2).length;

    // Health outcomes
    const chronicDisease = communityRecords.filter(r => r.diseases_status === 1).length;
    const diabetes = communityRecords.filter(r => r.diseases_status === 1 && r.diseases_type_1 === 1).length;
    const hypertension = communityRecords.filter(r => r.diseases_status === 1 && r.diseases_type_2 === 1).length;

    // Education levels
    const educationLevels = {
      neverAttended: communityRecords.filter(r => r.education === 0).length,
      primaryLower: communityRecords.filter(r => r.education === 1).length,
      primaryUpper: communityRecords.filter(r => r.education === 2).length,
      secondaryLower: communityRecords.filter(r => r.education === 3).length,
      secondaryUpper: communityRecords.filter(r => r.education === 4).length,
      vocationalCert: communityRecords.filter(r => r.education === 5).length,
      vocationalDiploma: communityRecords.filter(r => r.education === 6).length,
      bachelor: communityRecords.filter(r => r.education === 7).length,
      higherThanBachelor: communityRecords.filter(r => r.education === 8).length
    };

    // Occupation types (from employed workers)
    const employedRecords = communityRecords.filter(r => r.occupation_status === 1);
    const occupationTypes = {
      civilServant: employedRecords.filter(r => r.occupation_type === 1).length,
      stateEnterprise: employedRecords.filter(r => r.occupation_type === 2).length,
      companyEmployee: employedRecords.filter(r => r.occupation_type === 3).length,
      ownBusiness: employedRecords.filter(r => r.occupation_type === 5).length,
      freelance: employedRecords.filter(r => r.occupation_type === 6).length,
      other: employedRecords.filter(r => r.occupation_type === 'other').length
    };

    // Freelance types (from those with occupation_type === 6)
    const freelanceRecords = employedRecords.filter(r => r.occupation_type === 6);
    const freelanceTypes = {
      generalLabor: freelanceRecords.filter(r => r.occupation_freelance_type === 1).length,
      onlineSeller: freelanceRecords.filter(r => r.occupation_freelance_type === 2).length,
      rider: freelanceRecords.filter(r => r.occupation_freelance_type === 3).length,
      motorcycleTaxi: freelanceRecords.filter(r => r.occupation_freelance_type === 4).length,
      trader: freelanceRecords.filter(r => r.occupation_freelance_type === 5).length,
      streetVendor: freelanceRecords.filter(r => r.occupation_freelance_type === 6).length
    };

    // Health insurance types
    const healthInsuranceTypes = {
      civilServant: communityRecords.filter(r => r.welfare === 1).length,
      socialSecurity: communityRecords.filter(r => r.welfare === 2).length,
      universalCoverage: communityRecords.filter(r => r.welfare === 3).length,
      other: communityRecords.filter(r => r.welfare === 'other').length,
      none: communityRecords.filter(r => !r.welfare || r.welfare === 0).length
    };

    // Oral health access reasons (for those who had oral health problems but didn't seek treatment)
    const oralHealthProblems = communityRecords.filter(r => r.oral_health === 1);
    const noOralTreatment = oralHealthProblems.filter(r => r.oral_health_access === 0).length;

    // Disease types (from those with chronic diseases)
    const diseaseRecords = communityRecords.filter(r => r.diseases_status === 1);
    const diseaseTypes = {
      diabetes: diseaseRecords.filter(r => r.diseases_type_1 === 1).length,
      hypertension: diseaseRecords.filter(r => r.diseases_type_2 === 1).length,
      gout: diseaseRecords.filter(r => r.diseases_type_3 === 1).length,
      kidneyDisease: diseaseRecords.filter(r => r.diseases_type_4 === 1).length,
      cancer: diseaseRecords.filter(r => r.diseases_type_5 === 1).length,
      highCholesterol: diseaseRecords.filter(r => r.diseases_type_6 === 1).length,
      ischemicHeart: diseaseRecords.filter(r => r.diseases_type_7 === 1).length,
      liverDisease: diseaseRecords.filter(r => r.diseases_type_8 === 1).length,
      stroke: diseaseRecords.filter(r => r.diseases_type_9 === 1).length,
      hiv: diseaseRecords.filter(r => r.diseases_type_10 === 1).length,
      mentalHealth: diseaseRecords.filter(r => r.diseases_type_11 === 1).length,
      allergies: diseaseRecords.filter(r => r.diseases_type_12 === 1).length,
      boneJoint: diseaseRecords.filter(r => r.diseases_type_13 === 1).length,
      respiratory: diseaseRecords.filter(r => r.diseases_type_14 === 1).length,
      emphysema: diseaseRecords.filter(r => r.diseases_type_15 === 1).length,
      anemia: diseaseRecords.filter(r => r.diseases_type_16 === 1).length,
      stomachUlcer: diseaseRecords.filter(r => r.diseases_type_17 === 1).length,
      epilepsy: diseaseRecords.filter(r => r.diseases_type_18 === 1).length,
      intestinal: diseaseRecords.filter(r => r.diseases_type_19 === 1).length,
      paralysis: diseaseRecords.filter(r => r.diseases_type_20 === 1).length,
      dementia: diseaseRecords.filter(r => r.diseases_type_21 === 1).length
    };

    return {
      total,
      ageGroups,
      sexGroups,
      employed,
      vulnerable,
      foodInsecure,
      healthCoverage,
      dentalAccess,
      skipMedical,
      homeOwnership,
      cleanWater,
      disasters,
      socialSupport,
      discrimination,
      violence,
      exercise,
      smoking,
      drinking,
      chronicDisease,
      diabetes,
      hypertension,
      educationLevels,
      occupationTypes,
      freelanceTypes,
      healthInsuranceTypes,
      oralHealthProblems: oralHealthProblems.length,
      noOralTreatment,
      diseaseTypes
    };
  }, [communityRecords]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">
            {language === 'th' ? 'กำลังโหลด...' : 'Loading...'}
          </h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white p-6">
        <div className="max-w-4xl mx-auto">
          <button onClick={onBack} className="text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-5 h-5 inline mr-2" />
            {language === 'th' ? 'กลับ' : 'Back'}
          </button>
          <div className="bg-red-50 border border-red-200 rounded p-4">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header with blue gradient - similar to the image */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <button onClick={onBack} className="text-white hover:text-blue-200 mb-4 flex items-center">
            <ArrowLeft className="w-5 h-5 mr-2" />
            {language === 'th' ? 'กลับ' : 'Back'}
          </button>
          <h1 className="text-4xl font-bold mb-2">
            {language === 'th' ? 'รายงานข้อมูลชุมชน' : 'Community Profiles'}
          </h1>
          <p className="text-blue-100 text-lg">
            {language === 'th'
              ? 'ข้อมูลสำรวจระดับชุมชนในเขตกรุงเทพมหานคร'
              : 'Community-level survey data in Bangkok'}
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Selection Section */}
        <div className="bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
          <div className="flex items-start mb-4">
            <Users className="w-8 h-8 text-blue-600 mr-4 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 mb-3">
                {language === 'th' ? 'เลือกพื้นที่' : 'Select Area'}
              </h2>
              <p className="text-gray-700 mb-4">
                {language === 'th'
                  ? 'รายงานนี้รวบรวมข้อมูลสำรวจระดับชุมชนเพื่อแสดงภาพรวมของชุมชนที่คุณเลือก โดยข้อมูลถูกจัดกลุ่มตามประเด็นสุขภาพและสังคม (SDHE Framework)'
                  : 'This report combines community-level survey data to show a picture of your selected community. Data is organized by health and social determinants themes (SDHE Framework).'}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'th' ? 'เลือกเขต' : 'Select District'}
                  </label>
                  <select
                    value={selectedDistrict}
                    onChange={(e) => {
                      setSelectedDistrict(e.target.value);
                      setSelectedCommunity('');
                    }}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">{language === 'th' ? '-- เลือกเขต --' : '-- Select District --'}</option>
                    {districts.map(district => (
                      <option key={district.code} value={district.code}>{district.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {language === 'th' ? 'เลือกชุมชน' : 'Select Community'}
                  </label>
                  <select
                    value={selectedCommunity}
                    onChange={(e) => setSelectedCommunity(e.target.value)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={!selectedDistrict}
                  >
                    <option value="">{language === 'th' ? '-- เลือกชุมชน --' : '-- Select Community --'}</option>
                    {communities.map(community => (
                      <option key={community} value={community}>{community}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        {selectedDistrict && selectedCommunity && profileData ? (
          <>
            {/* Community Header */}
            <div className="mb-8 pb-6 border-b-2 border-gray-200">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedCommunity}</h2>
              <p className="text-xl text-gray-600">{districtCodeMap[selectedDistrict]}</p>
              <p className="text-gray-600 mt-2">
                <span className="font-semibold">{language === 'th' ? 'จำนวนผู้ตอบแบบสอบถาม:' : 'Survey respondents:'}</span> {profileData.total} {language === 'th' ? 'คน' : 'people'}
              </p>
            </div>

            {/* Demographics Section */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'ข้อมูลประชากร' : 'Demographics'}</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{language === 'th' ? 'กลุ่มอายุ' : 'Age Groups'}</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {Object.entries(profileData.ageGroups).map(([group, count]) => (
                      <li key={group}>
                        {group}: {count} {language === 'th' ? 'คน' : 'people'} ({((count / profileData.total) * 100).toFixed(1)}%)
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{language === 'th' ? 'เพศ' : 'Sex'}</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>{language === 'th' ? 'ชาย' : 'Male'}: {profileData.sexGroups.male} {language === 'th' ? 'คน' : 'people'} ({((profileData.sexGroups.male / profileData.total) * 100).toFixed(1)}%)</li>
                    <li>{language === 'th' ? 'หญิง' : 'Female'}: {profileData.sexGroups.female} {language === 'th' ? 'คน' : 'people'} ({((profileData.sexGroups.female / profileData.total) * 100).toFixed(1)}%)</li>
                    <li>LGBTQ+: {profileData.sexGroups.lgbt} {language === 'th' ? 'คน' : 'people'} ({((profileData.sexGroups.lgbt / profileData.total) * 100).toFixed(1)}%)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Education Level Breakdown - Right after Demographics */}
            <section className="mb-8 ml-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                {language === 'th' ? 'ระดับการศึกษา' : 'Education Level'}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ไม่เคยเรียน:' : 'Never attended:'}</span> {profileData.educationLevels.neverAttended} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.neverAttended / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ประถมศึกษาตอนต้น (ป.1-3):' : 'Primary lower (1-3):'}</span> {profileData.educationLevels.primaryLower} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.primaryLower / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ประถมศึกษาตอนปลาย (ป.4-6):' : 'Primary upper (4-6):'}</span> {profileData.educationLevels.primaryUpper} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.primaryUpper / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'มัธยมศึกษาตอนต้น (ม.1-3):' : 'Secondary lower (M.1-3):'}</span> {profileData.educationLevels.secondaryLower} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.secondaryLower / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'มัธยมศึกษาตอนปลาย (ม.4-6):' : 'Secondary upper (M.4-6):'}</span> {profileData.educationLevels.secondaryUpper} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.secondaryUpper / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ปวช. (Vocational Certificate):' : 'Vocational Certificate:'}</span> {profileData.educationLevels.vocationalCert} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.vocationalCert / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ปวส. (Vocational Diploma):' : 'Vocational Diploma:'}</span> {profileData.educationLevels.vocationalDiploma} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.vocationalDiploma / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ปริญญาตรี:' : "Bachelor's degree:"}</span> {profileData.educationLevels.bachelor} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.bachelor / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'สูงกว่าปริญญาตรี:' : "Higher than Bachelor's:"}</span> {profileData.educationLevels.higherThanBachelor} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.higherThanBachelor / profileData.total) * 100).toFixed(1)}%)
                </li>
              </ul>
            </section>

            {/* Economic Security */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'ความมั่นคงทางเศรษฐกิจ' : 'Economic Security'}</h3>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'อัตราการมีงานทำ:' : 'Employment rate:'}</span> {profileData.employed} / {profileData.total} ({((profileData.employed / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'การจ้างงานเปราะบาง:' : 'Vulnerable employment:'}</span> {profileData.vulnerable} / {profileData.employed} ({profileData.employed > 0 ? ((profileData.vulnerable / profileData.employed) * 100).toFixed(1) : 0}% {language === 'th' ? 'ของผู้มีงาน' : 'of employed'})
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ความไม่มั่นคงทางอาหาร:' : 'Food insecurity:'}</span> {profileData.foodInsecure} / {profileData.total} ({((profileData.foodInsecure / profileData.total) * 100).toFixed(1)}%)
                </li>
              </ul>
            </section>

            {/* Healthcare Access */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'การเข้าถึงบริการสุขภาพ' : 'Healthcare Access'}</h3>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'มีหลักประกันสุขภาพ:' : 'Have health coverage:'}</span> {profileData.healthCoverage} / {profileData.total} ({((profileData.healthCoverage / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เข้าถึงบริการทันตกรรม:' : 'Dental care access:'}</span> {profileData.dentalAccess} / {profileData.total} ({((profileData.dentalAccess / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'งดรับบริการเนื่องจากค่าใช้จ่าย:' : 'Skip care due to cost:'}</span> {profileData.skipMedical} / {profileData.total} ({((profileData.skipMedical / profileData.total) * 100).toFixed(1)}%)
                </li>
              </ul>
            </section>

            {/* Physical Environment */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'สภาพแวดล้อมทางกายภาพ' : 'Physical Environment'}</h3>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เป็นเจ้าของบ้าน:' : 'Home ownership:'}</span> {profileData.homeOwnership} / {profileData.total} ({((profileData.homeOwnership / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เข้าถึงน้ำสะอาด:' : 'Clean water access:'}</span> {profileData.cleanWater} / {profileData.total} ({((profileData.cleanWater / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ประสบภัยพิบัติ:' : 'Disaster experience:'}</span> {profileData.disasters} / {profileData.total} ({((profileData.disasters / profileData.total) * 100).toFixed(1)}%)
                </li>
              </ul>
            </section>

            {/* Social Context */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'บริบททางสังคม' : 'Social Context'}</h3>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'มีผู้ช่วยเหลือเมื่อเจ็บป่วย:' : 'Have social support:'}</span> {profileData.socialSupport} / {profileData.total} ({((profileData.socialSupport / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ประสบการเลือกปฏิบัติ:' : 'Discrimination experience:'}</span> {profileData.discrimination} / {profileData.total} ({((profileData.discrimination / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ประสบความรุนแรง:' : 'Violence experience:'}</span> {profileData.violence} / {profileData.total} ({((profileData.violence / profileData.total) * 100).toFixed(1)}%)
                </li>
              </ul>
            </section>

            {/* Health Behaviors */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'พฤติกรรมสุขภาพ' : 'Health Behaviors'}</h3>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ออกกำลังกายสม่ำเสมอ:' : 'Regular exercise:'}</span> {profileData.exercise} / {profileData.total} ({((profileData.exercise / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'สูบบุหรี่:' : 'Tobacco use:'}</span> {profileData.smoking} / {profileData.total} ({((profileData.smoking / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ดื่มแอลกอฮอล์:' : 'Alcohol consumption:'}</span> {profileData.drinking} / {profileData.total} ({((profileData.drinking / profileData.total) * 100).toFixed(1)}%)
                </li>
              </ul>
            </section>

            {/* Health Outcomes */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'ผลลัพธ์ทางสุขภาพ' : 'Health Outcomes'}</h3>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'มีโรคเรื้อรัง:' : 'Chronic disease:'}</span> {profileData.chronicDisease} / {profileData.total} ({((profileData.chronicDisease / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'โรคเบาหวาน:' : 'Diabetes:'}</span> {profileData.diabetes} / {profileData.total} ({((profileData.diabetes / profileData.total) * 100).toFixed(1)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'โรคความดันโลหิตสูง:' : 'Hypertension:'}</span> {profileData.hypertension} / {profileData.total} ({((profileData.hypertension / profileData.total) * 100).toFixed(1)}%)
                </li>
              </ul>
            </section>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-lg">
              {language === 'th'
                ? 'กรุณาเลือกเขตและชุมชนเพื่อดูรายงาน'
                : 'Please select a district and community to view the report'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityProfile;
