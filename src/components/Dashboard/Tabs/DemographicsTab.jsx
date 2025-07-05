import React from 'react';

const DemographicsTab = ({ selectedDistrict, comparisonDistrict }) => {
  // Generate sample demographic data - replace with actual data when available
  const generateDemographics = (district) => {
    // Use district name to generate consistent sample data
    const seed = district.charCodeAt(0) + district.charCodeAt(district.length - 1);
    const random = (min, max) => min + ((seed * 9301 + 49297) % 233280) / 233280 * (max - min);
    
    return {
      population: Math.floor(random(50000, 200000)),
      populationDensity: Math.floor(random(5000, 25000)),
      underAge18: random(15, 25).toFixed(1),
      over65: random(8, 15).toFixed(1),
      female: random(48, 52).toFixed(1),
      medianIncome: Math.floor(random(30000, 80000)),
      rural: random(2, 20).toFixed(1),
      lifeExpectancy: random(75, 82).toFixed(1),
      nonThaiSpeaking: random(5, 30).toFixed(1)
    };
  };

  const selectedData = generateDemographics(selectedDistrict);
  const comparisonData = generateDemographics(comparisonDistrict);

  const demographicItems = [
    { label: 'Population', key: 'population', format: 'number' },
    { label: 'Population density per sq km', key: 'populationDensity', format: 'number' },
    { label: '% Under age 18', key: 'underAge18', format: 'percent' },
    { label: '% Age 65 and over', key: 'over65', format: 'percent' },
    { label: '% Female', key: 'female', format: 'percent' },
    { label: 'Median household income (฿)', key: 'medianIncome', format: 'currency' },
    { label: '% Rural', key: 'rural', format: 'percent' },
    { label: 'Life expectancy', key: 'lifeExpectancy', format: 'decimal' },
    { label: '% Non-Thai Speaking', key: 'nonThaiSpeaking', format: 'percent' }
  ];

  const formatValue = (value, format) => {
    switch(format) {
      case 'number':
        return value.toLocaleString();
      case 'percent':
        return `${value}%`;
      case 'currency':
        return `฿ ${value.toLocaleString()}`;
      case 'decimal':
        return value;
      default:
        return value;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Demographics</h3>
      
      <div className="bg-blue-50 p-4 rounded border">
        <p className="text-sm text-blue-600 mb-2">
          View the demographics used to help determine the similarity between your district and other districts.
          Select another district to see the comparison.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 font-medium text-gray-700">Essential facts</th>
              <th className="text-center py-3 font-medium text-gray-700">{selectedDistrict}</th>
              <th className="text-center py-3 font-medium text-gray-700">{comparisonDistrict}</th>
            </tr>
          </thead>
          <tbody>
            {demographicItems.map((item, index) => (
              <tr key={item.key} className={`border-b border-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}>
                <td className="py-2 text-gray-800">{item.label}</td>
                <td className="text-center py-2 font-medium text-gray-900">
                  {formatValue(selectedData[item.key], item.format)}
                </td>
                <td className="text-center py-2 font-medium text-gray-900">
                  {formatValue(comparisonData[item.key], item.format)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Currently displaying sample demographic data. 
          Actual census and survey data will be integrated when available.
        </p>
      </div>
    </div>
  );
};

export default DemographicsTab;