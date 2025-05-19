import React from 'react';
import { formatYear } from '../DataUtils';

const DataTablesTab = ({ 
  filteredData, 
  filteredSexData, 
  selectedGeographyType, 
  selectedArea,
  indicatorName
}) => {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Data Tables - 
        {selectedGeographyType === 'bangkok' ? ' Bangkok' : ` ${selectedArea}`}
      </h2>
      
      {/* Overall Data Table */}
      <div className="mb-8">
        <h3 className="text-lg font-medium mb-2">Overall {indicatorName}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Year</th>
                <th className="py-2 px-4 border-b">{indicatorName} (%)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-2 px-4 border-b text-center">{formatYear(item.year)}</td>
                  <td className="py-2 px-4 border-b text-center">{item.value?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Sex-specific Data Table */}
      <div>
        <h3 className="text-lg font-medium mb-2">{indicatorName} by Sex</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="py-2 px-4 border-b">Year</th>
                <th className="py-2 px-4 border-b">Sex</th>
                <th className="py-2 px-4 border-b">{indicatorName} (%)</th>
              </tr>
            </thead>
            <tbody>
              {filteredSexData.map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="py-2 px-4 border-b text-center">{formatYear(item.year)}</td>
                  <td className="py-2 px-4 border-b text-center">{item.sex}</td>
                  <td className="py-2 px-4 border-b text-center">
                    {item.value !== null ? item.value?.toFixed(2) : 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DataTablesTab;