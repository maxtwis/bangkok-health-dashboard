/**
 * Correlation calculation utilities for indicator analysis
 * Provides functions to calculate Pearson correlation coefficients between indicators
 */

/**
 * Calculate Pearson correlation coefficient between two arrays
 * @param {number[]} x - First array of values
 * @param {number[]} y - Second array of values
 * @returns {number} Correlation coefficient between -1 and 1
 */
export function calculatePearsonCorrelation(x, y) {
  if (!x || !y || x.length !== y.length || x.length === 0) {
    return null;
  }

  const n = x.length;
  
  // Calculate means
  const meanX = x.reduce((sum, val) => sum + val, 0) / n;
  const meanY = y.reduce((sum, val) => sum + val, 0) / n;
  
  // Calculate correlation components
  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;
  
  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    
    numerator += diffX * diffY;
    denominatorX += diffX * diffX;
    denominatorY += diffY * diffY;
  }
  
  const denominator = Math.sqrt(denominatorX * denominatorY);
  
  if (denominator === 0) {
    return 0; // No variation in one or both variables
  }
  
  return numerator / denominator;
}

/**
 * Calculate correlation matrix for all indicators
 * @param {Object[]} data - Survey data records
 * @param {string[]} indicators - List of indicator names
 * @param {Function} calculateIndicatorValue - Function to calculate indicator value for a record
 * @returns {Object} Correlation matrix with indicator pairs and their correlations
 */
export function calculateCorrelationMatrix(data, indicators, calculateIndicatorValue) {
  const matrix = {};
  const indicatorValues = {};
  
  // First, calculate all indicator values for each record
  indicators.forEach(indicator => {
    indicatorValues[indicator] = data.map(record => 
      calculateIndicatorValue(record, indicator) ? 1 : 0
    );
  });
  
  // Calculate correlations between all pairs
  indicators.forEach((indicator1, i) => {
    matrix[indicator1] = {};
    indicators.forEach((indicator2, j) => {
      if (i <= j) { // Only calculate upper triangle (correlation is symmetric)
        const correlation = calculatePearsonCorrelation(
          indicatorValues[indicator1],
          indicatorValues[indicator2]
        );
        matrix[indicator1][indicator2] = correlation;
        if (i !== j && matrix[indicator2]) {
          matrix[indicator2][indicator1] = correlation; // Mirror for lower triangle
        }
      }
    });
  });
  
  return matrix;
}

/**
 * Find top correlated indicators for a specific indicator
 * @param {Object} correlationMatrix - Full correlation matrix
 * @param {string} targetIndicator - The indicator to find correlations for
 * @param {number} topN - Number of top correlations to return
 * @param {number} minCorrelation - Minimum absolute correlation threshold
 * @returns {Array} Array of {indicator, correlation, strength} sorted by absolute correlation
 */
export function getTopCorrelations(correlationMatrix, targetIndicator, topN = 10, minCorrelation = 0.1) {
  if (!correlationMatrix[targetIndicator]) {
    console.log('No correlation data for indicator:', targetIndicator);
    return [];
  }
  
  const correlations = [];
  let totalCount = 0;
  let validCount = 0;
  
  Object.entries(correlationMatrix[targetIndicator]).forEach(([indicator, correlation]) => {
    totalCount++;
    if (indicator !== targetIndicator && correlation !== null && !isNaN(correlation)) {
      validCount++;
      const absCorr = Math.abs(correlation);
      
      if (absCorr >= minCorrelation) {
        correlations.push({
          indicator,
          correlation,
          absoluteCorrelation: absCorr,
          strength: getCorrelationStrength(correlation),
          direction: correlation > 0 ? 'positive' : 'negative'
        });
      }
    }
  });
  
  console.log(`Correlations: ${totalCount} total, ${validCount} valid, ${correlations.length} above threshold`);
  
  // Sort by absolute correlation value (strongest relationships first)
  correlations.sort((a, b) => b.absoluteCorrelation - a.absoluteCorrelation);
  
  return correlations.slice(0, topN);
}

