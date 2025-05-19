import React from 'react';
import PopulationComparisonChart from '../Charts/PopulationComparisonChart';
import PopulationDataTable from '../Tables/PopulationDataTable';
import { formatYear } from '../DataUtils';

const PopulationComparisonTab = ({
  populationComparisonData,
  populationData,
  selectedIndicator,
  selectedGeographyType,
  selectedArea,
  years
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        {selectedIndicator === 'drink_rate' ? 'Alcohol Drinking Rate' : 'Indicator'} by Population Group - 
        {selectedGeographyType === 'bangkok' ? ' Bangkok' : ` ${selectedArea}`} 
        ({years[0] ? formatYear(years[0]) : ''} - {years.length > 0 ? formatYear(years[years.length - 1]) : ''})
      </h2>
      
      {/* Population Comparison Chart */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">Comparison by Population Group</h3>
        <PopulationComparisonChart data={populationComparisonData} />
      </div>
      
      {/* Population Data Table */}
      <div className="mb-8">
        <PopulationDataTable 
          populationData={populationData}
          selectedGeographyType={selectedGeographyType}
          selectedArea={selectedArea}
        />
      </div>
      
      {/* Interpretation */}
      <div className="bg-gray-50 p-4 rounded border">
        <h3 className="text-lg font-medium mb-2">Interpretation Guide</h3>
        <p className="mb-3">
          This chart compares alcohol drinking rates across different population groups:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li><strong>General Population</strong> - Reference group representing the average drinking rate across all adults.</li>
          <li><strong>ผู้สูงอายุ (Elderly)</strong> - Adults aged 60 years and above.</li>
          <li><strong>ผู้พิการ (Disabled)</strong> - Persons with disabilities.</li>
          <li><strong>LGBTQ+</strong> - Individuals identifying as lesbian, gay, bisexual, transgender, queer, or other sexual and gender minorities.</li>
          <li><strong>แรงงานนอกระบบ (Informal Workers)</strong> - Workers in informal employment without regular social security protection.</li>
        </ul>
        <p className="mt-3">
          <strong>Why this matters:</strong> Comparing drinking rates across different population groups helps identify health inequalities and can guide targeted public health interventions.
        </p>
        <p className="mt-3">
          <strong>Note:</strong> This visualization currently uses sample data. Actual survey data for these population groups will be integrated when available.
        </p>
      </div>
    </div>
  );
};

export default PopulationComparisonTab;