// Updated Basic SDHE Data Processor with Healthcare Supply Indicators - src/utils/BasicSDHEProcessor.js
import Papa from 'papaparse';
import _ from 'lodash';

class BasicSDHEProcessor {
  constructor() {
    this.surveyData = [];
    this.healthSupplyData = [];
    this.healthFacilitiesData = [];
    this.districtPopulationData = [];
    this.communityHealthWorkerData = [];
    this.communityPopulationData = [];
    this.sdheResults = {};
    this.districtCodeMap = this.createDistrictCodeMap();
    this.indicatorMappings = this.createIndicatorMappings();
  }

  createDistrictCodeMap() {
    return {
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
    };
  }

  // Load additional healthcare supply data files
  async loadHealthcareSupplyData() {
    try {
      console.log('🏥 Loading healthcare supply data...');
      
      // Load health supply data
      const healthSupplyResponse = await fetch('/data/health_supply.csv');
      if (!healthSupplyResponse.ok) {
        throw new Error('Could not load health_supply.csv');
      }
      const healthSupplyCsv = await healthSupplyResponse.text();
      const healthSupplyParsed = Papa.parse(healthSupplyCsv, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      this.healthSupplyData = healthSupplyParsed.data;
      console.log(`✅ Loaded ${this.healthSupplyData.length} health facilities`);

      // Load health facilities data 
      const healthFacilitiesResponse = await fetch('/data/health_facilities.csv');
    if (!healthFacilitiesResponse.ok) {
      throw new Error('Could not load health_facilities.csv');
    }
    const healthFacilitiesCsv = await healthFacilitiesResponse.text();
    const healthFacilitiesParsed = Papa.parse(healthFacilitiesCsv, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });
    this.healthFacilitiesData = healthFacilitiesParsed.data;
    console.log(`✅ Loaded ${this.healthFacilitiesData.length} health facility records`);

      // Load district population data
      const districtPopResponse = await fetch('/data/district_population.csv');
      if (!districtPopResponse.ok) {
        throw new Error('Could not load district_population.csv');
      }
      const districtPopCsv = await districtPopResponse.text();
      const districtPopParsed = Papa.parse(districtPopCsv, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      this.districtPopulationData = districtPopParsed.data;
      console.log(`✅ Loaded ${this.districtPopulationData.length} population records`);

      // Load community health worker data
      const chwResponse = await fetch('/data/community_health_worker.csv');
      if (!chwResponse.ok) {
        throw new Error('Could not load community_health_worker.csv');
      }
      const chwCsv = await chwResponse.text();
      const chwParsed = Papa.parse(chwCsv, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      this.communityHealthWorkerData = chwParsed.data;
      console.log(`✅ Loaded ${this.communityHealthWorkerData.length} CHW records`);

      // Load community population data
      const commPopResponse = await fetch('/data/community_population.csv');
      if (!commPopResponse.ok) {
        throw new Error('Could not load community_population.csv');
      }
      const commPopCsv = await commPopResponse.text();
      const commPopParsed = Papa.parse(commPopCsv, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      this.communityPopulationData = commPopParsed.data;
      console.log(`✅ Loaded ${this.communityPopulationData.length} community population records`);

    } catch (error) {
      console.error('❌ Error loading healthcare supply data:', error);
      throw error;
    }
  }

  // Calculate healthcare supply indicators for a district
  calculateHealthcareSupplyIndicators(districtCode, districtName) {
    const results = {};

    try {
      // Get total population for the district
      const districtPopulation = this.districtPopulationData
        .filter(record => record.dcode === districtCode)
        .reduce((sum, record) => sum + (record.population || 0), 0);

      if (districtPopulation === 0) {
        console.warn(`⚠️ No population data found for district ${districtName} (${districtCode})`);
        return {
          doctor_per_population: { value: 0, sample_size: 0 },
          nurse_per_population: { value: 0, sample_size: 0 },
          healthworker_per_population: { value: 0, sample_size: 0 },
          community_healthworker_per_population: { value: 0, sample_size: 0 }
        };
      }

      // Get health facilities in the district
      const districtHealthFacilities = this.healthSupplyData.filter(facility => 
        facility.dcode === districtCode
      );

      // Calculate totals from health facilities
      const totalDoctors = districtHealthFacilities.reduce((sum, facility) => 
        sum + (facility.doctor_count || 0), 0);
      const totalNurses = districtHealthFacilities.reduce((sum, facility) => 
        sum + (facility.nurse_count || 0), 0);
      const totalHealthWorkers = districtHealthFacilities.reduce((sum, facility) => 
        sum + (facility.healthworker_count || 0), 0);

      // Calculate per 1,000 population for doctors and nurses
      results.doctor_per_population = {
        value: parseFloat(((totalDoctors / districtPopulation) * 1000).toFixed(2)),
        sample_size: districtHealthFacilities.length,
        population: districtPopulation,
        absolute_count: totalDoctors
      };

      results.nurse_per_population = {
        value: parseFloat(((totalNurses / districtPopulation) * 1000).toFixed(2)),
        sample_size: districtHealthFacilities.length,
        population: districtPopulation,
        absolute_count: totalNurses
      };

      // Calculate per 10,000 population for health workers
      results.healthworker_per_population = {
        value: parseFloat(((totalHealthWorkers / districtPopulation) * 10000).toFixed(2)),
        sample_size: districtHealthFacilities.length,
        population: districtPopulation,
        absolute_count: totalHealthWorkers
      };

      // Calculate community health workers per 1,000 community population
      const districtCHW = this.communityHealthWorkerData.find(record => 
        record.dcode === districtCode
      );
      
      const communityPopulation = this.communityPopulationData
        .filter(record => record.dcode === districtCode)
        .reduce((sum, record) => sum + (record.community_population_count || 0), 0);

      if (districtCHW && communityPopulation > 0) {
        results.community_healthworker_per_population = {
          value: parseFloat(((districtCHW.community_health_worker_count / communityPopulation) * 1000).toFixed(2)),
          sample_size: 1,
          population: communityPopulation,
          absolute_count: districtCHW.community_health_worker_count
        };
      } else {
        results.community_healthworker_per_population = {
          value: 0,
          sample_size: 0,
          population: communityPopulation,
          absolute_count: 0
        };
      }

    } catch (error) {
      console.error(`❌ Error calculating healthcare supply for ${districtName}:`, error);
      return {
        doctor_per_population: { value: 0, sample_size: 0 },
        nurse_per_population: { value: 0, sample_size: 0 },
        healthworker_per_population: { value: 0, sample_size: 0 },
        community_healthworker_per_population: { value: 0, sample_size: 0 }
      };
    }

    return results;
  }

  calculateHealthServiceAccess(districtCode, districtName) {
  try {
    // Get total population for the district
    const districtPopulation = this.districtPopulationData
      .filter(record => record.dcode === districtCode)
      .reduce((sum, record) => sum + (record.population || 0), 0);

    if (districtPopulation === 0) {
      console.warn(`⚠️ No population data found for district ${districtName} (${districtCode})`);
      return { value: 0, sample_size: 0, population: 0, absolute_count: 0 };
    }

    // Get health facilities in the district
    const districtHealthFacilities = this.healthFacilitiesData.filter(facility => 
      facility.dcode === districtCode
    );

    // Calculate facilities per 10,000 population
    const facilitiesPer10k = parseFloat(((districtHealthFacilities.length / districtPopulation) * 10000).toFixed(2));

    return {
      value: facilitiesPer10k,
      sample_size: districtHealthFacilities.length,
      population: districtPopulation,
      absolute_count: districtHealthFacilities.length
    };

  } catch (error) {
    console.error(`❌ Error calculating health service access for ${districtName}:`, error);
    return { value: 0, sample_size: 0, population: 0, absolute_count: 0 };
  }
}


  createIndicatorMappings() {
    return {
      // Economic Security Domain - Complete set
      economic_security: {
        unemployment_rate: { 
          field: 'occupation_status', 
          condition: (val) => val === 0,
          label: 'Unemployment Rate'
        },
        employment_rate: { 
          field: 'occupation_status', 
          condition: (val) => val === 1,
          label: 'Employment Rate'
        },
        vulnerable_employment: { 
          fields: ['occupation_status', 'occupation_contract'], 
          condition: (r) => r.occupation_status === 1 && r.occupation_contract === 0,
          label: 'Vulnerable Employment'
        },
        food_insecurity_moderate: { 
          field: 'food_insecurity_1', 
          condition: (val) => val === 1,
          label: 'Food Insecurity (Moderate)'
        },
        food_insecurity_severe: { 
          field: 'food_insecurity_2', 
          condition: (val) => val === 1,
          label: 'Food Insecurity (Severe)'
        },
        work_injury_fatal: { 
          field: 'occupation_injury', 
          condition: (val) => val === 1,
          label: 'Work Injury (Fatal/Serious)'
        },
        work_injury_non_fatal: { 
          field: 'occupation_small_injury', 
          condition: (val) => val === 1,
          label: 'Work Injury (Non-Fatal)'
        },
        catastrophic_health_spending_household: {
          calculation: (records) => {
            const validRecords = records.filter(r => 
              r.hh_health_expense !== null && 
              r.hh_health_expense !== undefined && 
              r.income !== null && 
              r.income !== undefined && 
              r.income > 0
            );
            
            if (validRecords.length === 0) return 0;
            
            const catastrophicHouseholds = validRecords.filter(r => {
              const monthlyIncome = r.income_type === 1 ? r.income * 30 : r.income;
              const healthSpendingRatio = (r.hh_health_expense / monthlyIncome) * 100;
              return healthSpendingRatio > 40;
            });
            
            return (catastrophicHouseholds.length / validRecords.length) * 100;
          },
          label: 'Catastrophic Health Spending (Household)'
        },
        health_spending_over_10_percent: {
          calculation: (records) => {
            const validRecords = records.filter(r => 
              r.health_expense !== null && 
              r.health_expense !== undefined && 
              r.income !== null && 
              r.income !== undefined && 
              r.income > 0
            );
            
            if (validRecords.length === 0) return 0;
            
            const highSpenders = validRecords.filter(r => {
              const monthlyIncome = r.income_type === 1 ? r.income * 30 : r.income;
              const healthSpendingRatio = (r.health_expense / monthlyIncome) * 100;
              return healthSpendingRatio > 10;
            });
            
            return (highSpenders.length / validRecords.length) * 100;
          },
          label: 'Health Spending >10% Income'
        },
        health_spending_over_25_percent: {
          calculation: (records) => {
            const validRecords = records.filter(r => 
              r.health_expense !== null && 
              r.health_expense !== undefined && 
              r.income !== null && 
              r.income !== undefined && 
              r.income > 0
            );
            
            if (validRecords.length === 0) return 0;
            
            const veryHighSpenders = validRecords.filter(r => {
              const monthlyIncome = r.income_type === 1 ? r.income * 30 : r.income;
              const healthSpendingRatio = (r.health_expense / monthlyIncome) * 100;
              return healthSpendingRatio > 25;
            });
            
            return (veryHighSpenders.length / validRecords.length) * 100;
          },
          label: 'Health Spending >25% Income'
        }
      },

      // Education Domain - Complete set
      education: {
        functional_literacy: { 
          fields: ['speak', 'read', 'write', 'math'],
          condition: (r) => r.speak === 1 && r.read === 1 && r.write === 1 && r.math === 1,
          label: 'Functional Literacy'
        },
        primary_completion: { 
          field: 'education', 
          condition: (val) => val >= 2,
          label: 'Primary Education Completion'
        },
        secondary_completion: { 
          field: 'education', 
          condition: (val) => val >= 4,
          label: 'Secondary Education Completion'
        },
        tertiary_completion: { 
          field: 'education', 
          condition: (val) => val >= 7,
          label: 'Tertiary Education Completion'
        },
        training_participation: { 
          field: 'training', 
          condition: (val) => val === 1,
          label: 'Training Participation'
        }
      },

      // Healthcare Access Domain - UPDATED with new indicators
      healthcare_access: {
        health_coverage: { 
          field: 'welfare', 
          condition: (val) => val !== null && val !== undefined && val !== 'other' && val !== 'Other',
          label: 'Health Coverage'
        },
        medical_consultation_skip_cost: { 
          field: 'medical_skip_1', 
          condition: (val) => val === 1,
          label: 'Skipped Medical Consultation (Cost)'
        },
        medical_treatment_skip_cost: { 
          field: 'medical_skip_2', 
          condition: (val) => val === 1,
          label: 'Skipped Medical Treatment (Cost)'
        },
        prescribed_medicine_skip_cost: { 
          field: 'medical_skip_3', 
          condition: (val) => val === 1,
          label: 'Skipped Medicine Purchase (Cost)'
        },
        dental_access: { 
          field: 'oral_health_access', 
          condition: (val) => val === 1,
          label: 'Dental Access'
        },
        // NEW HEALTHCARE SUPPLY INDICATORS
        doctor_per_population: {
          isSupplyIndicator: true,
          label: 'Doctors per 1,000 Population'
        },
        nurse_per_population: {
          isSupplyIndicator: true,
          label: 'Nurses per 1,000 Population'
        },
        healthworker_per_population: {
          isSupplyIndicator: true,
          label: 'Health Workers per 10,000 Population'
        },
        community_healthworker_per_population: {
          isSupplyIndicator: true,
          label: 'Community Health Workers per 1,000 Community Population'
        },
        health_service_access: {
        isSupplyIndicator: true,
        label: 'Health Facilities per 10,000 Population'
        }
      },

      // Physical Environment Domain - Complete set
      physical_environment: {
        electricity_access: { 
          field: 'community_environment_4', 
          condition: (val) => val !== 1,
          label: 'Electricity Access'
        },
        clean_water_access: { 
          field: 'community_environment_3', 
          condition: (val) => val !== 1,
          label: 'Clean Water Access'
        },
        sanitation_facilities: { 
          field: 'house_sink', 
          condition: (val) => val === 1,
          label: 'Sanitation Facilities'
        },
        waste_management: { 
          field: 'community_environment_5', 
          condition: (val) => val !== 1,
          label: 'Waste Management'
        },
        housing_overcrowding: { 
          fields: ['community_environment_1', 'community_environment_2'],
          condition: (r) => r.community_environment_1 === 1 || r.community_environment_2 === 1,
          label: 'Housing Overcrowding'
        },
        home_ownership: { 
          field: 'house_status', 
          condition: (val) => val === 1,
          label: 'Home Ownership'
        },
        disaster_experience: {
          fields: ['community_disaster_1', 'community_disaster_2', 'community_disaster_3', 'community_disaster_4'],
          condition: (r) => r.community_disaster_1 === 1 || r.community_disaster_2 === 1 || 
                           r.community_disaster_3 === 1 || r.community_disaster_4 === 1,
          label: 'Disaster Experience'
        }
      },

      // Social Context Domain - Complete set
      social_context: {
        community_safety: { 
          field: 'community_safety', 
          calculation: (records) => {
            const safetyResponses = records.filter(r => r.community_safety);
            if (safetyResponses.length === 0) return 0;
            
            return safetyResponses.reduce((sum, r) => {
              if (r.community_safety === '4_1') return sum + 100;
              if (r.community_safety === '3_1') return sum + 75;
              if (r.community_safety === '2') return sum + 50;
              if (r.community_safety === '1') return sum + 25;
              return sum;
            }, 0) / safetyResponses.length;
          },
          label: 'Community Safety'
        },
        violence_physical: { 
          field: 'physical_violence', 
          condition: (val) => val === 1,
          label: 'Physical Violence'
        },
        violence_psychological: { 
          field: 'psychological_violence', 
          condition: (val) => val === 1,
          label: 'Psychological Violence'
        },
        violence_sexual: { 
          field: 'sexual_violence', 
          condition: (val) => val === 1,
          label: 'Sexual Violence'
        },
        discrimination_experience: {
          fields: ['discrimination_1', 'discrimination_2', 'discrimination_3', 'discrimination_4', 'discrimination_5'],
          condition: (r) => r.discrimination_1 === 1 || r.discrimination_2 === 1 || r.discrimination_3 === 1 || 
                           r.discrimination_4 === 1 || r.discrimination_5 === 1,
          label: 'Discrimination Experience'
        },
        social_support: { 
          field: 'helper', 
          condition: (val) => val === 1,
          label: 'Social Support'
        },
        community_murder: { 
          field: 'community_murder', 
          condition: (val) => val === 1,
          label: 'Community Murder'
        }
      },

      // Health Behaviors Domain - Complete set
      health_behaviors: {
        alcohol_consumption: { 
          fields: ['drink_status', 'drink_rate'],
          condition: (r) => r.drink_status === 1 && (r.drink_rate === 1 || r.drink_rate === 2),
          label: 'Alcohol Consumption'
        },
        tobacco_use: { 
          field: 'smoke_status', 
          condition: (val) => val === 2 || val === 3,
          ageFilter: (age) => age >= 15,
          label: 'Tobacco Use'
        },
        physical_activity: { 
          field: 'exercise_status', 
          condition: (val) => val >= 2,
          label: 'Physical Activity'
        },
        obesity: {
          calculation: (records) => {
            const validBMI = records.filter(r => r.height > 0 && r.weight > 0);
            if (validBMI.length === 0) return 0;
            
            const obese = validBMI.filter(r => {
              const bmi = r.weight / Math.pow(r.height / 100, 2);
              return bmi >= 30;
            });
            
            return (obese.length / validBMI.length) * 100;
          },
          label: 'Obesity'
        }
      },

      // Health Outcomes Domain - Complete set (diseases)
      health_outcomes: {
        // Overall chronic disease burden
        any_chronic_disease: {
          field: 'diseases_status',
          condition: (val) => val === 1,
          label: 'Any Chronic Disease'
        },
        
        // Individual disease prevalence
        diabetes: {
          fields: ['diseases_status', 'diseases_type/1'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/1'] === 1,
          label: 'เบาหวาน (Diabetes)'
        },
        hypertension: {
          fields: ['diseases_status', 'diseases_type/2'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/2'] === 1,
          label: 'ความดันโลหิตสูง (Hypertension)'
        },
        gout: {
          fields: ['diseases_status', 'diseases_type/3'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/3'] === 1,
          label: 'โรคเกาต์ (Gout)'
        },
        chronic_kidney_disease: {
          fields: ['diseases_status', 'diseases_type/4'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/4'] === 1,
          label: 'ไตวายเรื้อรัง (Chronic Kidney Disease)'
        },
        cancer: {
          fields: ['diseases_status', 'diseases_type/5'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/5'] === 1,
          label: 'มะเร็ง (Cancer)'
        },
        high_cholesterol: {
          fields: ['diseases_status', 'diseases_type/6'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/6'] === 1,
          label: 'ไขมันในเลือดสูง (High Cholesterol)'
        },
        ischemic_heart_disease: {
          fields: ['diseases_status', 'diseases_type/7'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/7'] === 1,
          label: 'กล้ามเนื้อหัวใจขาดเลือด (Ischemic Heart Disease)'
        },
        liver_disease: {
          fields: ['diseases_status', 'diseases_type/8'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/8'] === 1,
          label: 'โรคตับ (Liver Disease)'
        },
        stroke: {
          fields: ['diseases_status', 'diseases_type/9'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/9'] === 1,
          label: 'หลอดเลือดสมอง (Stroke)'
        },
        hiv: {
          fields: ['diseases_status', 'diseases_type/10'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/10'] === 1,
          label: 'เอชไอวี (HIV)'
        },
        mental_health: {
          fields: ['diseases_status', 'diseases_type/11'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/11'] === 1,
          label: 'โรคทางจิตเวช (Mental Health Disorders)'
        },
        allergies: {
          fields: ['diseases_status', 'diseases_type/12'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/12'] === 1,
          label: 'ภูมิแพ้ (Allergies)'
        },
        bone_joint_disease: {
          fields: ['diseases_status', 'diseases_type/13'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/13'] === 1,
          label: 'โรคกระดูกและข้อ (Bone and Joint Disease)'
        },
        respiratory_disease: {
          fields: ['diseases_status', 'diseases_type/14'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/14'] === 1,
          label: 'โรคระบบทางเดินหายใจ (Respiratory Disease)'
        },
        emphysema: {
          fields: ['diseases_status', 'diseases_type/15'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/15'] === 1,
          label: 'ถุงลมโป่งพอง (Emphysema)'
        },
        anemia: {
          fields: ['diseases_status', 'diseases_type/16'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/16'] === 1,
          label: 'โลหิตจาง (Anemia)'
        },
        stomach_ulcer: {
          fields: ['diseases_status', 'diseases_type/17'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/17'] === 1,
          label: 'กระเพาะอาหาร (Stomach Ulcer)'
        },
        epilepsy: {
          fields: ['diseases_status', 'diseases_type/18'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/18'] === 1,
          label: 'ลมชัก (Epilepsy)'
        },
        intestinal_disease: {
          fields: ['diseases_status', 'diseases_type/19'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/19'] === 1,
          label: 'ลำไส้ (Intestinal Disease)'
        },
        paralysis: {
          fields: ['diseases_status', 'diseases_type/20'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/20'] === 1,
          label: 'อัมพาต (Paralysis)'
        },
        dementia: {
          fields: ['diseases_status', 'diseases_type/21'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/21'] === 1,
          label: 'อัมพฤกษ์ (Dementia)'
        },

        // Disease burden calculations
        cardiovascular_diseases: {
          calculation: (records) => {
            const diseaseRecords = records.filter(r => r.diseases_status === 1);
            if (diseaseRecords.length === 0) return 0;
            
            const cvdCases = diseaseRecords.filter(r => 
              r['diseases_type/2'] === 1 || // Hypertension
              r['diseases_type/6'] === 1 || // High cholesterol
              r['diseases_type/7'] === 1 || // Ischemic heart disease
              r['diseases_type/9'] === 1    // Stroke
            );
            
            return (cvdCases.length / records.length) * 100;
          },
          label: 'Cardiovascular Disease Burden'
        },
        
        metabolic_diseases: {
          calculation: (records) => {
            const diseaseRecords = records.filter(r => r.diseases_status === 1);
            if (diseaseRecords.length === 0) return 0;
            
            const metabolicCases = diseaseRecords.filter(r => 
              r['diseases_type/1'] === 1 || // Diabetes
              r['diseases_type/3'] === 1 || // Gout
              r['diseases_type/6'] === 1    // High cholesterol
            );
            
            return (metabolicCases.length / records.length) * 100;
          },
          label: 'Metabolic Disease Burden'
        },

        multiple_chronic_conditions: {
          calculation: (records) => {
            const diseaseRecords = records.filter(r => r.diseases_status === 1);
            if (diseaseRecords.length === 0) return 0;
            
            const multipleCCCases = diseaseRecords.filter(r => {
              const diseaseCount = Object.keys(r)
                .filter(key => key.startsWith('diseases_type/') && 
                              key !== 'diseases_type/other' && 
                              r[key] === 1)
                .length;
              return diseaseCount >= 2;
            });
            
            return (multipleCCCases.length / records.length) * 100;
          },
          label: 'Multiple Chronic Conditions (2+)'
        }
      }
    };
  }

  async loadSurveyData(csvContent) {
    const parsed = Papa.parse(csvContent, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true
    });

    this.surveyData = parsed.data.map(record => ({
      ...record,
      district_name: this.districtCodeMap[record.dname] || `District_${record.dname}`,
      population_group: this.classifyPopulationGroup(record)
    }));

    return this.surveyData;
  }

  classifyPopulationGroup(record) {
    if (record.sex === 'lgbt') return 'lgbtq';
    if (record.age >= 60) return 'elderly';  
    if (record.disable_status === 1) return 'disabled';
    if (record.occupation_status === 1 && record.occupation_contract === 0) return 'informal_workers';
    return 'general_population';
  }

  // Calculate indicators for a specific set of records
  calculateIndicatorsForRecords(records, domain, districtName = null) {
    const domainMapping = this.indicatorMappings[domain];
    const results = { sample_size: records.length };

    // Define reverse indicators (diseases and problems are bad when high)
    const reverseIndicators = {
      unemployment_rate: true,
      vulnerable_employment: true,
      food_insecurity_moderate: true,
      food_insecurity_severe: true,
      work_injury_fatal: true,
      work_injury_non_fatal: true,
      catastrophic_health_spending_household: true,
      health_spending_over_10_percent: true,
      health_spending_over_25_percent: true,
      medical_consultation_skip_cost: true,
      medical_treatment_skip_cost: true,
      prescribed_medicine_skip_cost: true,
      housing_overcrowding: true,
      disaster_experience: true,
      violence_physical: true,
      violence_psychological: true,
      violence_sexual: true,
      discrimination_experience: true,
      community_murder: true,
      alcohol_consumption: true,
      tobacco_use: true,
      obesity: true,
      // All health outcomes are reverse (diseases are bad)
      any_chronic_disease: true,
      diabetes: true,
      hypertension: true,
      gout: true,
      chronic_kidney_disease: true,
      cancer: true,
      high_cholesterol: true,
      ischemic_heart_disease: true,
      liver_disease: true,
      stroke: true,
      hiv: true,
      mental_health: true,
      allergies: true,
      bone_joint_disease: true,
      respiratory_disease: true,
      emphysema: true,
      anemia: true,
      stomach_ulcer: true,
      epilepsy: true,
      intestinal_disease: true,
      paralysis: true,
      dementia: true,
      cardiovascular_diseases: true,
      metabolic_diseases: true,
      multiple_chronic_conditions: true
      // Healthcare supply indicators are NOT reverse (higher is better)
    };

    Object.keys(domainMapping).forEach(indicator => {
      const mapping = domainMapping[indicator];
      
      // Handle healthcare supply indicators
if (mapping.isSupplyIndicator && districtName) {
  // Get district code from district name
  const districtCode = Object.keys(this.districtCodeMap).find(
    code => this.districtCodeMap[code] === districtName
  );
  
  if (districtCode) {
    let supplyData;
    
     // Handle NEW health service access indicator (uses health_facilities.csv)
    if (indicator === 'health_service_access') {
      supplyData = { 
        [indicator]: this.calculateHealthServiceAccess(parseInt(districtCode), districtName) 
      };
    } 
      else {
      supplyData = this.calculateHealthcareSupplyIndicators(
        parseInt(districtCode), 
        districtName
      );
    }
    
    if (supplyData[indicator]) {
      results[indicator] = {
        value: supplyData[indicator].value,
        label: mapping.label,
        sample_size: supplyData[indicator].sample_size,
        population: supplyData[indicator].population,
        absolute_count: supplyData[indicator].absolute_count
      };
    }
  } else {
        // For Bangkok Overall, calculate average across all districts
        if (districtName === 'Bangkok Overall') {
          const allDistrictCodes = Object.keys(this.districtCodeMap).map(code => parseInt(code));
          let totalPopulation = 0;
          let totalAbsoluteCount = 0;
          let validDistricts = 0;
          
          allDistrictCodes.forEach(dcode => {
            const dname = this.districtCodeMap[dcode];
            let supplyData;
            
            if (indicator === 'health_service_access') {
              supplyData = { 
                [indicator]: this.calculateHealthServiceAccess(dcode, dname) 
              };
            } else {
              supplyData = this.calculateHealthcareSupplyIndicators(dcode, dname);
            }
            
            if (supplyData[indicator] && supplyData[indicator].population > 0) {
              totalPopulation += supplyData[indicator].population;
              totalAbsoluteCount += supplyData[indicator].absolute_count;
              validDistricts++;
            }
          });
          
          if (totalPopulation > 0) {
            // Calculate overall rate for Bangkok
            let overallRate = 0;
            if (indicator === 'healthworker_per_population') {
              overallRate = (totalAbsoluteCount / totalPopulation) * 10000;
            } else if (indicator === 'health_service_access') {
              overallRate = (totalAbsoluteCount / totalPopulation) * 10000;
            } else {
              overallRate = (totalAbsoluteCount / totalPopulation) * 1000;
            }
            
            results[indicator] = {
              value: parseFloat(overallRate.toFixed(2)),
              label: mapping.label,
              sample_size: validDistricts,
              population: totalPopulation,
              absolute_count: totalAbsoluteCount
            };
          } else {
            results[indicator] = {
              value: 0,
              label: mapping.label,
              sample_size: 0,
              population: 0,
              absolute_count: 0
            };
          }
        }
      }
    }
      else if (mapping.calculation) {
        // Custom calculation function
        const calculatedValue = mapping.calculation(records);
        results[indicator] = {
          value: parseFloat(calculatedValue.toFixed(2)),
          label: mapping.label,
          sample_size: records.length
        };
        
        // Track sample size for financial indicators that filter out null income
        if (indicator.includes('health_spending') || indicator.includes('catastrophic')) {
          const validRecords = records.filter(r => 
            r.income !== null && 
            r.income !== undefined && 
            r.income > 0 &&
            ((indicator.includes('household') && r.hh_health_expense !== null) ||
             (!indicator.includes('household') && r.health_expense !== null))
          );
          results[indicator].sample_size = validRecords.length;
        }
      } else if (mapping.condition) {
        // Standard condition-based calculation
        let filteredRecords = records;
        
        // Apply age filter if specified
        if (mapping.ageFilter) {
          filteredRecords = records.filter(r => mapping.ageFilter(r.age));
        }
        
        const meetCondition = filteredRecords.filter(record => {
          if (mapping.fields) {
            return mapping.condition(record);
          } else {
            return mapping.condition(record[mapping.field]);
          }
        }).length;
        
        const rate = filteredRecords.length > 0 ? 
          (meetCondition / filteredRecords.length) * 100 : 0;
        
        results[indicator] = {
          value: parseFloat(rate.toFixed(2)),
          label: mapping.label,
          sample_size: mapping.ageFilter ? filteredRecords.length : records.length
        };
      }
    });

      const indicators = Object.keys(domainMapping);
      const goodnessScores = indicators.map(indicator => {
        const rawValue = results[indicator].value;
        
        // Handle healthcare supply indicators with normalized scoring
        const healthcareSupplyIndicators = [
          'doctor_per_population', 
          'nurse_per_population', 
          'healthworker_per_population', 
          'community_healthworker_per_population',
          'health_service_access'
        ];
        
        if (healthcareSupplyIndicators.includes(indicator)) {
          // Convert healthcare supply indicators to 0-100 scale using WHO benchmarks
          const benchmarks = {
            doctor_per_population: { excellent: 2.5, good: 1.0, poor: 0.5 },
            nurse_per_population: { excellent: 8.0, good: 3.0, poor: 1.5 },
            healthworker_per_population: { excellent: 40, good: 20, poor: 10 },
            community_healthworker_per_population: { excellent: 5.0, good: 2.0, poor: 1.0 },
            health_service_access: { excellent: 50, good: 20, poor: 10 }
          };
          
          const benchmark = benchmarks[indicator];
          if (!benchmark) return 50; // Default middle score
          
          // Convert to 0-100 scale
          if (rawValue >= benchmark.excellent) return 100;
          if (rawValue >= benchmark.good) {
            // Linear interpolation between good and excellent
            const ratio = (rawValue - benchmark.good) / (benchmark.excellent - benchmark.good);
            return 75 + (25 * ratio);
          }
          if (rawValue >= benchmark.poor) {
            // Linear interpolation between poor and good
            const ratio = (rawValue - benchmark.poor) / (benchmark.good - benchmark.poor);
            return 25 + (50 * ratio);
          }
          // Below poor threshold
          const ratio = Math.min(1, rawValue / benchmark.poor);
          return 25 * ratio;
        }
        
        // Handle regular indicators
        if (reverseIndicators[indicator]) {
          // Convert reverse indicator to "goodness score" (0% bad becomes 100% good)
          return 100 - rawValue;
        } else {
          // Normal indicator - higher is better
          return rawValue;
        }
      });

      const domainScore = goodnessScores.reduce((sum, score) => sum + score, 0) / goodnessScores.length;

      results['_domain_score'] = {
        value: parseFloat(domainScore.toFixed(1)),
        label: `${domain.replace('_', ' ')} Score`,
        sample_size: records.length
      };

    return results;
  }

  calculateIndicators() {
    const results = {};
    const domains = Object.keys(this.indicatorMappings);
    const populationGroups = ['informal_workers', 'elderly', 'disabled', 'lgbtq'];
    const districts = [...new Set(this.surveyData.map(r => r.district_name))];

    // Initialize results structure for districts
    domains.forEach(domain => {
      results[domain] = {};
      
      // Initialize Bangkok Overall
      results[domain]['Bangkok Overall'] = {};
      populationGroups.forEach(group => {
        results[domain]['Bangkok Overall'][group] = {};
      });
      
      // Initialize individual districts
      districts.forEach(district => {
        results[domain][district] = {};
        populationGroups.forEach(group => {
          results[domain][district][group] = {};
        });
      });
    });

    // Calculate indicators for each combination
    domains.forEach(domain => {
      // Calculate Bangkok Overall first (using all data)
      populationGroups.forEach(group => {
        const allRecords = this.surveyData.filter(r => r.population_group === group);
        if (allRecords.length > 0) {
          results[domain]['Bangkok Overall'][group] = this.calculateIndicatorsForRecords(
            allRecords, 
            domain, 
            'Bangkok Overall'
          );
        }
      });
      
      // Calculate individual districts
      districts.forEach(district => {
        populationGroups.forEach(group => {
          const records = this.surveyData.filter(r => 
            r.district_name === district && r.population_group === group
          );

          if (records.length > 0) {
            results[domain][district][group] = this.calculateIndicatorsForRecords(
              records, 
              domain, 
              district
            );
          }
        });
      });
    });

    this.sdheResults = results;
    return results;
  }

  getAvailableDistricts() {
    // Add Bangkok Overall as the first option
    const districts = [...new Set(this.surveyData.map(r => r.district_name))].sort();
    return ['Bangkok Overall', ...districts];
  }

  getAvailableDomains() {
    return Object.keys(this.indicatorMappings);
  }

  getIndicatorData(domain, district, populationGroup) {
    if (!this.sdheResults[domain] || !this.sdheResults[domain][district] || !this.sdheResults[domain][district][populationGroup]) {
      return [];
    }

    const data = this.sdheResults[domain][district][populationGroup];
    return Object.keys(data).map(indicator => ({
      indicator,
      value: data[indicator].value,
      label: data[indicator].label,
      sample_size: data[indicator].sample_size,
      population: data[indicator].population || null,
      absolute_count: data[indicator].absolute_count || null,
      isDomainScore: indicator === '_domain_score'
    }));
  }

  // Get summary statistics for Bangkok Overall
  getBangkokOverallSummary() {
    const summary = {
      total_responses: this.surveyData.length,
      population_groups: {},
      districts_covered: [...new Set(this.surveyData.map(r => r.district_name))].length
    };

    // Population group breakdown for Bangkok Overall
    const populationGroups = ['informal_workers', 'elderly', 'disabled', 'lgbtq'];
    populationGroups.forEach(group => {
      const groupRecords = this.surveyData.filter(r => r.population_group === group);
      summary.population_groups[group] = {
        count: groupRecords.length,
        percentage: ((groupRecords.length / this.surveyData.length) * 100).toFixed(1)
      };
    });

    return summary;
  }

  async processSurveyData(csvContent) {
    try {
      // Load survey data first
      await this.loadSurveyData(csvContent);
      console.log(`✅ Processed ${this.surveyData.length} survey responses`);
      
      // Load healthcare supply data
      await this.loadHealthcareSupplyData();
      
      // Calculate all indicators
      const results = this.calculateIndicators();
      
      console.log(`📊 Districts: ${this.getAvailableDistricts().length} (including Bangkok Overall)`);
      console.log(`🎯 Domains: ${this.getAvailableDomains().length} (including Health Outcomes + Healthcare Supply)`);
      
      // Log Bangkok Overall sample sizes
      const bangkokSummary = this.getBangkokOverallSummary();
      console.log(`🏙️ Bangkok Overall sample sizes:`, bangkokSummary.population_groups);
      
      // Log healthcare supply data availability
      console.log(`🏥 Healthcare supply data loaded: ${this.healthSupplyData.length} facilities`);
      console.log(`👥 Population data loaded: ${this.districtPopulationData.length} records`);
      console.log(`🏥 Community health workers: ${this.communityHealthWorkerData.length} districts`);
      console.log(`🏘️ Community population: ${this.communityPopulationData.length} communities`);
      
      return {
        results,
        processor: this
      };
      
    } catch (error) {
      console.error('❌ Error processing survey data:', error);
      throw error;
    }
  }
}

export default BasicSDHEProcessor;