/**
 * Categorize correlation strength
 * @param {number} correlation - Correlation coefficient
 * @returns {string} Strength category
 */
export function getCorrelationStrength(correlation) {
  const absCorr = Math.abs(correlation);
  
  if (absCorr >= 0.7) return 'very strong';
  if (absCorr >= 0.5) return 'strong';
  if (absCorr >= 0.3) return 'moderate';
  if (absCorr >= 0.1) return 'weak';
  return 'negligible';
}

/**
 * Get correlation interpretation text
 * @param {number} correlation - Correlation coefficient
 * @param {string} indicator1 - First indicator name
 * @param {string} indicator2 - Second indicator name
 * @param {string} language - Language code ('en' or 'th')
 * @returns {Object} Interpretation with description and meaning
 */
export function interpretCorrelation(correlation, indicator1, indicator2, language = 'en') {
  const strength = getCorrelationStrength(correlation);
  const direction = correlation > 0 ? 'positive' : 'negative';
  
  const interpretations = {
    en: {
      positive: {
        'very strong': `Very strong positive relationship: As ${indicator1} increases, ${indicator2} strongly tends to increase`,
        'strong': `Strong positive relationship: As ${indicator1} increases, ${indicator2} tends to increase`,
        'moderate': `Moderate positive relationship: Some tendency for ${indicator2} to increase with ${indicator1}`,
        'weak': `Weak positive relationship: Slight tendency for ${indicator2} to increase with ${indicator1}`,
        'negligible': `No meaningful relationship between ${indicator1} and ${indicator2}`
      },
      negative: {
        'very strong': `Very strong negative relationship: As ${indicator1} increases, ${indicator2} strongly tends to decrease`,
        'strong': `Strong negative relationship: As ${indicator1} increases, ${indicator2} tends to decrease`,
        'moderate': `Moderate negative relationship: Some tendency for ${indicator2} to decrease with ${indicator1}`,
        'weak': `Weak negative relationship: Slight tendency for ${indicator2} to decrease with ${indicator1}`,
        'negligible': `No meaningful relationship between ${indicator1} and ${indicator2}`
      }
    },
    th: {
      positive: {
        'very strong': `ความสัมพันธ์เชิงบวกที่แข็งแกร่งมาก: เมื่อ ${indicator1} เพิ่มขึ้น ${indicator2} มีแนวโน้มเพิ่มขึ้นอย่างมาก`,
        'strong': `ความสัมพันธ์เชิงบวกที่แข็งแกร่ง: เมื่อ ${indicator1} เพิ่มขึ้น ${indicator2} มีแนวโน้มเพิ่มขึ้น`,
        'moderate': `ความสัมพันธ์เชิงบวกปานกลาง: ${indicator2} มีแนวโน้มเพิ่มขึ้นบ้างเมื่อ ${indicator1} เพิ่มขึ้น`,
        'weak': `ความสัมพันธ์เชิงบวกเล็กน้อย: ${indicator2} มีแนวโน้มเพิ่มขึ้นเล็กน้อยเมื่อ ${indicator1} เพิ่มขึ้น`,
        'negligible': `ไม่มีความสัมพันธ์ที่มีนัยสำคัญระหว่าง ${indicator1} และ ${indicator2}`
      },
      negative: {
        'very strong': `ความสัมพันธ์เชิงลบที่แข็งแกร่งมาก: เมื่อ ${indicator1} เพิ่มขึ้น ${indicator2} มีแนวโน้มลดลงอย่างมาก`,
        'strong': `ความสัมพันธ์เชิงลบที่แข็งแกร่ง: เมื่อ ${indicator1} เพิ่มขึ้น ${indicator2} มีแนวโน้มลดลง`,
        'moderate': `ความสัมพันธ์เชิงลบปานกลาง: ${indicator2} มีแนวโน้มลดลงบ้างเมื่อ ${indicator1} เพิ่มขึ้น`,
        'weak': `ความสัมพันธ์เชิงลบเล็กน้อย: ${indicator2} มีแนวโน้มลดลงเล็กน้อยเมื่อ ${indicator1} เพิ่มขึ้น`,
        'negligible': `ไม่มีความสัมพันธ์ที่มีนัยสำคัญระหว่าง ${indicator1} และ ${indicator2}`
      }
    }
  };
  
  const description = interpretations[language][direction][strength];
  
  return {
    description,
    strength,
    direction,
    coefficient: correlation,
    meaning: getMeaningForPolicyMakers(strength, direction, language)
  };
}

