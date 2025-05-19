// src/components/Dashboard/Tabs/DefinitionsTab.jsx (updated for multiple indicators)
import React from 'react';

const DefinitionsTab = ({ selectedIndicator }) => {
  // Determine which indicator definition to show first based on selection
  const showDrinkRateFirst = selectedIndicator === 'drink_rate';
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Definitions and Information</h2>
      
      {/* First Indicator */}
      <div className="bg-gray-50 p-4 rounded border mb-4">
        <h3 className="text-lg font-medium mb-2">
          {showDrinkRateFirst ? 'Alcohol Drinking Rate' : 'Smoking Rate'}
        </h3>
        <p className="mb-2">
          <strong>Definition:</strong> {showDrinkRateFirst 
            ? 'The percentage of population aged 15 years and over who consumed alcoholic beverages within the past 12 months.'
            : 'The percentage of population aged 15 years and over who currently smoke tobacco products.'}
        </p>
        <p className="mb-2">
          <strong>Data Source:</strong> Survey data collected at district level in Bangkok.
        </p>
        <p>
          <strong>Time Period:</strong> Data shown for Buddhist years 2566-2568 (corresponding to 2023-2025 CE).
        </p>
      </div>
      
      {/* Second Indicator */}
      <div className="bg-gray-50 p-4 rounded border mb-4">
        <h3 className="text-lg font-medium mb-2">
          {showDrinkRateFirst ? 'Smoking Rate' : 'Alcohol Drinking Rate'}
        </h3>
        <p className="mb-2">
          <strong>Definition:</strong> {showDrinkRateFirst 
            ? 'The percentage of population aged 15 years and over who currently smoke tobacco products.'
            : 'The percentage of population aged 15 years and over who consumed alcoholic beverages within the past 12 months.'}
        </p>
        <p className="mb-2">
          <strong>Data Source:</strong> Survey data collected at district level in Bangkok.
        </p>
        <p>
          <strong>Time Period:</strong> Data shown for Buddhist years 2566-2568 (corresponding to 2023-2025 CE).
        </p>
      </div>
      
      {/* Population Groups */}
      <div className="bg-gray-50 p-4 rounded border mb-4">
        <h3 className="text-lg font-medium mb-2">Population Groups</h3>
        <p className="mb-3">
          The dashboard compares health indicators across the following population groups:
        </p>
        <ul className="space-y-2">
          <li><strong>General Population</strong> - Overall adult population (15+ years) serving as the reference group.</li>
          <li><strong>ผู้สูงอายุ (Elderly)</strong> - Adults aged 60 years and above, as defined by the Thai Elderly Person Act.</li>
          <li><strong>ผู้พิการ (Disabled)</strong> - Persons with disabilities as registered under the Thai Persons with Disabilities Empowerment Act.</li>
          <li><strong>LGBTQ+</strong> - Individuals who self-identify as lesbian, gay, bisexual, transgender, queer, or other sexual and gender minorities.</li>
          <li><strong>แรงงานนอกระบบ (Informal Workers)</strong> - Workers not covered by formal employment arrangements or social security protection, including day laborers, home-based workers, street vendors, and domestic workers.</li>
        </ul>
      </div>
      
      <div className="bg-gray-50 p-4 rounded border mb-4">
        <h3 className="text-lg font-medium mb-2">Methodology</h3>
        <p className="mb-2">
          Data is collected through representative household surveys conducted in each district of Bangkok.
          The surveys use standardized questionnaires and sampling techniques to ensure data comparability
          across districts and years.
        </p>
      </div>
      
      <div className="bg-gray-50 p-4 rounded border">
        <h3 className="text-lg font-medium mb-2">Interpretation Guide</h3>
        <p className="mb-2">
          <strong>Trend Analysis:</strong> Increasing trends in both alcohol consumption and smoking rates indicate 
          worsening public health outcomes, while decreasing trends suggest improvements.
        </p>
        <p className="mb-2">
          <strong>Sex Differences:</strong> Significant differences between male and female rates
          may indicate cultural or social factors affecting consumption patterns.
        </p>
        <p className="mb-2">
          <strong>Population Group Disparities:</strong> Variations in rates between different population
          groups can highlight health inequalities and identify vulnerable populations that may require
          targeted interventions.
        </p>
        <p>
          <strong>Geographic Variations:</strong> Variations between districts may reflect socioeconomic
          factors, local policies, or cultural differences influencing health behaviors.
        </p>
      </div>
    </div>
  );
};

export default DefinitionsTab;