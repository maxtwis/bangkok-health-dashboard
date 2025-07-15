// Enhanced Bangkok SDHE Data Processor
// Integrates the SDHE calculation pipeline with the dashboard

import Papa from 'papaparse';
import _ from 'lodash';

/**
 * Bangkok Survey to SDHE Indicators Processing System
 * Enhanced for React Dashboard Integration
 */
class BangkokSDHEProcessor {
  constructor() {
    this.surveyData = [];
    this.populationGroupData = [];
    this.sdheIndicators = {};
    this.districtCodeMap = this.createDistrictCodeMap();
    this.indicatorMappings = this.createIndicatorMappings();
    this.spiderChartData = {};
  }

  /**
   * District code to name mapping from survey metadata
   */
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

  /**
   * Enhanced SDHE Indicator mappings for dashboard integration
   */
  createIndicatorMappings() {
    return {
      // Economic Security Domain
      economic_security: {
        employment_rate: { 
          field: 'occupation_status', 
          condition: (val) => val === 1,
          label: 'Employment Rate',
          unit: '%'
        },
        vulnerable_employment: { 
          fields: ['occupation_status', 'occupation_contract'], 
          condition: (r) => r.occupation_status === 1 && r.occupation_contract === 0,
          label: 'Vulnerable Employment',
          unit: '%'
        },
        food_insecurity_moderate: { 
          field: 'food_insecurity_1', 
          condition: (val) => val === 1,
          label: 'Food Insecurity (Moderate)',
          unit: '%'
        },
        food_insecurity_severe: { 
          field: 'food_insecurity_2', 
          condition: (val) => val === 1,
          label: 'Food Insecurity (Severe)',
          unit: '%'
        },
        work_injury_fatal: { 
          field: 'occupation_injury', 
          condition: (val) => val === 1,
          label: 'Work-related Serious Injury',
          unit: '%'
        },
        work_injury_non_fatal: { 
          field: 'occupation_small_injury', 
          condition: (val) => val === 1,
          label: 'Work-related Minor Injury',
          unit: '%'
        }
      },

      // Education Domain
      education: {
        functional_literacy: { 
          fields: ['speak', 'read', 'write', 'math'],
          condition: (r) => r.speak === 1 && r.read === 1 && r.write === 1 && r.math === 1,
          label: 'Functional Literacy',
          unit: '%'
        },
        primary_completion: { 
          field: 'education', 
          condition: (val) => val >= 2,
          label: 'Primary Education Completion',
          unit: '%'
        },
        secondary_completion: { 
          field: 'education', 
          condition: (val) => val >= 4,
          label: 'Secondary Education Completion',
          unit: '%'
        },
        tertiary_completion: { 
          field: 'education', 
          condition: (val) => val >= 7,
          label: 'Tertiary Education Completion',
          unit: '%'
        },
        training_participation: { 
          field: 'training', 
          condition: (val) => val === 1,
          label: 'Training Participation',
          unit: '%'
        }
      },

      // Healthcare Access Domain  
      healthcare_access: {
        health_coverage: { 
          field: 'welfare', 
          condition: (val) => val !== null && val !== undefined,
          label: 'Health Coverage',
          unit: '%'
        },
        medical_consultation_skip_cost: { 
          field: 'medical_skip_1', 
          condition: (val) => val === 1,
          label: 'Skipped Medical Consultation (Cost)',
          unit: '%'
        },
        medical_treatment_skip_cost: { 
          field: 'medical_skip_2', 
          condition: (val) => val === 1,
          label: 'Skipped Medical Treatment (Cost)',
          unit: '%'
        },
        prescribed_medicine_skip_cost: { 
          field: 'medical_skip_3', 
          condition: (val) => val === 1,
          label: 'Skipped Medicine Purchase (Cost)',
          unit: '%'
        },
        dental_access: { 
          field: 'oral_health_access', 
          condition: (val) => val === 1,
          label: 'Dental Care Access',
          unit: '%'
        },
        catastrophic_health_spending: {
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
          label: 'Catastrophic Health Spending',
          unit: '%'
        }
      },

      // Physical Environment Domain
      physical_environment: {
        clean_water_access: { 
          field: 'community_environment_3', 
          condition: (val) => val !== 1,
          label: 'Clean Water Access',
          unit: '%'
        },
        sanitation_facilities: { 
          field: 'house_sink', 
          condition: (val) => val === 1,
          label: 'Adequate Sanitation',
          unit: '%'
        },
        waste_management: { 
          field: 'community_environment_5', 
          condition: (val) => val !== 1,
          label: 'Proper Waste Management',
          unit: '%'
        },
        housing_overcrowding: { 
          fields: ['community_environment_1', 'community_environment_2'],
          condition: (r) => r.community_environment_1 !== 1 && r.community_environment_2 !== 1,
          label: 'Adequate Housing Space',
          unit: '%'
        },
        home_ownership: { 
          field: 'house_status', 
          condition: (val) => val === 1,
          label: 'Home Ownership',
          unit: '%'
        },
        disaster_resilience: {
          fields: ['community_disaster_1', 'community_disaster_2', 'community_disaster_3', 'community_disaster_4'],
          condition: (r) => !(r.community_disaster_1 === 1 || r.community_disaster_2 === 1 || 
                             r.community_disaster_3 === 1 || r.community_disaster_4 === 1),
          label: 'Disaster Resilience',
          unit: '%'
        }
      },

      // Social Context Domain
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
          label: 'Community Safety',
          unit: 'score'
        },
        violence_free: {
          fields: ['physical_violence', 'psychological_violence', 'sexual_violence'],
          condition: (r) => r.physical_violence !== 1 && r.psychological_violence !== 1 && r.sexual_violence !== 1,
          label: 'Freedom from Violence',
          unit: '%'
        },
        discrimination_free: {
          fields: ['discrimination_1', 'discrimination_2', 'discrimination_3', 'discrimination_4', 'discrimination_5'],
          condition: (r) => !(r.discrimination_1 === 1 || r.discrimination_2 === 1 || r.discrimination_3 === 1 || 
                             r.discrimination_4 === 1 || r.discrimination_5 === 1),
          label: 'Freedom from Discrimination',
          unit: '%'
        },
        social_support: { 
          field: 'helper', 
          condition: (val) => val === 1,
          label: 'Social Support Availability',
          unit: '%'
        },
        community_safety_crime: { 
          field: 'community_murder', 
          condition: (val) => val !== 1,
          label: 'Community Safety (Crime-free)',
          unit: '%'
        }
      },

