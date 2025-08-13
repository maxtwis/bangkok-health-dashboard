// src/contexts/LanguageContext.jsx - Updated with CSV integration
import React, { createContext, useContext, useState } from 'react';
import useIndicatorDetails from '../hooks/useIndicatorDetails';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Base translations for UI elements (not indicators)
const baseTranslations = {
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
      bangkokOverall: 'Bangkok Overall (50 Districts)',
      
      // Spider Chart
      spiderChartTitle: 'SDHE Domain Comparison by Population Group',
      spiderChartDescription: 'Comparing domain scores across all population groups in',
      dynamicScale: 'Dynamic Scale',
      fullScale: 'Full Scale (0-100)',
      dynamicScaleNote: 'Showing range',
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
    appTitle: 'Bangkok Health Inequalities Dashboard',
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
      prevalence: 'อัตราผู้ป่วย (%)',
      sampleSize: 'ขนาดกลุ่มตัวอย่าง',
      performance: 'ประสิทธิภาพ',
      diseaseBurden: 'อัตราผู้ป่วย',
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
      colorNote: 'สีของตัวชี้วัดปรับตามความหมาย: ตัวชี้วัดบางตัวจะดีเมื่อมีค่าต่ำ (เช่น อัตราว่างงาน ความรุนแรง โรคต่างๆ) ส่วนตัวชี้วัดอื่นจะดีเมื่อมีค่าสูง (เช่น การศึกษา การคุ้มครองสุขภาพ)',
      bangkokOverall: 'ภาพรวม 50 เขต',
      
      // Spider Chart
      spiderChartTitle: 'การเปรียบเทียบประเด็นตัวชี้วัด SDHE ตามกลุ่มประชากร',
      spiderChartDescription: 'เปรียบเทียบคะแนนประเด็นตัวชี้วัดของกลุ่มประชากรทั้งหมดใน',
      dynamicScale: 'มาตราส่วนแบบไดนามิก',
      fullScale: 'มาตราส่วนเต็ม (0-100)',
      dynamicScaleNote: 'แสดงช่วง',
      to: 'ถึง',
      toHighlightDifferences: 'เพื่อเน้นความแตกต่าง',
      domainPerformanceRankings: 'อันดับคะแนนตามประเด็นตัวชี้วัด',
      howToRead: 'วิธีการอ่านกราฟ:',
      spiderChartInstructions: 'แต่ละเส้นแทนกลุ่มประชากรหนึ่งกลุ่ม เลือก "มาตราส่วนแบบไดนามิก" เพื่อเน้นความแตกต่างระหว่างกลุ่ม หรือเลือก "มาตราส่วนเต็ม" เพื่อดูคะแนนจริง วางเมาส์ที่จุดต่างๆ เพื่อดูค่าที่แน่นอน',
      
      // Hot Issues
      hotIssuesTitle: 'การวิเคราะห์ตัวชี้วัดตามเขต',
      selectIndicator: 'เลือกตัวชี้วัดที่ต้องการวิเคราะห์',
      top5Districts: '5 เขตที่มีปัญหามากที่สุด',
      from: 'จากทั้งหมด',
      totalDistricts: 'เขต',
      noDataForGroup: 'ไม่มีข้อมูลสำหรับกลุ่มนี้',
      
      // Footer
      footerSource: 'ข้อมูลจากโครงการการพัฒนาตัวชี้วัดและระบบกลไกเก็บข้อมูล เพื่อลดความเหลื่อมล้ำทางสุขภาวะในเขตเมือง พื้นที่กรุงเทพมหานคร กรมการแพทย์ กรุงเทพมหานคร'
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');
  
  // Use the CSV indicator details hook
  const { getIndicatorName, loading: indicatorDetailsLoading } = useIndicatorDetails();

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'th' : 'en');
  };

  const t = (key) => {
    const keys = key.split('.');
    
    // Special handling for indicator translations from CSV
    if (keys[0] === 'indicators' && keys[1]) {
      const indicatorKey = keys[1];
      
      // If CSV is still loading, use fallback
      if (indicatorDetailsLoading) {
        return `Loading ${indicatorKey}...`;
      }
      
      // Get indicator name from CSV
      const csvName = getIndicatorName(indicatorKey, language);
      if (csvName && csvName !== indicatorKey) {
        return csvName;
      }
      
      // Fallback to key if not found in CSV
      return indicatorKey;
    }
    
    // Regular translation lookup for non-indicator keys
    let value = baseTranslations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        break;
      }
    }
    
    return value || key;
  };

  // Helper function to get indicator translation directly
  const getIndicatorTranslation = (indicatorKey) => {
    if (indicatorDetailsLoading) {
      return `Loading ${indicatorKey}...`;
    }
    
    const csvName = getIndicatorName(indicatorKey, language);
    return csvName || indicatorKey;
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      toggleLanguage, 
      t, 
      getIndicatorTranslation,
      indicatorDetailsLoading 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};