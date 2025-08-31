// Updated Basic SDHE Data Processor with Healthcare Supply Indicators - src/utils/BasicSDHEProcessor.js
// UPDATED: Added minimum sample size requirement of 5 respondents per district
import Papa from 'papaparse';
import _ from 'lodash';

class DataProcessor {
  constructor() {
    this.surveyData = [];
    this.healthSupplyData = [];
    this.healthFacilitiesData = [];
    this.districtPopulationData = [];
    this.communityHealthWorkerData = [];
    this.communityPopulationData = [];
    this.normalPopulationData = [];
    this.normalPopulationDistrictData = [];
    this.sdheResults = {};
    this.districtCodeMap = this.createDistrictCodeMap();
    this.indicatorMappings = this.createIndicatorMappings();
    this.MINIMUM_SAMPLE_SIZE = 5; // Minimum sample size requirement
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

  async loadNormalPopulationDistrictData() {
    try {
      const normalPopDistrictResponse = await fetch('/data/normal_population_indicator_district.csv');
      if (!normalPopDistrictResponse.ok) {
        throw new Error('Could not load normal_population_indicator_district.csv');
      }
      
      const normalPopDistrictCsv = await normalPopDistrictResponse.text();
      const normalPopDistrictParsed = Papa.parse(normalPopDistrictCsv, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      
      this.normalPopulationDistrictData = normalPopDistrictParsed.data;
      
      this.normalPopulationDistrictLookup = {};
      this.normalPopulationDistrictData.forEach(row => {
        if (row.indicator && row.dcode) {
          const key = `${row.dcode}_${row.indicator}`;
          this.normalPopulationDistrictLookup[key] = row.score;
        }
      });
      
    } catch (error) {
      this.normalPopulationDistrictData = [];
      this.normalPopulationDistrictLookup = {};
    }
  }

  async loadNormalPopulationData() {
    try {
      const normalPopResponse = await fetch('/data/normal_population_indicator.csv');
      if (!normalPopResponse.ok) {
        throw new Error('Could not load normal_population_indicator.csv');
      }
      
      const normalPopCsv = await normalPopResponse.text();
      const normalPopParsed = Papa.parse(normalPopCsv, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true
      });
      
      this.normalPopulationData = normalPopParsed.data;
      
      this.normalPopulationLookup = {};
      this.normalPopulationData.forEach(row => {
        if (row.indicator) {
          this.normalPopulationLookup[row.indicator] = row.score;
        }
      });
      
      await this.loadNormalPopulationDistrictData();
      
    } catch (error) {
      this.normalPopulationData = [];
      this.normalPopulationLookup = {};
    }
  }

  async loadHealthcareSupplyData() {
    try {
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

      await this.loadNormalPopulationData();

    } catch (error) {
      throw error;
    }
  }

  calculateHealthcareSupplyIndicators(districtCode, districtName) {
    const results = {};

    try {
      const districtPopulation = this.districtPopulationData
        .filter(record => record.dcode === districtCode)
        .reduce((sum, record) => sum + (record.population || 0), 0);

      if (districtPopulation === 0) {
        return {
          doctor_per_population: { value: 0, sample_size: 0 },
          nurse_per_population: { value: 0, sample_size: 0 },
          healthworker_per_population: { value: 0, sample_size: 0 },
          community_healthworker_per_population: { value: 0, sample_size: 0 },
          bed_per_population: { value: 0, sample_size: 0 }
        };
      }

      const districtHealthFacilities = this.healthSupplyData.filter(facility => 
        facility.dcode === districtCode
      );

      const totalDoctors = districtHealthFacilities.reduce((sum, facility) => 
        sum + (facility.doctor_count || 0), 0);
      const totalNurses = districtHealthFacilities.reduce((sum, facility) => 
        sum + (facility.nurse_count || 0), 0);
      const totalHealthWorkers = districtHealthFacilities.reduce((sum, facility) => 
        sum + (facility.healthworker_count || 0), 0);
      const totalBeds = districtHealthFacilities.reduce((sum, facility) => 
        sum + (facility.bed_count || 0), 0);

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

      results.healthworker_per_population = {
        value: parseFloat(((totalHealthWorkers / districtPopulation) * 10000).toFixed(2)),
        sample_size: districtHealthFacilities.length,
        population: districtPopulation,
        absolute_count: totalHealthWorkers
      };

      results.bed_per_population = {
        value: parseFloat(((totalBeds / districtPopulation) * 10000).toFixed(2)),
        sample_size: districtHealthFacilities.length,
        population: districtPopulation,
        absolute_count: totalBeds
      };

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
      return {
        doctor_per_population: { value: 0, sample_size: 0 },
        nurse_per_population: { value: 0, sample_size: 0 },
        healthworker_per_population: { value: 0, sample_size: 0 },
        community_healthworker_per_population: { value: 0, sample_size: 0 },
        bed_per_population: { value: 0, sample_size: 0 }
      };
    }

    return results;
  }

  calculateHealthServiceAccess(districtCode, districtName) {
    try {
      const districtPopulation = this.districtPopulationData
        .filter(record => record.dcode === districtCode)
        .reduce((sum, record) => sum + (record.population || 0), 0);

      if (districtPopulation === 0) {
        return { value: 0, sample_size: 0, population: 0, absolute_count: 0 };
      }

      const districtHealthFacilities = this.healthFacilitiesData.filter(facility => 
        facility.dcode === districtCode
      );

      const facilitiesPer10k = parseFloat(((districtHealthFacilities.length / districtPopulation) * 10000).toFixed(2));

      return {
        value: facilitiesPer10k,
        sample_size: districtHealthFacilities.length,
        population: districtPopulation,
        absolute_count: districtHealthFacilities.length
      };

    } catch (error) {
      return { value: 0, sample_size: 0, population: 0, absolute_count: 0 };
    }
  }

  getDistrictSpecificPreCalculatedValue(indicator, districtName) {
    const healthBehaviorsIndicators = ['alcohol_consumption', 'tobacco_use', 'physical_activity', 'obesity'];
    
    if (!healthBehaviorsIndicators.includes(indicator)) {
      return null;
    }

    const districtCode = Object.keys(this.districtCodeMap).find(
      code => this.districtCodeMap[code] === districtName
    );

    if (!districtCode || !this.normalPopulationDistrictLookup) {
      return null;
    }

    const key = `${districtCode}_${indicator}`;
    return this.normalPopulationDistrictLookup[key] || null;
  }

  createIndicatorMappings() {
    return {
      economic_security: {
        unemployment_rate: { 
          field: 'occupation_status', 
          condition: (val) => val === 0
        },
        employment_rate: { 
          field: 'occupation_status', 
          condition: (val) => val === 1
        },
        vulnerable_employment: { 
          fields: ['occupation_status', 'occupation_contract'], 
          condition: (r) => r.occupation_status === 1 && r.occupation_contract === 0
        },
        food_insecurity_moderate: { 
          field: 'food_insecurity_1', 
          condition: (val) => val === 1
        },
        food_insecurity_severe: { 
          field: 'food_insecurity_2', 
          condition: (val) => val === 1
        },
        work_injury_fatal: { 
          field: 'occupation_injury', 
          condition: (val) => val === 1
        },
        work_injury_non_fatal: { 
          field: 'occupation_small_injury', 
          condition: (val) => val === 1
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
          }
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
          }
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
          }
        }
      },

