import React from 'react';
import { formatYear } from '../DataUtils';

const PopulationDataTable = ({ populationData, selectedGeographyType, selectedArea }) => {
  // For now, using sample data until real data is available
  const sampleData = [
    { year: 2566, population_group: 'general', value: 16.5 },
    { year: 2566, population_group: 'elderly', value: 9.2 },
    { year: 2566, population_group: 'disabled', value: 11.3 },
    { year: 2566, population_group: 'lgbtq', value: 18.7 },
    { year: 2566, population_group: 'informal', value: 21.4 },
    { year: 2567, population_group: 'general', value: 17.8 },
    { year: 2567, population_group: 'elderly', value: 9.7 },
    { year: 2567, population_group: 'disabled', value: 12.1 },
    { year: 2567, population_group: 'lgbtq', value: 19.2 },
    { year: 2567, population_group: 'informal', value: 22.6 },
    { year: 2568, population_group: 'general', value: 18.2 },
    { year: 2568, population_group: 'elderly', value: 10.1 },
    { year: 2568, population_group: 'disabled', value: 12.8 },
    { year: 2568, population_group: 'lgbtq', value: 19.5 },
    { year: 2568, population_group: 'informal', value: 23.1 }
  ];

  // A mapping for display names
  const groupNames = {
    'general': 'General Population',
    'elderly': 'ผู้สูงอายุ (Elderly)',
    'disabled': 'ผู้พิการ (Disabled)',
    'lgbtq': 'LGBTQ+',
    'informal': 'แรงงานนอกระบบ (Informal Workers)'
  };

  // Use provided data if available, otherwise use sample data
  const displayData = populationData && populationData.length > 0 ? populationData : sampleData;

  return (
    <div>
      <h3 className="text-lg font-medium mb-2">Drinking Rate by Population Group</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b">Year</th>
              <th className="py-2 px-4 border-b">Population Group</th>
              <th className="py-2 px-4 border-b">Drinking Rate (%)</th>
            </tr>
          </thead>
          <tbody>
            {displayData.map((item, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                <td className="py-2 px-4 border-b text-center">{formatYear(item.year)}</td>
                <td className="py-2 px-4 border-b">{groupNames[item.population_group] || item.population_group}</td>
                <td className="py-2 px-4 border-b text-center">
                  {item.value !== null ? item.value?.toFixed(2) : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-gray-500 italic">
        Note: This table currently displays sample data for demonstration purposes.
        Actual survey data will be integrated when available.
      </p>
    </div>
  );
};

export default PopulationDataTable;