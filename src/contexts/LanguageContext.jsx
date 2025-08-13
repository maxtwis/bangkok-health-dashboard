// src/contexts/LanguageContext.jsx
import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation object
const translations = {
  en: {
    // App Title
    appTitle: 'Bangkok Health Inequalities Dashboard',
    appSubtitle: 'Social Determinants of Health Equity Analysis',
    
    // Navigation
    sdheAnalysis: 'SDHE Analysis',
    hotIssues: 'Hot Issues',
    
    // Population Groups
    populationGroups: {
      informal_workers: 'Informal Workers',
      elderly: 'Elderly',
      disabled: 'People with Disabilities',
      lgbtq: 'LGBTQ+'
    },
    
    // Domains
    domains: {
      economic_security: 'Economic Security',
      education: 'Education',
      healthcare_access: 'Healthcare Access',
      physical_environment: 'Physical Environment',
      social_context: 'Social Context',
      health_behaviors: 'Health Behaviors',
      health_outcomes: 'Health Outcomes'
    },
    
    // Indicators - Economic Security (Using Academic Thai Translations from CSV)
    indicators: {
      // Economic Security
      unemployment_rate: 'อัตราการว่างงาน',
      employment_rate: 'อัตราการจ้างงานต่อประชากร',
      vulnerable_employment: 'อัตราการจ้างงานที่ไม่มั่นคงต่อการจ้างงานทั้งหมด',
      food_insecurity_moderate: 'ความชุกของภาวะขาดสารอาหารระดับปานกลาง',
      food_insecurity_severe: 'ความชุกของภาวะขาดสารอาหารระดับรุนแรง',
      work_injury_fatal: 'อัตราความถี่ของการบาดเจ็บร้ายแรงจากการทำงาน',
      work_injury_non_fatal: 'อัตราความถี่ของการบาดเจ็บไม่ร้ายแรงจากการทำงาน',
      catastrophic_health_spending_household: 'ร้อยละของครัวเรือนที่มีค่าใช้จ่ายด้านสุขภาพที่จ่ายเองมากกว่าร้อยละ 40 ของความสามารถในการจ่าย',
      health_spending_over_10_percent: 'ร้อยละของประชากรที่มีค่าใช้จ่ายด้านสุขภาพที่จ่ายเองมากกว่าร้อยละ 10 ของรายได้',
      health_spending_over_25_percent: 'ร้อยละของประชากรที่มีค่าใช้จ่ายด้านสุขภาพที่จ่ายเองมากกว่าร้อยละ 25 ของรายได้',
      
      // Education
      functional_literacy: 'อัตราส่วนประชากรที่มีความสามารถในด้าน (ก) การรู้หนังสือและ (ข) การคำนวณ',
      primary_completion: 'อัตราการสำเร็จการศึกษาระดับประถมศึกษา',
      secondary_completion: 'อัตราการสำเร็จการศึกษาระดับมัธยมศึกษา',
      tertiary_completion: 'อัตราการสำเร็จการศึกษาระดับอุดมศึกษา',
      training_participation: 'อัตราการมีส่วนร่วมของเยาวชนและผู้ใหญ่ในการศึกษาและการฝึกอบรมทั้งในระบบและนอกระบบ',
      
      // Healthcare Access
      health_coverage: 'ความคุ้มครองด้านสุขภาพ',
      medical_consultation_skip_cost: 'ร้อยละของประชากรที่ต้องงดการปรึกษาแพทย์เนื่องจากค่าใช้จ่าย',
      medical_treatment_skip_cost: 'ร้อยละของประชากรที่ต้องงดการตรวจทางการแพทย์ การรักษา หรือการติดตามผลเนื่องจากค่าใช้จ่าย',
      prescribed_medicine_skip_cost: 'ร้อยละของประชากรที่ต้องงดการรับยาตามใบสั่งแพทย์เนื่องจากค่าใช้จ่าย',
      dental_access: 'การเข้าถึงบริการทันตกรรม',
      
      // Physical Environment
      electricity_access: 'อัตราส่วนประชากรที่เข้าถึงไฟฟ้า',
      clean_water_access: 'อัตราส่วนประชากรที่ใช้บริการน้ำดื่มที่ได้รับการจัดการอย่างปลอดภัย',
      sanitation_facilities: 'อัตราส่วนประชากรที่เข้าถึงบริการสุขาภิบาลขั้นพื้นฐาน',
      waste_management: 'ร้อยละของขยะมูลฝอยชุมชนที่ได้รับการจัดเก็บและจัดการ',
      housing_overcrowding: 'อัตราส่วนครัวเรือนที่อาศัยอยู่ในที่พักอาศัยที่แออัด',
      home_ownership: 'อัตราส่วนครัวเรือนที่มีที่อยู่อาศัยเป็นของตนเอง',
      disaster_experience: 'ร้อยละของประชากรที่ประสบภัยแล้ง น้ำท่วม และอุณหภูมิสูงสุด-ต่ำสุด',
      
      // Social Context
      community_safety: 'อัตราส่วนประชากรที่รู้สึกปลอดภัยเมื่อเดินคนเดียวในเวลากลางคืน',
      violence_physical: 'อัตราส่วนประชากรที่ถูกกระทำความรุนแรงทางร่างกาย',
      violence_psychological: 'อัตราส่วนประชากรที่ถูกกระทำความรุนแรงทางจิตใจ',
      violence_sexual: 'อัตราส่วนประชากรที่ถูกกระทำความรุนแรงทางเพศ',
      discrimination_experience: 'อัตราส่วนประชากรที่รายงานว่าเคยถูกเลือกปฏิบัติ',
      social_support: 'อัตราส่วนประชากรที่รายงานว่ามีบุคคลที่สามารถพึ่งพาได้ในยามฉุกเฉิน',
      community_murder: 'จำนวนเหยื่อจากการฆาตกรรมโดยเจตนา',
      
      // Health Behaviors
      alcohol_consumption: 'การบริโภคแอลกอฮอล์ต่อหัวประชากร',
      tobacco_use: 'อัตราการใช้ยาสูบในประชากรอายุ 15 ขึ้นไป',
      physical_activity: 'อัตราส่วนประชากรที่มีกิจกรรมทางกายไม่เพียงพอ',
      obesity: 'ร้อยละของผู้ใหญ่ที่มีภาวะน้ำหนักเกิน',
      
      // Health Outcomes - Disease names in Thai
      any_chronic_disease: 'โรคเรื้อรังใดๆ',
      diabetes: 'เบาหวาน',
      hypertension: 'ความดันโลหิตสูง',
      gout: 'โรคเกาต์',
      chronic_kidney_disease: 'ไตวายเรื้อรัง',
      cancer: 'มะเร็ง',
      high_cholesterol: 'ไขมันในเลือดสูง',
      ischemic_heart_disease: 'กล้ามเนื้อหัวใจขาดเลือด',
      liver_disease: 'โรคตับ',
      stroke: 'หลอดเลือดสมอง',
      hiv: 'เอชไอวี',
      mental_health: 'โรคทางจิตเวช',
      allergies: 'ภูมิแพ้',
      bone_joint_disease: 'โรคกระดูกและข้อ',
      respiratory_disease: 'โรคระบบทางเดินหายใจ',
      emphysema: 'ถุงลมโป่งพอง',
      anemia: 'โลหิตจาง',
      stomach_ulcer: 'กระเพาะอาหาร',
      epilepsy: 'ลมชัก',
      intestinal_disease: 'ลำไส้',
      paralysis: 'อัมพาต',
      dementia: 'อัมพฤกษ์',
      cardiovascular_diseases: 'ภาระโรคหัวใจและหลอดเลือด',
      metabolic_diseases: 'ภาระโรคเมแทบอลิก',
      multiple_chronic_conditions: 'โรคเรื้อรังหลายโรค (2+ โรค)'
    },
    
    // UI Text
    ui: {
      loading: 'Loading SDHE Data',
      loadingDescription: 'Processing survey data and calculating health equity indicators...',
      error: 'Data Loading Error',
      retry: 'Retry',
      populationGroup: 'Population Group',
      district: 'District',
      indicator: 'Indicator',
      score: 'Score',
      prevalence: 'Prevalence',
      sampleSize: 'Sample Size',
      performance: 'Performance',
      diseaseBurden: 'Disease Burden',
      noData: 'No data available for this combination',
      tryDifferent: 'Try selecting a different district or population group',
      aboutSDHE: 'About SDHE Indicators',
      aboutDescription: 'Social Determinants of Health Equity (SDHE) indicators measure conditions that influence health outcomes across different population groups. Scores represent the percentage achieving positive health outcomes.',
      healthOutcomesNote: 'Health Outcomes Note:',
      healthOutcomesDescription: 'These indicators show disease prevalence rates. Lower percentages are better (fewer people with the condition). The domain score represents overall health status.',
      excellent: 'Excellent',
      good: 'Good',
      fair: 'Fair',
      poor: 'Poor',
      bestOutcomes: 'Best outcomes',
      aboveAverage: 'Above average',
      belowAverage: 'Below average',
      worstOutcomes: 'Worst outcomes',
      colorNote: 'Color coding automatically adjusts - some indicators are "good when low" (e.g., unemployment, violence, diseases) while others are "good when high" (e.g., education, health coverage).',
      
      // Spider Chart
      spiderChartTitle: 'SDHE Domain Comparison by Population Group',
      spiderChartDescription: 'Comparing domain scores across all population groups in',
      dynamicScale: 'Dynamic Scale',
      fullScale: 'Full Scale (0-100)',
      dynamicScaleNote: 'Dynamic Scale: Showing range',
      to: 'to',
      toHighlightDifferences: 'to highlight differences',
      domainPerformanceRankings: 'Domain Performance Rankings',
      howToRead: 'How to read:',
      spiderChartInstructions: 'Each line represents one population group. Use "Dynamic Scale" to highlight differences between groups, or "Full Scale" to see absolute performance. Hover over points to see exact values.',
      
      // Hot Issues
      hotIssuesTitle: 'Indicator Analysis by District',
      selectIndicator: 'Select indicator to analyze',
      top5Districts: '5 districts with highest problems',
      from: 'from',
      totalDistricts: 'total districts',
      noDataForGroup: 'No data available for this group',
      
      // Footer
      footerSource: 'Data from Million Health Check Project, Medical Department, Bangkok Metropolitan Administration'
    }
  },
  
  th: {
    // App Title
    appTitle: 'แดชบอร์ดความไม่เท่าเทียมด้านสุขภาพกรุงเทพฯ',
    appSubtitle: 'การวิเคราะห์ปัจจัยสำคัญทางสังคมที่ส่งผลต่อความเท่าเทียมด้านสุขภาพ',
    
    // Navigation
    sdheAnalysis: 'การวิเคราะห์ SDHE',
    hotIssues: 'ประเด็นร้อน',
    
    // Population Groups
    populationGroups: {
      informal_workers: 'แรงงานนอกระบบ',
      elderly: 'ผู้สูงอายุ',
      disabled: 'คนพิการ',
      lgbtq: 'กลุ่มเพศหลากหลาย'
    },
    
    // Domains
    domains: {
      economic_security: 'ความมั่นคงทางเศรษฐกิจ',
      education: 'การศึกษา',
      healthcare_access: 'การเข้าถึงบริการสุขภาพ',
      physical_environment: 'สภาพแวดล้อมทางกายภาพ',
      social_context: 'บริบททางสังคม',
      health_behaviors: 'พฤติกรรมสุขภาพ',
      health_outcomes: 'ผลลัพธ์ด้านสุขภาพ'
    },
    
    // Indicators - Economic Security
    indicators: {
      unemployment_rate: 'อัตราการว่างงาน',
      employment_rate: 'อัตราการจ้างงาน',
      vulnerable_employment: 'การจ้างงานที่เปราะบาง',
      food_insecurity_moderate: 'ความไม่มั่นคงด้านอาหาร (ปานกลาง)',
      food_insecurity_severe: 'ความไม่มั่นคงด้านอาหาร (รุนแรง)',
      work_injury_fatal: 'การบาดเจ็บจากงาน (ร้ายแรง/เสียชีวิต)',
      work_injury_non_fatal: 'การบาดเจ็บจากงาน (ไม่ร้ายแรง)',
      catastrophic_health_spending_household: 'ค่าใช้จ่ายสุขภาพสูงเกินไป (ครัวเรือน)',
      health_spending_over_10_percent: 'ค่าใช้จ่ายสุขภาพ >10% ของรายได้',
      health_spending_over_25_percent: 'ค่าใช้จ่ายสุขภาพ >25% ของรายได้',
      
      // Education
      functional_literacy: 'การรู้หนังสือเชิงหน้าที่',
      primary_completion: 'การจบการศึกษาระดับประถม',
      secondary_completion: 'การจบการศึกษาระดับมัธยม',
      tertiary_completion: 'การจบการศึกษาระดับอุดมศึกษา',
      training_participation: 'การเข้าร่วมการฝึกอบรม',
      
      // Healthcare Access
      health_coverage: 'ความคุ้มครองด้านสุขภาพ',
      medical_consultation_skip_cost: 'การข้ามการปรึกษาแพทย์ (ค่าใช้จ่าย)',
      medical_treatment_skip_cost: 'การข้ามการรักษา (ค่าใช้จ่าย)',
      prescribed_medicine_skip_cost: 'การข้ามการซื้อยา (ค่าใช้จ่าย)',
      dental_access: 'การเข้าถึงบริการทันตกรรม',
      
      // Physical Environment
      electricity_access: 'การเข้าถึงไฟฟ้า',
      clean_water_access: 'การเข้าถึงน้ำสะอาด',
      sanitation_facilities: 'สิ่งอำนวยความสะดวกด้านสุขาภิบาล',
      waste_management: 'การจัดการขยะ',
      housing_overcrowding: 'ที่อยู่อาศัยแออัด',
      home_ownership: 'การเป็นเจ้าของบ้าน',
      disaster_experience: 'ประสบการณ์ภาวะภัยพิบัติ',
      
      // Social Context
      community_safety: 'ความปลอดภัยในชุมชน',
      violence_physical: 'ความรุนแรงทางร่างกาย',
      violence_psychological: 'ความรุนแรงทางจิตใจ',
      violence_sexual: 'ความรุนแรงทางเพศ',
      discrimination_experience: 'การถูกเลือกปฏิบัติ',
      social_support: 'การสนับสนุนทางสังคม',
      community_murder: 'การฆาตกรรมในชุมชน',
      
      // Health Behaviors
      alcohol_consumption: 'การดื่มเครื่องดื่มแอลกอฮอล์',
      tobacco_use: 'การสูบบุหรี่',
      physical_activity: 'การออกกำลังกาย',
      obesity: 'ความอ้วน',
      
      // Health Outcomes
      any_chronic_disease: 'โรคเรื้อรังใดๆ',
      diabetes: 'เบาหวาน',
      hypertension: 'ความดันโลหิตสูง',
      gout: 'โรคเกาต์',
      chronic_kidney_disease: 'ไตวายเรื้อรัง',
      cancer: 'มะเร็ง',
      high_cholesterol: 'ไขมันในเลือดสูง',
      ischemic_heart_disease: 'กล้ามเนื้อหัวใจขาดเลือด',
      liver_disease: 'โรคตับ',
      stroke: 'หลอดเลือดสมอง',
      hiv: 'เอชไอวี',
      mental_health: 'โรคทางจิตเวช',
      allergies: 'ภูมิแพ้',
      bone_joint_disease: 'โรคกระดูกและข้อ',
      respiratory_disease: 'โรคระบบทางเดินหายใจ',
      emphysema: 'ถุงลมโป่งพอง',
      anemia: 'โลหิตจาง',
      stomach_ulcer: 'กระเพาะอาหาร',
      epilepsy: 'ลมชัก',
      intestinal_disease: 'ลำไส้',
      paralysis: 'อัมพาต',
      dementia: 'อัมพฤกษ์',
      cardiovascular_diseases: 'ภาระโรคหัวใจและหลอดเลือด',
      metabolic_diseases: 'ภาระโรคเมแทบอลิก',
      multiple_chronic_conditions: 'โรคเรื้อรังหลายโรค (2+ โรค)'
    },
    
    // UI Text
    ui: {
      loading: 'กำลังโหลดข้อมูล SDHE',
      loadingDescription: 'กำลังประมวลผลข้อมูลการสำรวจและคำนวณตัวชี้วัดความเท่าเทียมด้านสุขภาพ...',
      error: 'ข้อผิดพลาดในการโหลดข้อมูล',
      retry: 'ลองอีกครั้ง',
      populationGroup: 'กลุ่มประชากร',
      district: 'เขต',
      indicator: 'ตัวชี้วัด',
      score: 'คะแนน',
      prevalence: 'อัตราการเกิด',
      sampleSize: 'ขนาดกลุ่มตัวอย่าง',
      performance: 'ประสิทธิภาพ',
      diseaseBurden: 'ภาระโรค',
      noData: 'ไม่มีข้อมูลสำหรับการเลือกนี้',
      tryDifferent: 'ลองเลือกเขตหรือกลุ่มประชากรอื่น',
      aboutSDHE: 'เกี่ยวกับตัวชี้วัด SDHE',
      aboutDescription: 'ตัวชี้วัดปัจจัยสำคัญทางสังคมที่ส่งผลต่อความเท่าเทียมด้านสุขภาพ (SDHE) วัดสภาวะที่มีอิทธิพลต่อผลลัพธ์ด้านสุขภาพในกลุ่มประชากรต่างๆ คะแนนแสดงเปอร์เซ็นต์ที่บรรลุผลลัพธ์สุขภาพเชิงบวก',
      healthOutcomesNote: 'หมายเหตุผลลัพธ์ด้านสุขภาพ:',
      healthOutcomesDescription: 'ตัวชี้วัดเหล่านี้แสดงอัตราการเกิดโรค เปอร์เซ็นต์ที่ต่ำกว่าจะดีกว่า (คนป่วยน้อยกว่า) คะแนนโดเมนแสดงสถานะสุขภาพโดยรวม',
      excellent: 'ยอดเยี่ยม',
      good: 'ดี',
      fair: 'พอใช้',
      poor: 'แย่',
      bestOutcomes: 'ผลลัพธ์ดีที่สุด',
      aboveAverage: 'เหนือค่าเฉลี่ย',
      belowAverage: 'ต่ำกว่าค่าเฉลี่ย',
      worstOutcomes: 'ผลลัพธ์แย่ที่สุด',
      colorNote: 'การแสดงสีปรับอัตโนมัติ - ตัวชี้วัดบางตัว "ดีเมื่อต่ำ" (เช่น การว่างงาน ความรุนแรง โรค) ในขณะที่อื่นๆ "ดีเมื่อสูง" (เช่น การศึกษา ความคุ้มครองสุขภาพ)',
      
      // Spider Chart
      spiderChartTitle: 'การเปรียบเทียบโดเมน SDHE ตามกลุ่มประชากร',
      spiderChartDescription: 'เปรียบเทียบคะแนนโดเมนของกลุ่มประชากรทั้งหมดใน',
      dynamicScale: 'มาตราส่วนแบบไดนามิก',
      fullScale: 'มาตราส่วนเต็ม (0-100)',
      dynamicScaleNote: 'มาตราส่วนแบบไดนามิก: แสดงช่วง',
      to: 'ถึง',
      toHighlightDifferences: 'เพื่อเน้นความแตกต่าง',
      domainPerformanceRankings: 'อันดับประสิทธิภาพโดเมน',
      howToRead: 'วิธีอ่าน:',
      spiderChartInstructions: 'แต่ละเส้นแสดงกลุ่มประชากรหนึ่งกลุ่ม ใช้ "มาตราส่วนแบบไดนามิก" เพื่อเน้นความแตกต่างระหว่างกลุ่ม หรือ "มาตราส่วนเต็ม" เพื่อดูประสิทธิภาพสัมบูรณ์ เลื่อนเมาส์ไปที่จุดต่างๆ เพื่อดูค่าที่แน่นอน',
      
      // Hot Issues
      hotIssuesTitle: 'การวิเคราะห์ตัวชี้วัดตามเขต',
      selectIndicator: 'เลือกตัวชี้วัดที่ต้องการวิเคราะห์',
      top5Districts: '5 เขตที่มีปัญหามากที่สุด',
      from: 'จากทั้งหมด',
      totalDistricts: 'เขต',
      noDataForGroup: 'ไม่มีข้อมูลสำหรับกลุ่มนี้',
      
      // Footer
      footerSource: 'ข้อมูลจากโครงการตรวจสุขภาพล้านคน สำนักการแพทย์ กรุงเทพมหานคร'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'th' : 'en');
  };

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        break;
      }
    }
    
    return value || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};