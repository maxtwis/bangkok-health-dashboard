import React from 'react';

const SDHETab = ({ selectedDistrict, healthBehaviorsData }) => {
  const domains = [
    {
      name: 'Health Behaviors',
      hasData: true,
      data: healthBehaviorsData,
      color: 'text-green-700'
    },
    {
      name: 'Education',
      hasData: false,
      indicators: ['High school graduation rate', 'College enrollment', 'Adult literacy rate'],
      color: 'text-gray-500'
    },
    {
      name: 'Economic Stability', 
      hasData: false,
      indicators: ['Employment rate', 'Poverty rate', 'Housing affordability'],
      color: 'text-gray-500'
    },
    {
      name: 'Healthcare Access',
      hasData: false,
      indicators: ['Healthcare coverage', 'Primary care access', 'Preventive care utilization'],
      color: 'text-gray-500'
    },
    {
      name: 'Neighborhood Environment',
      hasData: false,
      indicators: ['Air quality', 'Green space access', 'Transportation access'],
      color: 'text-gray-500'
    },
    {
      name: 'Community Context',
      hasData: false,
      indicators: ['Social cohesion', 'Crime rates', 'Community engagement'],
      color: 'text-gray-500'
    }
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Social Determinants of Health Equity</h3>
      
      {domains.map((domain, index) => (
        <div key={domain.name} className="mb-6">
          <h4 className={`font-medium mb-3 ${domain.color}`}>
            {domain.name} {domain.hasData ? '(Available Data)' : ''}
          </h4>
          
          {domain.hasData ? (
            <div className="space-y-2 bg-green-50 p-3 rounded border border-green-200">
              {Object.entries(domain.data).map(([indicator, value]) => (
                <div key={indicator} className="flex justify-between items-center py-1">
                  <span className="text-sm text-gray-800">{indicator}</span>
                  <span className="text-sm font-medium text-green-800">{value}</span>
                </div>
              ))}
              <div className="mt-2 pt-2 border-t border-green-300">
                <p className="text-xs text-green-700">
                  Data for {selectedDistrict} district
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-sm text-gray-600 mb-2">No data available</p>
              {domain.indicators && (
                <div className="text-xs text-gray-500">
                  <p className="mb-1">Future indicators may include:</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {domain.indicators.map(indicator => (
                      <li key={indicator}>{indicator}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-medium text-blue-800 mb-2">About SDHE Domains</h4>
        <p className="text-sm text-blue-700 mb-2">
          Social Determinants of Health Equity (SDHE) are conditions in the environments where people are born, 
          live, learn, work, play, worship, and age that affect health outcomes and risks.
        </p>
        <p className="text-xs text-blue-600">
          Currently, only Health Behaviors domain has available data from the Bangkok health surveys. 
          Other domains will be populated as additional data sources become available.
        </p>
      </div>
    </div>
  );
};

export default SDHETab;