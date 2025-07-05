import React from 'react';

const HealthOutcomesTab = () => {
  const futureIndicators = [
    {
      category: 'Disease Prevalence',
      indicators: ['Diabetes prevalence', 'Hypertension prevalence', 'Heart disease rates', 'Cancer incidence']
    },
    {
      category: 'Mortality Rates',
      indicators: ['Life expectancy', 'Infant mortality', 'Maternal mortality', 'Preventable deaths']
    },
    {
      category: 'Healthcare Utilization',
      indicators: ['Emergency department visits', 'Preventive care utilization', 'Specialist access', 'Medication adherence']
    },
    {
      category: 'Mental Health',
      indicators: ['Depression rates', 'Suicide rates', 'Mental health service access', 'Stress levels']
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Health Outcomes</h3>
      
      <div className="bg-gray-50 p-4 rounded border border-gray-200 mb-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-gray-700">No Health Outcomes Data Available</h4>
            <p className="text-sm text-gray-600">Health outcomes data is not currently available for Bangkok districts.</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-gray-700 mb-3">Future Health Outcomes Indicators</h4>
        <p className="text-sm text-gray-600 mb-4">
          When available, health outcomes data will provide insights into the health status and 
          healthcare effectiveness in each district. Planned indicators include:
        </p>

        {futureIndicators.map((category, index) => (
          <div key={category.category} className="bg-white p-4 rounded border border-gray-200">
            <h5 className="font-medium text-gray-800 mb-2">{category.category}</h5>
            <ul className="text-sm text-gray-600 space-y-1">
              {category.indicators.map(indicator => (
                <li key={indicator} className="flex items-center space-x-2">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full flex-shrink-0"></div>
                  <span>{indicator}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-800 mb-2">How Health Outcomes Relate to SDHE</h4>
        <p className="text-sm text-blue-700 mb-2">
          Health outcomes are the end results influenced by Social Determinants of Health Equity (SDHE). 
          Understanding these relationships helps identify:
        </p>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Which districts have the best and worst health outcomes</li>
          <li>How social determinants impact population health</li>
          <li>Where targeted interventions may be most effective</li>
          <li>Progress toward health equity goals</li>
        </ul>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-xs text-yellow-800">
          <strong>Data Collection Note:</strong> Health outcomes data collection is planned for future phases 
          of the Bangkok Health Inequalities project. This will involve partnerships with healthcare providers, 
          public health agencies, and vital statistics offices.
        </p>
      </div>
    </div>
  );
};

export default HealthOutcomesTab;