/**
 * Get policy-relevant meaning of correlation
 * @param {string} strength - Correlation strength category
 * @param {string} direction - Correlation direction
 * @param {string} language - Language code
 * @returns {string} Policy-relevant interpretation
 */
function getMeaningForPolicyMakers(strength, direction, language) {
  const meanings = {
    en: {
      'very strong': {
        positive: 'These indicators move together strongly. Interventions affecting one will likely impact the other.',
        negative: 'These indicators move in opposite directions. Improving one may worsen the other - consider trade-offs.'
      },
      'strong': {
        positive: 'Strong co-movement suggests shared underlying factors. Consider integrated interventions.',
        negative: 'Notable inverse relationship. Balance interventions to avoid unintended consequences.'
      },
      'moderate': {
        positive: 'Moderate relationship suggests some shared determinants worth investigating.',
        negative: 'Moderate inverse relationship. Monitor both when implementing interventions.'
      },
      'weak': {
        positive: 'Weak relationship. Other factors likely more important.',
        negative: 'Weak inverse relationship. Other factors likely more important.'
      },
      'negligible': {
        positive: 'No meaningful relationship. These indicators can be addressed independently.',
        negative: 'No meaningful relationship. These indicators can be addressed independently.'
      }
    },
    th: {
      'very strong': {
        positive: 'ตัวชี้วัดเหล่านี้เคลื่อนไหวไปด้วยกันอย่างมาก การแทรกแซงที่หนึ่งจะส่งผลต่ออีกตัว',
        negative: 'ตัวชี้วัดเคลื่อนไหวตรงข้ามกัน การปรับปรุงหนึ่งอาจทำให้อีกตัวแย่ลง ควรพิจารณาการแลกเปลี่ยน'
      },
      'strong': {
        positive: 'การเคลื่อนไหวร่วมกันอย่างมากบ่งชี้ถึงปัจจัยพื้นฐานร่วม ควรพิจารณาการแทรกแซงแบบบูรณาการ',
        negative: 'ความสัมพันธ์ผกผันที่ชัดเจน ควรสร้างสมดุลการแทรกแซงเพื่อหลีกเลี่ยงผลที่ไม่ตั้งใจ'
      },
      'moderate': {
        positive: 'ความสัมพันธ์ปานกลางบ่งชี้ถึงปัจจัยกำหนดร่วมบางอย่างที่ควรตรวจสอบ',
        negative: 'ความสัมพันธ์ผกผันปานกลาง ควรติดตามทั้งคู่เมื่อดำเนินการแทรกแซง'
      },
      'weak': {
        positive: 'ความสัมพันธ์อ่อน ปัจจัยอื่นน่าจะสำคัญกว่า',
        negative: 'ความสัมพันธ์ผกผันอ่อน ปัจจัยอื่นน่าจะสำคัญกว่า'
      },
      'negligible': {
        positive: 'ไม่มีความสัมพันธ์ที่มีความหมาย สามารถจัดการตัวชี้วัดเหล่านี้แยกกันได้',
        negative: 'ไม่มีความสัมพันธ์ที่มีความหมาย สามารถจัดการตัวชี้วัดเหล่านี้แยกกันได้'
      }
    }
  };
  
  return meanings[language][strength][direction];
}