      education: {
        functional_literacy: { 
          fields: ['speak', 'read', 'write', 'math'],
          condition: (r) => r.speak === 1 && r.read === 1 && r.write === 1 && r.math === 1
        },
        primary_completion: { 
          field: 'education', 
          condition: (val) => val >= 2
        },
        secondary_completion: { 
          field: 'education', 
          condition: (val) => val >= 4
        },
        tertiary_completion: { 
          field: 'education', 
          condition: (val) => val >= 7
        },
        training_participation: { 
          field: 'training', 
          condition: (val) => val === 1
        }
      },

      healthcare_access: {
        health_coverage: { 
          field: 'welfare', 
          condition: (val) => val !== null && val !== undefined && val !== 'other' && val !== 'Other'
        },
        medical_consultation_skip_cost: { 
          field: 'medical_skip_1', 
          condition: (val) => val === 1
        },
        medical_treatment_skip_cost: { 
          field: 'medical_skip_2', 
          condition: (val) => val === 1
        },
        prescribed_medicine_skip_cost: { 
          field: 'medical_skip_3', 
          condition: (val) => val === 1
        },
        dental_access: {
          fields: ['oral_health', 'oral_health_access'],
          condition: (r) => r.oral_health === 1 && r.oral_health_access === 1
        },
        doctor_per_population: {
          isSupplyIndicator: true
        },
        nurse_per_population: {
          isSupplyIndicator: true
        },
        healthworker_per_population: {
          isSupplyIndicator: true
        },
        community_healthworker_per_population: {
          isSupplyIndicator: true
        },
        health_service_access: {
          isSupplyIndicator: true
        },
        bed_per_population: {
          isSupplyIndicator: true
        }
      },

