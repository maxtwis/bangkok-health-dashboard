// Basic SDHE Data Processor - Clean Version
import Papa from 'papaparse';
import _ from 'lodash';

class BasicSDHEProcessor {
  constructor() {
    this.surveyData = [];
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
      1021: "บางขุนเทียน", 1022: "ภาษีเจริญ", 1023: "หนองแขม", 1024: "ราษฏร์บูรณะ",
      1025: "บางพลัด", 1026: "ดินแดง", 1027: "บึงกุ่ม", 1028: "สาทร",
      1029: "บางซื่อ", 1030: "จตุจักร", 1031: "บางคอแหลม", 1032: "ประเวศ",
      1033: "คลองเตย", 1034: "สวนหลวง", 1035: "จอมทอง", 1036: "ดอนเมือง",
      1037: "ราชเทวี", 1038: "ลาดพร้าว", 1039: "วัฒนา", 1040: "บางแค",
      1041: "หลักสี่", 1042: "สายไหม", 1043: "คันนายาว", 1044: "สะพานสูง",
      1045: "วังทองหลาง", 1046: "คลองสามวา", 1047: "บางนา", 1048: "ทวีวัฒนา",
      1049: "ทุ่งครุ่", 1050: "บางบอน"
    };
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

      // Healthcare Access Domain - Complete set
      healthcare_access: {
        health_coverage: { 
          field: 'welfare', 
          condition: (val) => val !== null,
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

  calculateIndicators() {
    const results = {};
    const domains = Object.keys(this.indicatorMappings);
    const populationGroups = ['informal_workers', 'elderly', 'disabled', 'lgbtq'];
    const districts = [...new Set(this.surveyData.map(r => r.district_name))];

    // Initialize results structure
    domains.forEach(domain => {
      results[domain] = {};
      districts.forEach(district => {
        results[domain][district] = {};
        populationGroups.forEach(group => {
          results[domain][district][group] = {};
        });
      });
    });

    // Calculate indicators for each combination
    domains.forEach(domain => {
      const domainMapping = this.indicatorMappings[domain];
      
      districts.forEach(district => {
        populationGroups.forEach(group => {
          const records = this.surveyData.filter(r => 
            r.district_name === district && r.population_group === group
          );

          if (records.length > 0) {
            Object.keys(domainMapping).forEach(indicator => {
              const mapping = domainMapping[indicator];
              
              if (mapping.calculation) {
                // Custom calculation function
                const calculatedValue = mapping.calculation(records);
                results[domain][district][group][indicator] = {
                  value: parseFloat(calculatedValue.toFixed(2)),
                  label: mapping.label,
                  sample_size: records.length
                };
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
                
                results[domain][district][group][indicator] = {
                  value: parseFloat(rate.toFixed(2)),
                  label: mapping.label,
                  sample_size: mapping.ageFilter ? filteredRecords.length : records.length
                };
              }
            });

            // Calculate domain score (average of indicators)
            const indicators = Object.keys(domainMapping);
            const domainScore = indicators.reduce((sum, indicator) => {
              return sum + results[domain][district][group][indicator].value;
            }, 0) / indicators.length;

            results[domain][district][group]['_domain_score'] = {
              value: parseFloat(domainScore.toFixed(1)),
              label: `${domain.replace('_', ' ')} Score`,
              sample_size: records.length
            };
          }
        });
      });
    });

    this.sdheResults = results;
    return results;
  }

  getAvailableDistricts() {
    return [...new Set(this.surveyData.map(r => r.district_name))].sort();
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
      ...data[indicator],
      isDomainScore: indicator === '_domain_score'
    }));
  }

  async processSurveyData(csvContent) {
    await this.loadSurveyData(csvContent);
    const results = this.calculateIndicators();
    
    console.log(`✅ Processed ${this.surveyData.length} survey responses`);
    console.log(`📊 Districts: ${this.getAvailableDistricts().length}`);
    console.log(`🎯 Domains: ${this.getAvailableDomains().length}`);
    
    return {
      results,
      processor: this
    };
  }
}

export default BasicSDHEProcessor;