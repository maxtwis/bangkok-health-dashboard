import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Users, Printer } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import useCommunityData from '../../hooks/useCommunityData';

const CommunityProfile = ({ onBack }) => {
  const { language } = useLanguage();
  const { data: communityData, loading, error } = useCommunityData();

  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');

  // Print function
  const handlePrint = () => {
    window.print();
  };

  // Helper function to classify oral health access reasons
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

    // Housing status breakdown
    const housingStatus = {
      owner: communityRecords.filter(r => r.house_status === 1).length,
      rent: communityRecords.filter(r => r.house_status === 2).length,
      withRelatives: communityRecords.filter(r => r.house_status === 3).length,
      squat: communityRecords.filter(r => r.house_status === 4).length,
      welfare: communityRecords.filter(r => r.house_status === 5).length
    };

    // Disaster types breakdown
    const disasterTypes = {
      flood: communityRecords.filter(r => r.community_disaster_1 === 1).length,
      extremeHeat: communityRecords.filter(r => r.community_disaster_2 === 1).length,
      extremeCold: communityRecords.filter(r => r.community_disaster_3 === 1).length,
      fire: communityRecords.filter(r => r.community_disaster_4 === 1).length,
      earthquake: communityRecords.filter(r => r.community_disaster_5 === 1).length,
      epidemic: communityRecords.filter(r => r.community_disaster_6 === 1).length,
      subsidence: communityRecords.filter(r => r.community_disaster_7 === 1).length,
      pollution: communityRecords.filter(r => r.community_disaster_8 === 1).length
    };

    // Community environment issues
    const communityEnvironment = {
      denseCrowded: communityRecords.filter(r => r.community_environment_1 === 1).length,
      narrowSpace: communityRecords.filter(r => r.community_environment_2 === 1).length,
      noCleanWater: communityRecords.filter(r => r.community_environment_3 === 1).length,
      noElectricity: communityRecords.filter(r => r.community_environment_4 === 1).length,
      poorWasteManagement: communityRecords.filter(r => r.community_environment_5 === 1).length,
      wasteWater: communityRecords.filter(r => r.community_environment_6 === 1).length,
      drugs: communityRecords.filter(r => r.community_environment_7 === 1).length
    };

    // Community amenities for elderly
    const communityAmenities = {
      ramp: communityRecords.filter(r => r.community_amenity_type_1 === 1).length,
      handrails: communityRecords.filter(r => r.community_amenity_type_2 === 1).length,
      publicSpace: communityRecords.filter(r => r.community_amenity_type_3 === 1).length,
      healthService: communityRecords.filter(r => r.community_amenity_type_4 === 1).length,
      none: communityRecords.filter(r => r.community_amenity_type_0 === 1).length
    };

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

    // Community safety levels
    const communitySafety = {
      verySafe: communityRecords.filter(r => r.community_safety === 4).length,
      moderatelySafe: communityRecords.filter(r => r.community_safety === 3).length,
      slightlySafe: communityRecords.filter(r => r.community_safety === 2).length,
      notSafe: communityRecords.filter(r => r.community_safety === 1).length
    };

    // Discrimination types
    const discriminationTypes = {
      ethnicity: communityRecords.filter(r => r.discrimination_1 === 1).length,
      religion: communityRecords.filter(r => r.discrimination_2 === 1).length,
      gender: communityRecords.filter(r => r.discrimination_3 === 1).length,
      age: communityRecords.filter(r => r.discrimination_4 === 1).length,
      economicStatus: communityRecords.filter(r => r.discrimination_5 === 1).length,
      other: communityRecords.filter(r => r.discrimination_other === 1).length
    };

    // Violence types
    const violenceTypes = {
      physical: communityRecords.filter(r => r.physical_violence === 1).length,
      psychological: communityRecords.filter(r => r.psychological_violence === 1).length,
      sexual: communityRecords.filter(r => r.sexual_violence === 1).length
    };

    // Health behaviors
    const exercise = communityRecords.filter(r => r.exercise_status === 1).length;
    const smoking = communityRecords.filter(r => r.smoke_status === 1).length;
    const drinking = communityRecords.filter(r => r.drink_status === 1 || r.drink_status === 2).length;

    // Health outcomes
    const chronicDisease = communityRecords.filter(r => r.diseases_status === 1).length;
    const diabetes = communityRecords.filter(r => r.diseases_status === 1 && r.diseases_type_1 === 1).length;
    const hypertension = communityRecords.filter(r => r.diseases_status === 1 && r.diseases_type_2 === 1).length;

    // Disability
    const disabled = communityRecords.filter(r => r.disable_status === 1).length;
    const disabledCanWork = communityRecords.filter(r => r.disable_status === 1 && r.disable_work_status === 1).length;

    // Language skills
    const languageSkills = {
      canSpeak: communityRecords.filter(r => r.speak === 1).length,
      canRead: communityRecords.filter(r => r.read === 1).length,
      canWrite: communityRecords.filter(r => r.write === 1).length,
      canMath: communityRecords.filter(r => r.math === 1).length
    };

    // Training participation
    const hadTraining = communityRecords.filter(r => r.training === 1).length;

    // Get employed workers for occupation analysis
    const employedRecords = communityRecords.filter(r => r.occupation_status === 1);

    // Occupation injuries (from employed workers)
    const occupationInjury = employedRecords.filter(r => r.occupation_injury === 1).length;
    const occupationSmallInjury = employedRecords.filter(r => r.occupation_small_injury === 1).length;
    const hasOccupationWelfare = employedRecords.filter(r => r.occupation_welfare === 1).length;

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
    const noAccessRecords = oralHealthProblems.filter(r => r.oral_health_access === 0);
    const noOralTreatment = noAccessRecords.length;

    // Group oral health access reasons
    const oralHealthReasons = {};
    if (noAccessRecords.length > 0) {
      noAccessRecords.forEach(record => {
        const reason = getOralHealthReason(record.oral_health_access_reason);
        if (!oralHealthReasons[reason]) {
          oralHealthReasons[reason] = 0;
        }
        oralHealthReasons[reason]++;
      });
    }

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
      oralHealthReasons,
      diseaseTypes,
      housingStatus,
      disasterTypes,
      communityEnvironment,
      communityAmenities,
      discriminationTypes,
      violenceTypes,
      communitySafety,
      disabled,
      disabledCanWork,
      languageSkills,
      hadTraining,
      occupationInjury,
      occupationSmallInjury,
      hasOccupationWelfare
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
      {/* Print styles */}
      <style>
        {`
          @media print {
            /* Hide elements that shouldn't print */
            .no-print {
              display: none !important;
            }

            /* Optimize page breaks */
            section {
              page-break-inside: avoid;
            }

            /* Remove background colors for printing */
            .bg-gradient-to-r,
            .bg-blue-50,
            .bg-teal-700 {
              background: white !important;
              color: black !important;
            }

            /* Add borders to headers for structure */
            .bg-teal-700 {
              border: 2px solid black !important;
              padding: 8px !important;
            }

            /* Ensure good contrast */
            h1, h2, h3, h4, h5, h6 {
              color: black !important;
            }

            /* Add page margins */
            @page {
              margin: 2cm;
            }

            /* Header styling for print */
            .print-header {
              border-bottom: 3px solid black;
              padding-bottom: 10px;
              margin-bottom: 20px;
            }
          }
        `}
      </style>

      {/* Header with blue gradient - similar to the image */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-8 px-6 print-header">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <button onClick={onBack} className="no-print text-white hover:text-blue-200 mb-4 flex items-center">
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
            {selectedDistrict && selectedCommunity && (
              <button
                onClick={handlePrint}
                className="no-print bg-white text-blue-900 hover:bg-blue-50 px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-lg transition-colors"
              >
                <Printer className="w-5 h-5" />
                {language === 'th' ? 'พิมพ์รายงาน' : 'Print Report'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Selection Section */}
        <div className="no-print bg-blue-50 border-l-4 border-blue-600 p-6 mb-8">
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
              <p className="text-xl text-gray-600">
                {language === 'th' ? 'เขต' : 'District '}{districtCodeMap[selectedDistrict]}
              </p>
              <p className="text-gray-600 mt-2">
                <span className="font-semibold">{language === 'th' ? 'จำนวนผู้ตอบแบบสอบถาม:' : 'Survey respondents:'}</span> {profileData.total} {language === 'th' ? 'คน' : 'people'}
              </p>
              {/* Print-only date stamp */}
              <p className="text-gray-500 mt-2 hidden print:block text-sm">
                <span className="font-semibold">{language === 'th' ? 'วันที่พิมพ์:' : 'Print date:'}</span> {new Date().toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Demographics Section */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'ข้อมูลประชากร' : 'Demographics'}</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  {language === 'th'
                    ? `ชุมชนนี้มีผู้ตอบแบบสำรวจทั้งหมด ${profileData.total} คน โดยส่วนใหญ่อยู่ในช่วงอายุ ${Object.entries(profileData.ageGroups).sort((a, b) => b[1] - a[1])[0][0]} จำนวน ${Object.entries(profileData.ageGroups).sort((a, b) => b[1] - a[1])[0][1]} คน (${((Object.entries(profileData.ageGroups).sort((a, b) => b[1] - a[1])[0][1] / profileData.total) * 100).toFixed(0)}%) เมื่อพิจารณาเพศพบว่า มีเพศชาย ${profileData.sexGroups.male} คน (${((profileData.sexGroups.male / profileData.total) * 100).toFixed(0)}%) และเพศหญิง ${profileData.sexGroups.female} คน (${((profileData.sexGroups.female / profileData.total) * 100).toFixed(0)}%)`
                    : `This community has ${profileData.total} survey respondents, with the majority in the ${Object.entries(profileData.ageGroups).sort((a, b) => b[1] - a[1])[0][0]} age group (${Object.entries(profileData.ageGroups).sort((a, b) => b[1] - a[1])[0][1]} people, ${((Object.entries(profileData.ageGroups).sort((a, b) => b[1] - a[1])[0][1] / profileData.total) * 100).toFixed(0)}%). Gender distribution shows ${profileData.sexGroups.male} males (${((profileData.sexGroups.male / profileData.total) * 100).toFixed(0)}%) and ${profileData.sexGroups.female} females (${((profileData.sexGroups.female / profileData.total) * 100).toFixed(0)}%).`
                  }
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{language === 'th' ? 'กลุ่มอายุ' : 'Age Groups'}</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {Object.entries(profileData.ageGroups).map(([group, count]) => (
                      <li key={group}>
                        {group}: {count} {language === 'th' ? 'คน' : 'people'} ({((count / profileData.total) * 100).toFixed(0)}%)
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-gray-900 mb-2">{language === 'th' ? 'เพศ' : 'Sex'}</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    <li>{language === 'th' ? 'ชาย' : 'Male'}: {profileData.sexGroups.male} {language === 'th' ? 'คน' : 'people'} ({((profileData.sexGroups.male / profileData.total) * 100).toFixed(0)}%)</li>
                    <li>{language === 'th' ? 'หญิง' : 'Female'}: {profileData.sexGroups.female} {language === 'th' ? 'คน' : 'people'} ({((profileData.sexGroups.female / profileData.total) * 100).toFixed(0)}%)</li>
                    <li>LGBTQ+: {profileData.sexGroups.lgbt} {language === 'th' ? 'คน' : 'people'} ({((profileData.sexGroups.lgbt / profileData.total) * 100).toFixed(0)}%)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* Disability Section */}
            <section className="mb-8 ml-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                {language === 'th' ? 'ความพิการ' : 'Disability'}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เป็นคนพิการ:' : 'People with disabilities:'}</span> {profileData.disabled} {language === 'th' ? 'คน' : 'people'} ({((profileData.disabled / profileData.total) * 100).toFixed(0)}%)
                </li>
                {profileData.disabled > 0 && (
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'สามารถทำงานได้:' : 'Can work:'}</span> {profileData.disabledCanWork} {language === 'th' ? 'คน' : 'people'} ({((profileData.disabledCanWork / profileData.disabled) * 100).toFixed(0)}% {language === 'th' ? 'ของคนพิการ' : 'of disabled'})
                  </li>
                )}
              </ul>
            </section>

            {/* Language Skills Section */}
            <section className="mb-8 ml-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                {language === 'th' ? 'ทักษะภาษาไทย' : 'Thai Language Skills'}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'พูดได้:' : 'Can speak:'}</span> {profileData.languageSkills.canSpeak} {language === 'th' ? 'คน' : 'people'} ({((profileData.languageSkills.canSpeak / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'อ่านได้:' : 'Can read:'}</span> {profileData.languageSkills.canRead} {language === 'th' ? 'คน' : 'people'} ({((profileData.languageSkills.canRead / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เขียนได้:' : 'Can write:'}</span> {profileData.languageSkills.canWrite} {language === 'th' ? 'คน' : 'people'} ({((profileData.languageSkills.canWrite / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'คำนวณได้:' : 'Can do math:'}</span> {profileData.languageSkills.canMath} {language === 'th' ? 'คน' : 'people'} ({((profileData.languageSkills.canMath / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Education Level Breakdown - Right after Demographics */}
            <section className="mb-8 ml-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                {language === 'th' ? 'ระดับการศึกษา' : 'Education Level'}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ไม่เคยเรียน:' : 'Never attended:'}</span> {profileData.educationLevels.neverAttended} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.neverAttended / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ประถมศึกษาตอนต้น (ป.1-3):' : 'Primary lower (1-3):'}</span> {profileData.educationLevels.primaryLower} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.primaryLower / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ประถมศึกษาตอนปลาย (ป.4-6):' : 'Primary upper (4-6):'}</span> {profileData.educationLevels.primaryUpper} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.primaryUpper / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'มัธยมศึกษาตอนต้น (ม.1-3):' : 'Secondary lower (M.1-3):'}</span> {profileData.educationLevels.secondaryLower} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.secondaryLower / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'มัธยมศึกษาตอนปลาย (ม.4-6):' : 'Secondary upper (M.4-6):'}</span> {profileData.educationLevels.secondaryUpper} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.secondaryUpper / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ปวช.:' : 'Vocational Certificate:'}</span> {profileData.educationLevels.vocationalCert} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.vocationalCert / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ปวส.:' : 'Vocational Diploma:'}</span> {profileData.educationLevels.vocationalDiploma} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.vocationalDiploma / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ปริญญาตรี:' : "Bachelor's degree:"}</span> {profileData.educationLevels.bachelor} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.bachelor / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'สูงกว่าปริญญาตรี:' : "Higher than Bachelor's:"}</span> {profileData.educationLevels.higherThanBachelor} {language === 'th' ? 'คน' : 'people'} ({((profileData.educationLevels.higherThanBachelor / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Training Section */}
            <section className="mb-8 ml-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                {language === 'th' ? 'การฝึกอบรม' : 'Training'}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เข้าร่วมการฝึกอบรม (12 เดือนที่ผ่านมา):' : 'Participated in training (past 12 months):'}</span> {profileData.hadTraining} {language === 'th' ? 'คน' : 'people'} ({((profileData.hadTraining / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Economic Security */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'ความมั่นคงทางเศรษฐกิจ' : 'Economic Security'}</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  {language === 'th'
                    ? `ในชุมชนนี้มีผู้ที่มีงานทำ ${profileData.employed} คน จากทั้งหมด ${profileData.total} คน (${((profileData.employed / profileData.total) * 100).toFixed(0)}%) ${profileData.employed > 0 ? (profileData.occupationTypes.civilServant > 0 ? `โดยส่วนใหญ่ทำงานรับราชการ ${profileData.occupationTypes.civilServant} คน (${((profileData.occupationTypes.civilServant / profileData.employed) * 100).toFixed(0)}%)` : profileData.occupationTypes.freelance > 0 ? `โดยส่วนใหญ่ประกอบอาชีพอิสระ ${profileData.occupationTypes.freelance} คน (${((profileData.occupationTypes.freelance / profileData.employed) * 100).toFixed(0)}%)` : profileData.occupationTypes.companyEmployee > 0 ? `โดยส่วนใหญ่เป็นพนักงานบริษัท ${profileData.occupationTypes.companyEmployee} คน (${((profileData.occupationTypes.companyEmployee / profileData.employed) * 100).toFixed(0)}%)` : profileData.occupationTypes.ownBusiness > 0 ? `โดยส่วนใหญ่ทำธุรกิจส่วนตัว ${profileData.occupationTypes.ownBusiness} คน (${((profileData.occupationTypes.ownBusiness / profileData.employed) * 100).toFixed(0)}%)` : '') : ''} ${profileData.employed > 0 ? `มีผู้ที่ทำงานนอกระบบ (ไม่มีสัญญาจ้าง) ${profileData.vulnerable} คน (${((profileData.vulnerable / profileData.employed) * 100).toFixed(0)}% ของผู้มีงาน) ` : ''}และพบว่ามี ${profileData.foodInsecure} คน (${((profileData.foodInsecure / profileData.total) * 100).toFixed(0)}%) ที่มีความไม่มั่นคงทางอาหาร`
                    : `This community has ${profileData.employed} employed people out of ${profileData.total} (${((profileData.employed / profileData.total) * 100).toFixed(0)}%). ${profileData.vulnerable} people (${profileData.employed > 0 ? ((profileData.vulnerable / profileData.employed) * 100).toFixed(0) : 0}%) work in informal employment without contracts. ${profileData.foodInsecure} people (${((profileData.foodInsecure / profileData.total) * 100).toFixed(0)}%) experience food insecurity.`
                  }
                </p>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'อัตราการมีงานทำ:' : 'Employment rate:'}</span> {profileData.employed} / {profileData.total} ({((profileData.employed / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'การจ้างงานนอกระบบ (ไม่มีสัญญาจ้าง):' : 'Informal employment (no contract):'}</span> {profileData.vulnerable} / {profileData.employed} ({profileData.employed > 0 ? ((profileData.vulnerable / profileData.employed) * 100).toFixed(0) : 0}% {language === 'th' ? 'ของผู้มีงาน' : 'of employed'})
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'มีสวัสดิการในการทำงาน:' : 'Have work welfare:'}</span> {profileData.hasOccupationWelfare} / {profileData.employed} ({profileData.employed > 0 ? ((profileData.hasOccupationWelfare / profileData.employed) * 100).toFixed(0) : 0}% {language === 'th' ? 'ของผู้มีงาน' : 'of employed'})
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เคยบาดเจ็บร้ายแรงจากการทำงาน (12 เดือน):' : 'Had serious work injury (12 months):'}</span> {profileData.occupationInjury} / {profileData.employed} ({profileData.employed > 0 ? ((profileData.occupationInjury / profileData.employed) * 100).toFixed(0) : 0}% {language === 'th' ? 'ของผู้มีงาน' : 'of employed'})
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เคยบาดเจ็บเล็กน้อยจากการทำงาน (12 เดือน):' : 'Had minor work injury (12 months):'}</span> {profileData.occupationSmallInjury} / {profileData.employed} ({profileData.employed > 0 ? ((profileData.occupationSmallInjury / profileData.employed) * 100).toFixed(0) : 0}% {language === 'th' ? 'ของผู้มีงาน' : 'of employed'})
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ความไม่มั่นคงทางอาหาร:' : 'Food insecurity:'}</span> {profileData.foodInsecure} / {profileData.total} ({((profileData.foodInsecure / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Occupation Type Breakdown */}
            {profileData.employed > 0 && (
              <section className="mb-8 ml-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                  {language === 'th' ? 'ประเภทอาชีพ' : 'Occupation Type'}
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'รับราชการ:' : 'Civil servant:'}</span> {profileData.occupationTypes.civilServant} {language === 'th' ? 'คน' : 'people'} ({((profileData.occupationTypes.civilServant / profileData.employed) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'รัฐวิสาหกิจ:' : 'State enterprise:'}</span> {profileData.occupationTypes.stateEnterprise} {language === 'th' ? 'คน' : 'people'} ({((profileData.occupationTypes.stateEnterprise / profileData.employed) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'พนักงานบริษัท / ลูกจ้าง:' : 'Company employee:'}</span> {profileData.occupationTypes.companyEmployee} {language === 'th' ? 'คน' : 'people'} ({((profileData.occupationTypes.companyEmployee / profileData.employed) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ธุรกิจส่วนตัว:' : 'Own business:'}</span> {profileData.occupationTypes.ownBusiness} {language === 'th' ? 'คน' : 'people'} ({((profileData.occupationTypes.ownBusiness / profileData.employed) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'อาชีพอิสระ:' : 'Freelance:'}</span> {profileData.occupationTypes.freelance} {language === 'th' ? 'คน' : 'people'} ({((profileData.occupationTypes.freelance / profileData.employed) * 100).toFixed(0)}%)
                  </li>
                  {profileData.occupationTypes.other > 0 && (
                    <li>
                      <span className="font-semibold">{language === 'th' ? 'อื่น ๆ:' : 'Other:'}</span> {profileData.occupationTypes.other} {language === 'th' ? 'คน' : 'people'} ({((profileData.occupationTypes.other / profileData.employed) * 100).toFixed(0)}%)
                    </li>
                  )}
                </ul>
              </section>
            )}

            {/* Freelance Type Breakdown */}
            {profileData.occupationTypes.freelance > 0 && (
              <section className="mb-8 ml-12">
                <h4 className="text-base font-bold text-gray-800 mb-3 border-l-4 border-teal-400 pl-3">
                  {language === 'th' ? 'ประเภทอาชีพอิสระ' : 'Freelance Type'}
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'รับจ้างทั่วไป:' : 'General labor:'}</span> {profileData.freelanceTypes.generalLabor} {language === 'th' ? 'คน' : 'people'} ({((profileData.freelanceTypes.generalLabor / profileData.occupationTypes.freelance) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ขายของออนไลน์:' : 'Online seller:'}</span> {profileData.freelanceTypes.onlineSeller} {language === 'th' ? 'คน' : 'people'} ({((profileData.freelanceTypes.onlineSeller / profileData.occupationTypes.freelance) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ไรเดอร์:' : 'Rider:'}</span> {profileData.freelanceTypes.rider} {language === 'th' ? 'คน' : 'people'} ({((profileData.freelanceTypes.rider / profileData.occupationTypes.freelance) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'วินมอเตอร์ไซต์:' : 'Motorcycle taxi:'}</span> {profileData.freelanceTypes.motorcycleTaxi} {language === 'th' ? 'คน' : 'people'} ({((profileData.freelanceTypes.motorcycleTaxi / profileData.occupationTypes.freelance) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ค้าขาย:' : 'Trader:'}</span> {profileData.freelanceTypes.trader} {language === 'th' ? 'คน' : 'people'} ({((profileData.freelanceTypes.trader / profileData.occupationTypes.freelance) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ผู้ค้าหาบเร่แผงลอย:' : 'Street vendor:'}</span> {profileData.freelanceTypes.streetVendor} {language === 'th' ? 'คน' : 'people'} ({((profileData.freelanceTypes.streetVendor / profileData.occupationTypes.freelance) * 100).toFixed(0)}%)
                  </li>
                </ul>
              </section>
            )}

            {/* Healthcare Access */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'การเข้าถึงบริการสุขภาพ' : 'Healthcare Access'}</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  {language === 'th'
                    ? `ชุมชนนี้มีผู้ที่มีหลักประกันสุขภาพ ${profileData.healthCoverage} คน จากทั้งหมด ${profileData.total} คน (${((profileData.healthCoverage / profileData.total) * 100).toFixed(0)}%) อย่างไรก็ตามพบว่ามี ${profileData.skipMedical} คน (${((profileData.skipMedical / profileData.total) * 100).toFixed(0)}%) ที่เคยงดพบแพทย์เมื่อป่วย และมี ${profileData.oralHealthProblems} คน (${((profileData.oralHealthProblems / profileData.total) * 100).toFixed(0)}%) ที่มีปัญหาสุขภาพช่องปาก แต่สามารถเข้าถึงบริการทันตกรรมได้เพียง ${profileData.dentalAccess} คน (${((profileData.dentalAccess / profileData.total) * 100).toFixed(0)}%)`
                    : `This community has ${profileData.healthCoverage} people with health coverage out of ${profileData.total} (${((profileData.healthCoverage / profileData.total) * 100).toFixed(0)}%). However, ${profileData.skipMedical} people (${((profileData.skipMedical / profileData.total) * 100).toFixed(0)}%) have skipped medical care when sick. ${profileData.oralHealthProblems} people (${((profileData.oralHealthProblems / profileData.total) * 100).toFixed(0)}%) have oral health problems, but only ${profileData.dentalAccess} (${((profileData.dentalAccess / profileData.total) * 100).toFixed(0)}%) can access dental services.`
                  }
                </p>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'มีหลักประกันสุขภาพ:' : 'Have health coverage:'}</span> {profileData.healthCoverage} / {profileData.total} ({((profileData.healthCoverage / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เข้าถึงบริการทันตกรรม:' : 'Dental care access:'}</span> {profileData.dentalAccess} / {profileData.total} ({((profileData.dentalAccess / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'งดรับบริการเนื่องจากค่าใช้จ่าย:' : 'Skip care due to cost:'}</span> {profileData.skipMedical} / {profileData.total} ({((profileData.skipMedical / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Health Insurance Type Breakdown */}
            <section className="mb-8 ml-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                {language === 'th' ? 'ประเภทหลักประกันสุขภาพ' : 'Health Insurance Type'}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'สวัสดิการข้าราชการ/รัฐวิสาหกิจ:' : 'Civil servant welfare:'}</span> {profileData.healthInsuranceTypes.civilServant} {language === 'th' ? 'คน' : 'people'} ({((profileData.healthInsuranceTypes.civilServant / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ประกันสังคม:' : 'Social security:'}</span> {profileData.healthInsuranceTypes.socialSecurity} {language === 'th' ? 'คน' : 'people'} ({((profileData.healthInsuranceTypes.socialSecurity / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'บัตรทอง (30 บาท):' : 'Universal coverage (30 Baht):'}</span> {profileData.healthInsuranceTypes.universalCoverage} {language === 'th' ? 'คน' : 'people'} ({((profileData.healthInsuranceTypes.universalCoverage / profileData.total) * 100).toFixed(0)}%)
                </li>
                {profileData.healthInsuranceTypes.other > 0 && (
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'อื่น ๆ:' : 'Other:'}</span> {profileData.healthInsuranceTypes.other} {language === 'th' ? 'คน' : 'people'} ({((profileData.healthInsuranceTypes.other / profileData.total) * 100).toFixed(0)}%)
                  </li>
                )}
                {profileData.healthInsuranceTypes.none > 0 && (
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ไม่มีหลักประกัน:' : 'No coverage:'}</span> {profileData.healthInsuranceTypes.none} {language === 'th' ? 'คน' : 'people'} ({((profileData.healthInsuranceTypes.none / profileData.total) * 100).toFixed(0)}%)
                  </li>
                )}
              </ul>
            </section>

            {/* Oral Health Access */}
            {profileData.oralHealthProblems > 0 && (
              <section className="mb-8 ml-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                  {language === 'th' ? 'การเข้าถึงบริการทันตกรรม' : 'Oral Health Access'}
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'มีปัญหาสุขภาพช่องปาก:' : 'Had oral health problems:'}</span> {profileData.oralHealthProblems} {language === 'th' ? 'คน' : 'people'} ({((profileData.oralHealthProblems / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ไม่ได้รับการรักษา:' : 'Did not receive treatment:'}</span> {profileData.noOralTreatment} {language === 'th' ? 'คน' : 'people'} ({profileData.oralHealthProblems > 0 ? ((profileData.noOralTreatment / profileData.oralHealthProblems) * 100).toFixed(0) : 0}% {language === 'th' ? 'ของผู้ที่มีปัญหา' : 'of those with problems'})
                  </li>
                </ul>
              </section>
            )}

            {/* Oral Health Access Reasons - nested under Oral Health Access */}
            {profileData.noOralTreatment > 0 && Object.keys(profileData.oralHealthReasons).length > 0 && (
              <section className="mb-8 ml-12">
                <h4 className="text-base font-bold text-gray-800 mb-3 border-l-4 border-teal-400 pl-3">
                  {language === 'th' ? 'เหตุผลที่ไม่ได้รับการรักษา' : 'Reasons for Not Receiving Treatment'}
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm">
                  {Object.entries(profileData.oralHealthReasons)
                    .sort((a, b) => b[1] - a[1])
                    .map(([reason, count]) => (
                      <li key={reason}>
                        <span className="font-semibold">{reason}:</span> {count} {language === 'th' ? 'คน' : 'people'} ({((count / profileData.noOralTreatment) * 100).toFixed(0)}%)
                      </li>
                    ))}
                </ul>
              </section>
            )}

            {/* Physical Environment */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'สภาพแวดล้อมทางกายภาพ' : 'Physical Environment'}</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  {language === 'th'
                    ? `ในชุมชนนี้มีผู้ที่เป็นเจ้าของบ้านของตนเอง ${profileData.homeOwnership} คน (${((profileData.homeOwnership / profileData.total) * 100).toFixed(0)}%) และมีผู้ที่สามารถเข้าถึงน้ำสะอาด ${profileData.cleanWater} คน (${((profileData.cleanWater / profileData.total) * 100).toFixed(0)}%) นอกจากนี้พบว่ามี ${profileData.disasters} คน (${((profileData.disasters / profileData.total) * 100).toFixed(0)}%) ที่เคยประสบภัยพิบัติในช่วง 5 ปีที่ผ่านมา ${profileData.disasters > 0 && profileData.disasterTypes.flood > 0 ? `โดยภัยที่พบมากที่สุดคือน้ำท่วม ${profileData.disasterTypes.flood} คน` : ''}`
                    : `This community has ${profileData.homeOwnership} homeowners (${((profileData.homeOwnership / profileData.total) * 100).toFixed(0)}%) and ${profileData.cleanWater} people (${((profileData.cleanWater / profileData.total) * 100).toFixed(0)}%) with access to clean water. ${profileData.disasters} people (${((profileData.disasters / profileData.total) * 100).toFixed(0)}%) have experienced disasters in the past 5 years.`
                  }
                </p>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เป็นเจ้าของบ้าน:' : 'Home ownership:'}</span> {profileData.homeOwnership} / {profileData.total} ({((profileData.homeOwnership / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เข้าถึงน้ำสะอาด:' : 'Clean water access:'}</span> {profileData.cleanWater} / {profileData.total} ({((profileData.cleanWater / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ประสบภัยพิบัติ (5 ปีที่ผ่านมา):' : 'Disaster experience (past 5 years):'}</span> {profileData.disasters} / {profileData.total} ({((profileData.disasters / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Housing Status Breakdown */}
            <section className="mb-8 ml-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                {language === 'th' ? 'สถานะการครอบครองที่อยู่อาศัย' : 'Housing Status'}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เป็นเจ้าของ:' : 'Own:'}</span> {profileData.housingStatus.owner} {language === 'th' ? 'คน' : 'people'} ({((profileData.housingStatus.owner / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เช่า:' : 'Rent:'}</span> {profileData.housingStatus.rent} {language === 'th' ? 'คน' : 'people'} ({((profileData.housingStatus.rent / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'อยู่อาศัยกับญาติหรือเพื่อน:' : 'Living with relatives/friends:'}</span> {profileData.housingStatus.withRelatives} {language === 'th' ? 'คน' : 'people'} ({((profileData.housingStatus.withRelatives / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ที่บุกรุก:' : 'Squat:'}</span> {profileData.housingStatus.squat} {language === 'th' ? 'คน' : 'people'} ({((profileData.housingStatus.squat / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'บ้านพักสวัสดิการ:' : 'Welfare housing:'}</span> {profileData.housingStatus.welfare} {language === 'th' ? 'คน' : 'people'} ({((profileData.housingStatus.welfare / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Community Environment Issues */}
            <section className="mb-8 ml-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                {language === 'th' ? 'ลักษณะพื้นที่โดยรอบที่อาศัยอยู่' : 'Community Environment Issues'}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'อาคารหนาแน่น:' : 'Dense/Crowded:'}</span> {profileData.communityEnvironment.denseCrowded} ({((profileData.communityEnvironment.denseCrowded / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'บ้านมีพื้นที่แคบ:' : 'Narrow space:'}</span> {profileData.communityEnvironment.narrowSpace} ({((profileData.communityEnvironment.narrowSpace / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ขาดน้ำสะอาด:' : 'Lack clean water:'}</span> {profileData.communityEnvironment.noCleanWater} ({((profileData.communityEnvironment.noCleanWater / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ขาดไฟฟ้า:' : 'No electricity:'}</span> {profileData.communityEnvironment.noElectricity} ({((profileData.communityEnvironment.noElectricity / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ขาดการจัดการขยะที่เหมาะสม:' : 'Poor waste management:'}</span> {profileData.communityEnvironment.poorWasteManagement} ({((profileData.communityEnvironment.poorWasteManagement / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'น้ำเสีย:' : 'Wastewater issues:'}</span> {profileData.communityEnvironment.wasteWater} ({((profileData.communityEnvironment.wasteWater / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ยาเสพติด:' : 'Drug issues:'}</span> {profileData.communityEnvironment.drugs} ({((profileData.communityEnvironment.drugs / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Disaster Types Breakdown */}
            {profileData.disasters > 0 && (
              <section className="mb-8 ml-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                  {language === 'th' ? 'ประเภทภัยพิบัติที่ประสบ' : 'Types of Disasters Experienced'}
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'น้ำท่วม:' : 'Flood:'}</span> {profileData.disasterTypes.flood} {language === 'th' ? 'คน' : 'people'} ({((profileData.disasterTypes.flood / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'อากาศร้อนจัด:' : 'Extreme heat:'}</span> {profileData.disasterTypes.extremeHeat} {language === 'th' ? 'คน' : 'people'} ({((profileData.disasterTypes.extremeHeat / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'อากาศเย็นจัด:' : 'Extreme cold:'}</span> {profileData.disasterTypes.extremeCold} {language === 'th' ? 'คน' : 'people'} ({((profileData.disasterTypes.extremeCold / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ไฟไหม้:' : 'Fire:'}</span> {profileData.disasterTypes.fire} {language === 'th' ? 'คน' : 'people'} ({((profileData.disasterTypes.fire / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'แผ่นดินไหว:' : 'Earthquake:'}</span> {profileData.disasterTypes.earthquake} {language === 'th' ? 'คน' : 'people'} ({((profileData.disasterTypes.earthquake / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'โรคระบาด:' : 'Epidemic:'}</span> {profileData.disasterTypes.epidemic} {language === 'th' ? 'คน' : 'people'} ({((profileData.disasterTypes.epidemic / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'หลุมยุบ พื้นดินทรุด:' : 'Subsidence:'}</span> {profileData.disasterTypes.subsidence} {language === 'th' ? 'คน' : 'people'} ({((profileData.disasterTypes.subsidence / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'มลพิษ (ฝุ่น):' : 'Pollution (dust):'}</span> {profileData.disasterTypes.pollution} {language === 'th' ? 'คน' : 'people'} ({((profileData.disasterTypes.pollution / profileData.total) * 100).toFixed(0)}%)
                  </li>
                </ul>
              </section>
            )}

            {/* Community Amenities for Elderly */}
            <section className="mb-8 ml-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                {language === 'th' ? 'สิ่งอำนวยความสะดวกสำหรับผู้สูงอายุ' : 'Amenities for Elderly'}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ทางลาด:' : 'Ramp:'}</span> {profileData.communityAmenities.ramp} {language === 'th' ? 'คน' : 'people'} ({((profileData.communityAmenities.ramp / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ราวจับ:' : 'Handrails:'}</span> {profileData.communityAmenities.handrails} {language === 'th' ? 'คน' : 'people'} ({((profileData.communityAmenities.handrails / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'พื้นที่สาธารณะ:' : 'Public space:'}</span> {profileData.communityAmenities.publicSpace} {language === 'th' ? 'คน' : 'people'} ({((profileData.communityAmenities.publicSpace / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'สถานบริการสุขภาพ:' : 'Health service:'}</span> {profileData.communityAmenities.healthService} {language === 'th' ? 'คน' : 'people'} ({((profileData.communityAmenities.healthService / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ไม่มีสิ่งอำนวยความสะดวก:' : 'No amenities:'}</span> {profileData.communityAmenities.none} {language === 'th' ? 'คน' : 'people'} ({((profileData.communityAmenities.none / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Social Context */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'บริบททางสังคม' : 'Social Context'}</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  {language === 'th'
                    ? `ในด้านความสัมพันธ์ทางสังคม พบว่ามี ${profileData.socialSupport} คน (${((profileData.socialSupport / profileData.total) * 100).toFixed(0)}%) ที่มีเพื่อนหรือญาติที่สามารถพึ่งพาได้ในยามฉุกเฉิน เมื่อพิจารณาถึงปัญหาทางสังคมพบว่ามี ${profileData.discrimination} คน (${((profileData.discrimination / profileData.total) * 100).toFixed(0)}%) ที่เคยประสบการเลือกปฏิบัติ และมี ${profileData.violence} คน (${((profileData.violence / profileData.total) * 100).toFixed(0)}%) ที่เคยประสบความรุนแรงในช่วง 12 เดือนที่ผ่านมา ${profileData.communitySafety.verySafe > 0 ? `ส่วนใหญ่รู้สึกปลอดภัยมากในชุมชน ${profileData.communitySafety.verySafe} คน (${((profileData.communitySafety.verySafe / profileData.total) * 100).toFixed(0)}%)` : profileData.communitySafety.moderatelySafe > 0 ? `ส่วนใหญ่รู้สึกปลอดภัยปานกลางในชุมชน ${profileData.communitySafety.moderatelySafe} คน (${((profileData.communitySafety.moderatelySafe / profileData.total) * 100).toFixed(0)}%)` : ''}`
                    : `Regarding social relationships, ${profileData.socialSupport} people (${((profileData.socialSupport / profileData.total) * 100).toFixed(0)}%) have friends or relatives they can rely on in emergencies. ${profileData.discrimination} people (${((profileData.discrimination / profileData.total) * 100).toFixed(0)}%) have experienced discrimination and ${profileData.violence} people (${((profileData.violence / profileData.total) * 100).toFixed(0)}%) have experienced violence in the past 12 months.`
                  }
                </p>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'มีเพื่อนหรือญาติที่สามารถพึ่งพาได้ในยามฉุกเฉิน:' : 'Have friends/relatives to rely on in emergencies:'}</span> {profileData.socialSupport} / {profileData.total} ({((profileData.socialSupport / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เคยประสบการเลือกปฏิบัติ (ในช่วง 12 เดือนที่ผ่านมา):' : 'Experienced discrimination (past 12 months):'}</span> {profileData.discrimination} / {profileData.total} ({((profileData.discrimination / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'เคยประสบความรุนแรง (ในช่วง 12 เดือนที่ผ่านมา):' : 'Experienced violence (past 12 months):'}</span> {profileData.violence} / {profileData.total} ({((profileData.violence / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Community Safety Levels */}
            <section className="mb-8 ml-6">
              <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                {language === 'th' ? 'ความรู้สึกปลอดภัยในชุมชน' : 'Community Safety Perception'}
              </h4>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'รู้สึกปลอดภัยมาก:' : 'Very safe:'}</span> {profileData.communitySafety.verySafe} {language === 'th' ? 'คน' : 'people'} ({((profileData.communitySafety.verySafe / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'รู้สึกปลอดภัยปานกลาง:' : 'Moderately safe:'}</span> {profileData.communitySafety.moderatelySafe} {language === 'th' ? 'คน' : 'people'} ({((profileData.communitySafety.moderatelySafe / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'รู้สึกปลอดภัยน้อย:' : 'Slightly safe:'}</span> {profileData.communitySafety.slightlySafe} {language === 'th' ? 'คน' : 'people'} ({((profileData.communitySafety.slightlySafe / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'รู้สึกไม่ปลอดภัย:' : 'Not safe:'}</span> {profileData.communitySafety.notSafe} {language === 'th' ? 'คน' : 'people'} ({((profileData.communitySafety.notSafe / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Discrimination Types Breakdown */}
            {profileData.discrimination > 0 && (
              <section className="mb-8 ml-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                  {language === 'th' ? 'ประเภทการถูกเลือกปฏิบัติ' : 'Types of Discrimination'}
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'เชื้อชาติ:' : 'Ethnicity:'}</span> {profileData.discriminationTypes.ethnicity} {language === 'th' ? 'คน' : 'people'} ({((profileData.discriminationTypes.ethnicity / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ศาสนา:' : 'Religion:'}</span> {profileData.discriminationTypes.religion} {language === 'th' ? 'คน' : 'people'} ({((profileData.discriminationTypes.religion / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'เพศ:' : 'Gender:'}</span> {profileData.discriminationTypes.gender} {language === 'th' ? 'คน' : 'people'} ({((profileData.discriminationTypes.gender / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'อายุ:' : 'Age:'}</span> {profileData.discriminationTypes.age} {language === 'th' ? 'คน' : 'people'} ({((profileData.discriminationTypes.age / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'สถานะทางเศรษฐกิจ:' : 'Economic status:'}</span> {profileData.discriminationTypes.economicStatus} {language === 'th' ? 'คน' : 'people'} ({((profileData.discriminationTypes.economicStatus / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  {profileData.discriminationTypes.other > 0 && (
                    <li>
                      <span className="font-semibold">{language === 'th' ? 'อื่น ๆ:' : 'Other:'}</span> {profileData.discriminationTypes.other} {language === 'th' ? 'คน' : 'people'} ({((profileData.discriminationTypes.other / profileData.total) * 100).toFixed(0)}%)
                    </li>
                  )}
                </ul>
              </section>
            )}

            {/* Violence Types Breakdown */}
            {profileData.violence > 0 && (
              <section className="mb-8 ml-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                  {language === 'th' ? 'ประเภทความรุนแรง' : 'Types of Violence'}
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ความรุนแรงทางร่างกาย:' : 'Physical violence:'}</span> {profileData.violenceTypes.physical} {language === 'th' ? 'คน' : 'people'} ({((profileData.violenceTypes.physical / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ความรุนแรงทางจิตใจ:' : 'Psychological violence:'}</span> {profileData.violenceTypes.psychological} {language === 'th' ? 'คน' : 'people'} ({((profileData.violenceTypes.psychological / profileData.total) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ความรุนแรงทางเพศ:' : 'Sexual violence:'}</span> {profileData.violenceTypes.sexual} {language === 'th' ? 'คน' : 'people'} ({((profileData.violenceTypes.sexual / profileData.total) * 100).toFixed(0)}%)
                  </li>
                </ul>
              </section>
            )}

            {/* Health Behaviors */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'พฤติกรรมสุขภาพ' : 'Health Behaviors'}</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  {language === 'th'
                    ? `เมื่อพิจารณาพฤติกรรมสุขภาพพบว่า มี ${profileData.exercise} คน (${((profileData.exercise / profileData.total) * 100).toFixed(0)}%) ที่ออกกำลังกายสม่ำเสมอ ส่วนพฤติกรรมเสี่ยงต่อสุขภาพพบว่ามี ${profileData.smoking} คน (${((profileData.smoking / profileData.total) * 100).toFixed(0)}%) ที่สูบบุหรี่ และมี ${profileData.drinking} คน (${((profileData.drinking / profileData.total) * 100).toFixed(0)}%) ที่ดื่มแอลกอฮอล์`
                    : `Regarding health behaviors, ${profileData.exercise} people (${((profileData.exercise / profileData.total) * 100).toFixed(0)}%) exercise regularly. For risk behaviors, ${profileData.smoking} people (${((profileData.smoking / profileData.total) * 100).toFixed(0)}%) smoke tobacco and ${profileData.drinking} people (${((profileData.drinking / profileData.total) * 100).toFixed(0)}%) consume alcohol.`
                  }
                </p>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ออกกำลังกายสม่ำเสมอ:' : 'Regular exercise:'}</span> {profileData.exercise} / {profileData.total} ({((profileData.exercise / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'สูบบุหรี่:' : 'Tobacco use:'}</span> {profileData.smoking} / {profileData.total} ({((profileData.smoking / profileData.total) * 100).toFixed(0)}%)
                </li>
                <li>
                  <span className="font-semibold">{language === 'th' ? 'ดื่มแอลกอฮอล์:' : 'Alcohol consumption:'}</span> {profileData.drinking} / {profileData.total} ({((profileData.drinking / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Health Outcomes */}
            <section className="mb-8">
              <div className="bg-teal-700 text-white px-4 py-2 mb-4">
                <h3 className="text-xl font-bold">{language === 'th' ? 'ผลลัพธ์ทางสุขภาพ' : 'Health Outcomes'}</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  {language === 'th'
                    ? `ในชุมชนนี้มีผู้ที่มีโรคเรื้อรัง ${profileData.chronicDisease} คน จากทั้งหมด ${profileData.total} คน (${((profileData.chronicDisease / profileData.total) * 100).toFixed(0)}%) ${profileData.chronicDisease > 0 && profileData.diseaseTypes ? (profileData.diseaseTypes.hypertension > 0 ? `โดยโรคที่พบมากที่สุดคือความดันโลหิตสูง ${profileData.diseaseTypes.hypertension} คน` : profileData.diseaseTypes.diabetes > 0 ? `โดยโรคที่พบมากที่สุดคือเบาหวาน ${profileData.diseaseTypes.diabetes} คน` : '') : ''}`
                    : `This community has ${profileData.chronicDisease} people with chronic diseases out of ${profileData.total} (${((profileData.chronicDisease / profileData.total) * 100).toFixed(0)}%).`
                  }
                </p>
              </div>

              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  <span className="font-semibold">{language === 'th' ? 'มีโรคเรื้อรัง:' : 'Chronic disease:'}</span> {profileData.chronicDisease} / {profileData.total} ({((profileData.chronicDisease / profileData.total) * 100).toFixed(0)}%)
                </li>
              </ul>
            </section>

            {/* Disease Types Breakdown */}
            {profileData.chronicDisease > 0 && (
              <section className="mb-8 ml-6">
                <h4 className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-teal-500 pl-3">
                  {language === 'th' ? 'ประเภทโรคเรื้อรัง' : 'Chronic Disease Types'}
                </h4>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'เบาหวาน:' : 'Diabetes:'}</span> {profileData.diseaseTypes.diabetes} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.diabetes / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ความดันโลหิตสูง:' : 'Hypertension:'}</span> {profileData.diseaseTypes.hypertension} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.hypertension / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'โรคเกาต์:' : 'Gout:'}</span> {profileData.diseaseTypes.gout} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.gout / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ไตวายเรื้อรัง:' : 'Chronic kidney disease:'}</span> {profileData.diseaseTypes.kidneyDisease} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.kidneyDisease / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'มะเร็ง:' : 'Cancer:'}</span> {profileData.diseaseTypes.cancer} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.cancer / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ไขมันในเลือดสูง:' : 'High cholesterol:'}</span> {profileData.diseaseTypes.highCholesterol} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.highCholesterol / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'กล้ามเนื้อหัวใจขาดเลือด:' : 'Ischemic heart disease:'}</span> {profileData.diseaseTypes.ischemicHeart} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.ischemicHeart / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'โรคตับ:' : 'Liver disease:'}</span> {profileData.diseaseTypes.liverDisease} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.liverDisease / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'หลอดเลือดสมอง:' : 'Stroke:'}</span> {profileData.diseaseTypes.stroke} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.stroke / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'เอชไอวี (HIV):' : 'HIV:'}</span> {profileData.diseaseTypes.hiv} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.hiv / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'โรคทางจิตเวช:' : 'Mental health:'}</span> {profileData.diseaseTypes.mentalHealth} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.mentalHealth / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ภูมิแพ้:' : 'Allergies:'}</span> {profileData.diseaseTypes.allergies} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.allergies / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'โรคกระดูกและข้อ:' : 'Bone and joint disease:'}</span> {profileData.diseaseTypes.boneJoint} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.boneJoint / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'โรคระบบทางเดินหายใจ:' : 'Respiratory disease:'}</span> {profileData.diseaseTypes.respiratory} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.respiratory / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ถุงลมโป่งพอง:' : 'Emphysema:'}</span> {profileData.diseaseTypes.emphysema} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.emphysema / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'โลหิตจาง:' : 'Anemia:'}</span> {profileData.diseaseTypes.anemia} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.anemia / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'กระเพาะอาหาร:' : 'Stomach ulcer:'}</span> {profileData.diseaseTypes.stomachUlcer} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.stomachUlcer / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ลมชัก:' : 'Epilepsy:'}</span> {profileData.diseaseTypes.epilepsy} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.epilepsy / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'ลำไส้:' : 'Intestinal disease:'}</span> {profileData.diseaseTypes.intestinal} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.intestinal / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'อัมพาต:' : 'Paralysis:'}</span> {profileData.diseaseTypes.paralysis} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.paralysis / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                  <li>
                    <span className="font-semibold">{language === 'th' ? 'อัมพฤกษ์:' : 'Dementia:'}</span> {profileData.diseaseTypes.dementia} {language === 'th' ? 'คน' : 'people'} ({((profileData.diseaseTypes.dementia / profileData.chronicDisease) * 100).toFixed(0)}%)
                  </li>
                </ul>
              </section>
            )}
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