      physical_environment: {
        electricity_access: { 
          field: 'community_environment_4', 
          condition: (val) => val !== 1
        },
        clean_water_access: { 
          field: 'community_environment_3', 
          condition: (val) => val !== 1
        },
        sanitation_facilities: { 
          field: 'house_sink', 
          condition: (val) => val === 1
        },
        waste_management: { 
          field: 'community_environment_5', 
          condition: (val) => val !== 1
        },
        housing_overcrowding: { 
          fields: ['community_environment_1', 'community_environment_2'],
          condition: (r) => r.community_environment_1 === 1 || r.community_environment_2 === 1
        },
        home_ownership: { 
          field: 'house_status', 
          condition: (val) => val === 1
        },
        disaster_experience: {
          fields: ['community_disaster_1', 'community_disaster_2', 'community_disaster_3', 'community_disaster_4'],
          condition: (r) => r.community_disaster_1 === 1 || r.community_disaster_2 === 1 || 
                           r.community_disaster_3 === 1 || r.community_disaster_4 === 1
        }
      },

      social_context: {
        community_safety: { 
          field: 'community_safety', 
          calculation: (records) => {
            const safetyResponses = records.filter(r => 
              r.community_safety !== null && 
              r.community_safety !== undefined && 
              r.community_safety !== '' &&
              (r.community_safety === 1 || r.community_safety === 2 || 
              r.community_safety === 3 || r.community_safety === 4)
            );
            
            if (safetyResponses.length === 0) return 0;
            
            const totalScore = safetyResponses.reduce((sum, r) => {
              const safetyValue = r.community_safety;
              
              if (safetyValue === 4) return sum + 100;
              if (safetyValue === 3) return sum + 75;
              if (safetyValue === 2) return sum + 50;
              if (safetyValue === 1) return sum + 25;
              
              return sum;
            }, 0);
            
            const averageScore = totalScore / safetyResponses.length;
            return averageScore;
          }
        },
        violence_physical: { 
          field: 'physical_violence', 
          condition: (val) => val === 1
        },
        violence_psychological: { 
          field: 'psychological_violence', 
          condition: (val) => val === 1
        },
        violence_sexual: { 
          field: 'sexual_violence', 
          condition: (val) => val === 1
        },
        discrimination_experience: {
          fields: ['discrimination_1', 'discrimination_2', 'discrimination_3', 'discrimination_4', 'discrimination_5'],
          condition: (r) => r.discrimination_1 === 1 || r.discrimination_2 === 1 || r.discrimination_3 === 1 || 
                           r.discrimination_4 === 1 || r.discrimination_5 === 1
        },
        social_support: { 
          field: 'helper', 
          condition: (val) => val === 1
        },
        community_murder: { 
          field: 'community_murder', 
          condition: (val) => val === 1
        }
      },