      // Health Behaviors Domain
      health_behaviors: {
        alcohol_consumption_safe: { 
          fields: ['drink_status'],
          condition: (r) => r.drink_status !== 1,
          label: 'Safe Alcohol Consumption',
          unit: '%'
        },
        tobacco_free: { 
          field: 'smoke_status', 
          condition: (val) => val === 0 || val === 1,
          ageFilter: (age) => age >= 15,
          label: 'Tobacco-free',
          unit: '%'
        },
        physical_activity: { 
          field: 'exercise_status', 
          condition: (val) => val >= 2,
          label: 'Adequate Physical Activity',
          unit: '%'
        },
        healthy_weight: {
          calculation: (records) => {
            const validBMI = records.filter(r => r.height > 0 && r.weight > 0);
            if (validBMI.length === 0) return 0;
            
            const healthyWeight = validBMI.filter(r => {
              const bmi = r.weight / Math.pow(r.height / 100, 2);
              return bmi >= 18.5 && bmi < 25;
            });
            
            return (healthyWeight.length / validBMI.length) * 100;
          },
          label: 'Healthy Weight',
          unit: '%'
        }
      }
    };
  }

  /**
   * Load survey data from CSV content
   */
  async loadSurveyData(csvContent) {
    try {
      const parsed = Papa.parse(csvContent, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        delimitersToGuess: [',', '\t', '|', ';']
      });

      if (parsed.errors.length > 0) {
        console.warn('CSV parsing errors:', parsed.errors);
      }

      // Clean and enrich data
      this.surveyData = parsed.data.map(record => ({
        ...record,
        district_name: this.districtCodeMap[record.dname] || `District_${record.dname}`,
        population_group: this.classifyPopulationGroup(record)
      }));

      // Filter for target population groups
      this.populationGroupData = this.surveyData.filter(record => 
        ['informal_workers', 'elderly', 'disabled', 'lgbtq'].includes(record.population_group)
      );

      console.log(`✅ Loaded ${this.surveyData.length} total survey responses`);
      console.log(`✅ Identified ${this.populationGroupData.length} population group responses`);
      
      return this.populationGroupData;
    } catch (error) {
      console.error('❌ Error loading survey data:', error);
      throw new Error(`Failed to load survey data: ${error.message}`);
    }
  }

  /**
   * Classify respondents into population groups
   */
  classifyPopulationGroup(record) {
    // Priority order classification
    if (record.sex === 'lgbt') return 'lgbtq';
    if (record.age >= 60) return 'elderly';  
    if (record.disable_status === 1) return 'disabled';
    if (record.occupation_status === 1 && record.occupation_contract === 0) return 'informal_workers';
    
    return 'general_population';
  }

  /**
   * Calculate SDHE indicators for all domains and population groups
   */
  calculateSDHEIndicators() {
    console.log('🔄 Calculating SDHE indicators...');
    
    const results = {};
    const domains = Object.keys(this.indicatorMappings);

    // Group data by district and population group
    const groupedData = _.groupBy(this.populationGroupData, 
      record => `${record.district_name}_${record.population_group}`);

    domains.forEach(domain => {
      results[domain] = {};
      
      Object.keys(groupedData).forEach(key => {
        const [district, group] = key.split('_');
        const records = groupedData[key];
        
        if (!results[domain][district]) {
          results[domain][district] = {};
        }

        results[domain][district][group] = this.calculateDomainIndicators(
          domain, 
          records
        );
      });
    });

    this.sdheIndicators = results;
    console.log('✅ SDHE indicators calculation completed');
    
    return results;
  }

  /**
   * Calculate indicators for a specific domain
   */
  calculateDomainIndicators(domain, records) {
    const domainMapping = this.indicatorMappings[domain];
    const results = { sample_size: records.length };

    Object.keys(domainMapping).forEach(indicator => {
      const mapping = domainMapping[indicator];
      
      if (mapping.calculation) {
        // Custom calculation function
        const calculatedValue = mapping.calculation(records);
        results[indicator] = parseFloat(calculatedValue.toFixed(2));
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
        
        results[indicator] = parseFloat(rate.toFixed(2));
      }
    });

    return results;
  }

  /**
   * Generate spider chart data for dashboard integration
   */
  generateSpiderChartData() {
    const spiderData = {};
    const domains = Object.keys(this.indicatorMappings);
    const populationGroups = ['informal_workers', 'elderly', 'disabled', 'lgbtq'];

    // Calculate Bangkok-wide averages for each population group
    populationGroups.forEach(group => {
      spiderData[group] = {};
      
      domains.forEach(domain => {
        const domainValues = [];
        
        // Collect all district values for this group and domain
        Object.values(this.sdheIndicators[domain] || {}).forEach(districtData => {
          if (districtData[group]) {
            const indicators = Object.keys(districtData[group]).filter(
              key => key !== 'sample_size' && !key.includes('_sample_size')
            );
            
            if (indicators.length > 0) {
              const domainAverage = indicators.reduce((sum, indicator) => 
                sum + (districtData[group][indicator] || 0), 0) / indicators.length;
              domainValues.push(domainAverage);
            }
          }
        });
        
        // Calculate Bangkok-wide average for this domain
        spiderData[group][domain] = domainValues.length > 0 ? 
          _.mean(domainValues) : 0;
      });
    });

    // Also calculate overall population averages
    spiderData.overall = {};
    domains.forEach(domain => {
      const allGroupValues = populationGroups.map(group => spiderData[group][domain] || 0);
      spiderData.overall[domain] = _.mean(allGroupValues);
    });

    this.spiderChartData = spiderData;
    return spiderData;
  }

  /**
   * Format spider chart data for recharts component
   */
  formatSpiderChartForRecharts(analysisLevel = 'bangkok', selectedGroup = 'informal_workers') {
    if (!this.spiderChartData || Object.keys(this.spiderChartData).length === 0) {
      this.generateSpiderChartData();
    }

    const domainLabels = {
      'economic_security': 'Economic Security',
      'education': 'Education',
      'healthcare_access': 'Healthcare Access',
      'physical_environment': 'Physical Environment',
      'social_context': 'Social Context',
      'health_behaviors': 'Health Behaviors'
    };

    if (analysisLevel === 'bangkok') {
      // Bangkok overview - show all groups
      return Object.keys(domainLabels).map(domain => {
        const item = {
          domain: domainLabels[domain],
          fullMark: 100
        };
        
        ['informal_workers', 'elderly', 'disabled', 'lgbtq', 'overall'].forEach(group => {
          item[group] = Math.round((this.spiderChartData[group]?.[domain] || 0) * 10) / 10;
        });
        
        return item;
      });
    } else {
      // District level - show selected group vs overall
      return Object.keys(domainLabels).map(domain => ({
        domain: domainLabels[domain],
        fullMark: 100,
        [selectedGroup]: Math.round((this.spiderChartData[selectedGroup]?.[domain] || 0) * 10) / 10,
        overall: Math.round((this.spiderChartData.overall?.[domain] || 0) * 10) / 10
      }));
    }
  }

  /**
   * Get detailed indicator data for tables
   */
  getIndicatorTableData(domain, populationGroup = null, district = null) {
    const domainMapping = this.indicatorMappings[domain];
    if (!domainMapping) return [];

    const tableData = [];
    
    if (district && populationGroup) {
      // District-specific data
      const districtData = this.sdheIndicators[domain]?.[district]?.[populationGroup];
      if (districtData) {
        Object.keys(domainMapping).forEach(indicator => {
          const mapping = domainMapping[indicator];
          const value = districtData[indicator];
          
          if (value !== undefined) {
            tableData.push({
              indicator: mapping.label || indicator,
              value: value.toFixed(1),
              unit: mapping.unit || '%',
              sample_size: districtData.sample_size || 0
            });
          }
        });
      }
    } else if (populationGroup) {
      // Bangkok-wide data for population group
      const allDistrictValues = {};
      
      Object.keys(domainMapping).forEach(indicator => {
        const values = [];
        Object.values(this.sdheIndicators[domain] || {}).forEach(districtData => {
          if (districtData[populationGroup]?.[indicator] !== undefined) {
            values.push(districtData[populationGroup][indicator]);
          }
        });
        
        if (values.length > 0) {
          allDistrictValues[indicator] = _.mean(values);
        }
      });
      
      Object.keys(domainMapping).forEach(indicator => {
        const mapping = domainMapping[indicator];
        const value = allDistrictValues[indicator];
        
        if (value !== undefined) {
          tableData.push({
            indicator: mapping.label || indicator,
            value: value.toFixed(1),
            unit: mapping.unit || '%',
            sample_size: 'Bangkok-wide'
          });
        }
      });
    }
    
    return tableData;
  }

  /**
   * Get population group summary statistics
   */
  getPopulationGroupSummary() {
    const summary = {
      total_responses: this.populationGroupData.length,
      groups: {}
    };

    const groupCounts = _.countBy(this.populationGroupData, 'population_group');
    const districtCounts = _.countBy(this.populationGroupData, 'district_name');

    Object.keys(groupCounts).forEach(group => {
      summary.groups[group] = {
        count: groupCounts[group],
        percentage: ((groupCounts[group] / this.populationGroupData.length) * 100).toFixed(1),
        districts_present: Object.keys(districtCounts).length
      };
    });

    return summary;
  }

  /**
   * Main processing function for dashboard integration
   */
  async processSurveyData(csvContent) {
    try {
      console.log('🚀 Starting Bangkok Survey to SDHE processing...');
      
      // Step 1: Load and classify data
      await this.loadSurveyData(csvContent);
      
      // Step 2: Calculate SDHE indicators
      const indicators = this.calculateSDHEIndicators();
      
      // Step 3: Generate spider chart data
      const spiderData = this.generateSpiderChartData();
      
      // Step 4: Generate summary
      const summary = this.getPopulationGroupSummary();
      
      console.log('✅ Processing completed successfully!');
      
      return {
        indicators,
        spiderData,
        summary,
        processor: this // Return processor instance for method access
      };
      
    } catch (error) {
      console.error('❌ Processing failed:', error);
      throw error;
    }
  }
}

export default BangkokSDHEProcessor;