/**
 * Group indicators by domain for organized display
 * @param {Array} correlations - Array of correlation objects
 * @param {Function} getIndicatorDomain - Function to get domain for an indicator
 * @returns {Object} Correlations grouped by domain
 */
export function groupCorrelationsByDomain(correlations, getIndicatorDomain) {
  const grouped = {};
  
  correlations.forEach(corr => {
    const domain = getIndicatorDomain(corr.indicator);
    if (!grouped[domain]) {
      grouped[domain] = [];
    }
    grouped[domain].push(corr);
  });
  
  return grouped;
}

/**
 * Get basic statistical correlation description
 * @param {number} correlation - Correlation coefficient
 * @param {string} language - Language code ('en' or 'th')
 * @param {string} indicator1Name - Name of first indicator (optional)
 * @param {string} indicator2Name - Name of second indicator (optional)
 * @returns {Object} Basic correlation description
 */
export function getBasicCorrelationDescription(correlation, language = 'en', indicator1Name = null, indicator2Name = null) {
  const absCorr = Math.abs(correlation);
  const strength = getCorrelationStrength(correlation);
  const direction = correlation > 0 ? 'positive' : correlation < 0 ? 'negative' : 'none';
  
  // Use specific indicator names if provided, otherwise use generic terms
  const ind1 = indicator1Name || (language === 'th' ? 'ตัวชี้วัดหนึ่ง' : 'one indicator');
  const ind2 = indicator2Name || (language === 'th' ? 'อีกตัวชี้วัด' : 'the other');
  
  const descriptions = {
    en: {
      positive: `Positive Correlation: When ${ind1} increases, ${ind2} tends to increase as well`,
      negative: `Negative Correlation: When ${ind1} increases, ${ind2} tends to decrease`,
      none: `No Correlation: ${ind1} and ${ind2} have no linear relationship`
    },
    th: {
      positive: `ความสัมพันธ์เชิงบวก (Positive Correlation): เมื่อ${ind1}เพิ่มขึ้น ${ind2}ก็มีแนวโน้มเพิ่มขึ้นตามไปด้วย`,
      negative: `ความสัมพันธ์เชิงลบ (Negative Correlation): เมื่อ${ind1}เพิ่มขึ้น ${ind2}ก็มีแนวโน้มลดลง`,
      none: `ไม่มีความสัมพันธ์ (No Correlation): ${ind1}และ${ind2}ไม่มีความเกี่ยวข้องกันในเชิงเส้นตรง`
    }
  };
  
  return {
    description: descriptions[language][direction],
    strength,
    direction,
    coefficient: correlation
  };
}

/**
 * Calculate correlation significance (p-value approximation)
 * @param {number} r - Correlation coefficient
 * @param {number} n - Sample size
 * @returns {Object} Significance information
 */
export function calculateSignificance(r, n) {
  if (n < 3) return { significant: false, pValue: 1 };
  
  // Calculate t-statistic
  const t = r * Math.sqrt((n - 2) / (1 - r * r));
  const df = n - 2;
  
  // Approximate p-value using simplified method
  // For more accurate p-values, would need a full t-distribution implementation
  const tCritical05 = 1.96; // Approximate for large samples
  const tCritical01 = 2.58;
  const tCritical001 = 3.29;
  
  const absT = Math.abs(t);
  
  let significance = 'not significant';
  let stars = '';
  
  if (absT > tCritical001) {
    significance = 'p < 0.001';
    stars = '***';
  } else if (absT > tCritical01) {
    significance = 'p < 0.01';
    stars = '**';
  } else if (absT > tCritical05) {
    significance = 'p < 0.05';
    stars = '*';
  }
  
  return {
    significant: absT > tCritical05,
    significance,
    stars,
    tStatistic: t
  };
}