      health_behaviors: {
        alcohol_consumption: { 
          fields: ['drink_status', 'drink_rate'],
          condition: (r) => r.drink_status === 1 && (r.drink_rate === 1 || r.drink_rate === 2)
        },
        tobacco_use: { 
          field: 'smoke_status', 
          condition: (val) => val === 2 || val === 3,
          ageFilter: (age) => age >= 15
        },
        physical_activity: { 
          field: 'exercise_status', 
          condition: (val) => val >= 2
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
          }
        }
      },

      health_outcomes: {
        any_chronic_disease: {
          field: 'diseases_status',
          condition: (val) => val === 1
        },
        
        diabetes: {
          fields: ['diseases_status', 'diseases_type/1'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/1'] === 1
        },
        hypertension: {
          fields: ['diseases_status', 'diseases_type/2'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/2'] === 1
        },
        gout: {
          fields: ['diseases_status', 'diseases_type/3'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/3'] === 1
        },
        chronic_kidney_disease: {
          fields: ['diseases_status', 'diseases_type/4'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/4'] === 1
        },
        cancer: {
          fields: ['diseases_status', 'diseases_type/5'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/5'] === 1
        },
        high_cholesterol: {
          fields: ['diseases_status', 'diseases_type/6'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/6'] === 1
        },
        ischemic_heart_disease: {
          fields: ['diseases_status', 'diseases_type/7'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/7'] === 1
        },
        liver_disease: {
          fields: ['diseases_status', 'diseases_type/8'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/8'] === 1
        },
        stroke: {
          fields: ['diseases_status', 'diseases_type/9'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/9'] === 1
        },
        hiv: {
          fields: ['diseases_status', 'diseases_type/10'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/10'] === 1
        },
        mental_health: {
          fields: ['diseases_status', 'diseases_type/11'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/11'] === 1
        },
        allergies: {
          fields: ['diseases_status', 'diseases_type/12'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/12'] === 1
        },
        bone_joint_disease: {
          fields: ['diseases_status', 'diseases_type/13'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/13'] === 1
        },
        respiratory_disease: {
          fields: ['diseases_status', 'diseases_type/14'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/14'] === 1
        },
        emphysema: {
          fields: ['diseases_status', 'diseases_type/15'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/15'] === 1
        },
        anemia: {
          fields: ['diseases_status', 'diseases_type/16'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/16'] === 1
        },
        stomach_ulcer: {
          fields: ['diseases_status', 'diseases_type/17'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/17'] === 1
        },
        epilepsy: {
          fields: ['diseases_status', 'diseases_type/18'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/18'] === 1
        },
        intestinal_disease: {
          fields: ['diseases_status', 'diseases_type/19'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/19'] === 1
        },
        paralysis: {
          fields: ['diseases_status', 'diseases_type/20'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/20'] === 1
        },
        dementia: {
          fields: ['diseases_status', 'diseases_type/21'],
          condition: (r) => r.diseases_status === 1 && r['diseases_type/21'] === 1
        },

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
          }
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
          }
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
          }
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
    return 'normal_population';
  }

  calculateIndicatorsForRecords(records, domain, districtName = null, populationGroup = null) {
    const domainMapping = this.indicatorMappings[domain];
    const results = {};

    const hasMinimumSample = records.length >= this.MINIMUM_SAMPLE_SIZE;

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
      
      // Handle healthcare supply indicators (these work the same for all population groups)
      if (mapping.isSupplyIndicator && districtName) {
        // Get district code from district name
        const districtCode = Object.keys(this.districtCodeMap).find(
          code => this.districtCodeMap[code] === districtName
        );
        
        if (districtCode) {
          let supplyData;
          
          // Handle health service access indicator (uses health_facilities.csv)
          if (indicator === 'health_service_access') {
            supplyData = { 
              [indicator]: this.calculateHealthServiceAccess(parseInt(districtCode), districtName) 
            };
          } 
          // Handle healthcare worker indicators (uses health_supply.csv)
          else {
            supplyData = this.calculateHealthcareSupplyIndicators(
              parseInt(districtCode), 
              districtName
            );
          }
          
          if (supplyData[indicator]) {
            results[indicator] = {
              value: supplyData[indicator].value,
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
              } else if (indicator === 'bed_per_population') {
                overallRate = (totalAbsoluteCount / totalPopulation) * 10000;
              } else {
                overallRate = (totalAbsoluteCount / totalPopulation) * 1000;
              }
              
              results[indicator] = {
                value: parseFloat(overallRate.toFixed(2)),
                sample_size: validDistricts,
                population: totalPopulation,
                absolute_count: totalAbsoluteCount
              };
            } else {
              results[indicator] = {
                value: 0,
                sample_size: 0,
                population: 0,
                absolute_count: 0
              };
            }
          }
        }
      }
      // ENHANCED COMBINED CALCULATION FOR NORMAL POPULATION (ALL DISTRICTS)
      else if (populationGroup === 'normal_population') {
        let finalValue = null;
        let finalSampleSize = records.length;
        let isPreCalculated = false;
        let isCombined = false;
        let combinationMethod = '';
        
        const hasSurveyData = records.length > 0;
        
        // Check for district-specific pre-calculated data for health behaviors
        const districtSpecificValue = this.getDistrictSpecificPreCalculatedValue(indicator, districtName);
        const hasDistrictSpecificData = districtSpecificValue !== null && districtSpecificValue !== undefined;
        
        // Check for Bangkok-wide pre-calculated data
        const bangkokWideValue = this.normalPopulationLookup && 
                                this.normalPopulationLookup[indicator] !== undefined ?
                                parseFloat(this.normalPopulationLookup[indicator]) : null;
        const hasBangkokWideData = bangkokWideValue !== null && !isNaN(bangkokWideValue);

        // Calculate survey-based value if we have survey data AND minimum sample size
        let surveyValue = null;
        let surveySampleSize = 0;
        
        if (hasSurveyData && hasMinimumSample) {
          if (mapping.calculation) {
            surveyValue = mapping.calculation(records);
            surveySampleSize = records.length;
          } else if (mapping.condition) {
            let filteredRecords = records;
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
            
            surveyValue = filteredRecords.length > 0 ? 
              (meetCondition / filteredRecords.length) * 100 : null;
            surveySampleSize = filteredRecords.length;
          }
        }
        
        // UPDATED COMBINATION LOGIC: Prioritize district-specific data for health behaviors
        if (hasDistrictSpecificData) {
          // Use district-specific data for health behaviors indicators
          if (surveyValue !== null && !isNaN(surveyValue)) {
            // Both survey and district-specific data available - combine them
            const isSmallSample = surveySampleSize < 20;
            const isLowSurveyValue = surveyValue < 10;
            const isHighVariance = Math.abs(surveyValue - districtSpecificValue) > 20;
            
            if (isSmallSample && isLowSurveyValue) {
              finalValue = (surveyValue * 0.3) + (districtSpecificValue * 0.7);
              combinationMethod = 'small_sample_fallback';
            } else if (isSmallSample) {
              finalValue = (surveyValue * 0.4) + (districtSpecificValue * 0.6);
              combinationMethod = 'small_sample_balanced';
            } else if (isHighVariance) {
              finalValue = (surveyValue * 0.6) + (districtSpecificValue * 0.4);
              combinationMethod = 'high_variance';
            } else {
              finalValue = (surveyValue * 0.7) + (districtSpecificValue * 0.3);
              combinationMethod = 'normal_combination';
            }
            
            isCombined = true;
            finalSampleSize = `${surveySampleSize} + District`;
          } else {
            // Only district-specific data available OR insufficient survey sample
            finalValue = districtSpecificValue;
            isPreCalculated = true;
            finalSampleSize = records.length < this.MINIMUM_SAMPLE_SIZE ? `${records.length} (District fallback)` : 'District-wide';
            combinationMethod = 'district_only';
          }
        } else if (surveyValue !== null && !isNaN(surveyValue) && 
                   hasBangkokWideData) {
          // Fall back to Bangkok-wide combination if no district-specific data
          const isSmallSample = surveySampleSize < 20;
          const isLowSurveyValue = surveyValue < 10;
          const isHighVariance = Math.abs(surveyValue - bangkokWideValue) > 20;
          
          if (isSmallSample && isLowSurveyValue) {
            finalValue = (surveyValue * 0.3) + (bangkokWideValue * 0.7);
            combinationMethod = 'small_sample_fallback';
          } else if (isSmallSample) {
            finalValue = (surveyValue * 0.4) + (bangkokWideValue * 0.6);
            combinationMethod = 'small_sample_balanced';
          } else if (isHighVariance) {
            finalValue = (surveyValue * 0.6) + (bangkokWideValue * 0.4);
            combinationMethod = 'high_variance';
          } else {
            finalValue = (surveyValue * 0.7) + (bangkokWideValue * 0.3);
            combinationMethod = 'normal_combination';
          }
          
          isCombined = true;
          finalSampleSize = `${surveySampleSize} + Bangkok-wide`;
          
        } else if (surveyValue !== null && !isNaN(surveyValue)) {
          // Only survey data available with sufficient sample
          finalValue = surveyValue;
          finalSampleSize = surveySampleSize;
          combinationMethod = 'survey_only';
          
        } else if (hasDistrictSpecificData) {
          // Only district-specific pre-calculated data available
          finalValue = districtSpecificValue;
          isPreCalculated = true;
          finalSampleSize = records.length < this.MINIMUM_SAMPLE_SIZE ? `${records.length} (District fallback)` : 'District-wide';
          combinationMethod = 'district_only';
          
        } else if (hasBangkokWideData) {
          // Only Bangkok-wide pre-calculated data available
          finalValue = bangkokWideValue;
          isPreCalculated = true;
          finalSampleSize = records.length < this.MINIMUM_SAMPLE_SIZE ? `${records.length} (Bangkok fallback)` : 'Bangkok-wide';
          combinationMethod = 'bangkok_only';
          
        } else {
          // No data available
          results[indicator] = {
            value: null,
            sample_size: records.length,
            noData: true,
            insufficientSample: !hasMinimumSample
          };
          return; // Skip to next indicator
        }
        
        // Store the result with metadata
        results[indicator] = {
          value: parseFloat(finalValue.toFixed(2)),
          sample_size: finalSampleSize,
          isPreCalculated: isPreCalculated,
          isCombined: isCombined,
          combinationMethod: combinationMethod,
          surveyValue: surveyValue,
          preCalculatedValue: hasDistrictSpecificData ? districtSpecificValue : bangkokWideValue,
          surveySampleSize: surveySampleSize,
          insufficientSample: !hasMinimumSample && !isPreCalculated
        };
        
        return; // Skip normal calculation, we have our result
      }
      
      // NORMAL CALCULATION (for all other cases) - UPDATED with minimum sample size check
      else if (!hasMinimumSample) {
        // Insufficient sample size for regular survey-based indicators
        results[indicator] = {
          value: null,
          sample_size: records.length,
          noData: true,
          insufficientSample: true
        };
      } else if (mapping.calculation) {
        // Custom calculation function
        const calculatedValue = mapping.calculation(records);
        results[indicator] = {
          value: parseFloat(calculatedValue.toFixed(2)),
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
          
          // Check if financial calculation has sufficient valid records
          if (validRecords.length < this.MINIMUM_SAMPLE_SIZE) {
            results[indicator] = {
              value: null,
              sample_size: validRecords.length,
              noData: true,
              insufficientSample: true
            };
          } else {
            results[indicator].sample_size = validRecords.length;
          }
        }
      } else if (mapping.condition) {
        // Standard condition-based calculation
        let filteredRecords = records;
        
        // Apply age filter if specified
        if (mapping.ageFilter) {
          filteredRecords = records.filter(r => mapping.ageFilter(r.age));
        }
        
        // Check if filtered records still meet minimum sample size
        if (filteredRecords.length < this.MINIMUM_SAMPLE_SIZE) {
          results[indicator] = {
            value: null,
            sample_size: filteredRecords.length,
            noData: true,
            insufficientSample: true
          };
        } else {
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
            sample_size: mapping.ageFilter ? filteredRecords.length : records.length
          };
        }
      }
    });

    // Calculate domain score with proper reverse indicator handling
    const indicators = Object.keys(domainMapping);
    const goodnessScores = indicators.filter(indicator => {
      // Exclude indicators with no data or insufficient sample from domain score calculation
      return results[indicator] && 
             results[indicator].value !== null && 
             !results[indicator].noData && 
             !results[indicator].insufficientSample;
    }).map(indicator => {
      const rawValue = results[indicator].value;
      
      // Handle healthcare supply indicators with normalized scoring
      const healthcareSupplyIndicators = [
        'doctor_per_population', 
        'nurse_per_population', 
        'healthworker_per_population', 
        'community_healthworker_per_population',
        'health_service_access',
        'bed_per_population'
      ];
      
      if (healthcareSupplyIndicators.includes(indicator)) {
        // Convert healthcare supply indicators to 0-100 scale using WHO benchmarks
        const benchmarks = {
          doctor_per_population: { excellent: 2.5, good: 1.0, poor: 0.5 },
          nurse_per_population: { excellent: 8.0, good: 3.0, poor: 1.5 },
          healthworker_per_population: { excellent: 40, good: 20, poor: 10 },
          community_healthworker_per_population: { excellent: 5.0, good: 2.0, poor: 1.0 },
          health_service_access: { excellent: 50, good: 20, poor: 10 },
          bed_per_population: { excellent: 30, good: 15, poor: 10 }
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

    if (goodnessScores.length > 0) {
      const domainScore = goodnessScores.reduce((sum, score) => sum + score, 0) / goodnessScores.length;
      results['_domain_score'] = {
        value: parseFloat(domainScore.toFixed(1)),
        sample_size: records.length,
        validIndicators: goodnessScores.length,
        totalIndicators: indicators.length
      };
    } else {
      results['_domain_score'] = {
        value: null,
        sample_size: records.length,
        noData: true,
        insufficientSample: !hasMinimumSample,
        validIndicators: 0,
        totalIndicators: indicators.length
      };
    }

    return results;
  }

  calculateIndicators() {
    const results = {};
    const domains = Object.keys(this.indicatorMappings);
    const populationGroups = ['informal_workers', 'elderly', 'disabled', 'lgbtq', 'normal_population'];
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
        if (allRecords.length > 0 || group === 'normal_population') {
          results[domain]['Bangkok Overall'][group] = this.calculateIndicatorsForRecords(
            allRecords, 
            domain, 
            'Bangkok Overall',
            group
          );
        }
      });
      
      // Calculate individual districts
      districts.forEach(district => {
        populationGroups.forEach(group => {
          const records = this.surveyData.filter(r => 
            r.district_name === district && r.population_group === group
          );

          if (records.length > 0 || (group === 'normal_population' && district !== 'Bangkok Overall')) {
            results[domain][district][group] = this.calculateIndicatorsForRecords(
              records, 
              domain, 
              district,
              group
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
      sample_size: data[indicator].sample_size,
      population: data[indicator].population || null,
      absolute_count: data[indicator].absolute_count || null,
      isDomainScore: indicator === '_domain_score',
      noData: data[indicator].noData || false,
      insufficientSample: data[indicator].insufficientSample || false,
      isPreCalculated: data[indicator].isPreCalculated || false,
      isCombined: data[indicator].isCombined || false,
      combinationMethod: data[indicator].combinationMethod || null,
      validIndicators: data[indicator].validIndicators || null,
      totalIndicators: data[indicator].totalIndicators || null
    }));
  }

  // Get summary statistics for Bangkok Overall
  getBangkokOverallSummary() {
    const summary = {
      total_responses: this.surveyData.length,
      population_groups: {},
      districts_covered: [...new Set(this.surveyData.map(r => r.district_name))].length,
      minimum_sample_size: this.MINIMUM_SAMPLE_SIZE
    };

    // Population group breakdown for Bangkok Overall
    const populationGroups = ['informal_workers', 'elderly', 'disabled', 'lgbtq', 'normal_population'];
    populationGroups.forEach(group => {
      const groupRecords = this.surveyData.filter(r => r.population_group === group);
      summary.population_groups[group] = {
        count: groupRecords.length,
        percentage: ((groupRecords.length / this.surveyData.length) * 100).toFixed(1),
        meets_minimum: groupRecords.length >= this.MINIMUM_SAMPLE_SIZE
      };
    });

    // Calculate district sample size statistics
    const districts = [...new Set(this.surveyData.map(r => r.district_name))];
    const districtStats = {
      total_districts: districts.length,
      districts_with_minimum_sample: 0,
      districts_below_minimum: 0
    };

    districts.forEach(district => {
      populationGroups.forEach(group => {
        const records = this.surveyData.filter(r => 
          r.district_name === district && r.population_group === group
        );
        
        if (records.length >= this.MINIMUM_SAMPLE_SIZE) {
          districtStats.districts_with_minimum_sample++;
        } else if (records.length > 0) {
          districtStats.districts_below_minimum++;
        }
      });
    });

    summary.district_statistics = districtStats;

    return summary;
  }

  async processSurveyData(csvContent) {
    try {
      // Load survey data first
      await this.loadSurveyData(csvContent);
      
      // Load healthcare supply data
      await this.loadHealthcareSupplyData();
      
      // Calculate all indicators
      const results = this.calculateIndicators();
      
      return {
        results,
        processor: this
      };
      
    } catch (error) {
      throw error;
    }
  }
}

export default DataProcessor;