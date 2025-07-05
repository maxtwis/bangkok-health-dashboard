import React from 'react';

const SimilarDistrictsTab = ({ selectedDistrict, similarDistricts }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-3">Most Similar Districts</h3>
      
      <div className="bg-blue-50 p-4 rounded border border-blue-200 mb-4">
        <p className="text-sm text-blue-600">
          Districts ranked by similarity to <strong>{selectedDistrict}</strong> based on health behaviors indicators.
        </p>
      </div>

      <div className="space-y-3">
        {similarDistricts.length > 0 ? (
          similarDistricts.map((item, index) => (
            <div key={item.district} className="flex justify-between items-center py-3 px-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-teal-100 text-teal-700 rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <span className="text-sm font-medium text-gray-900">{item.district}</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-teal-600">{item.similarity.toFixed(1)}%</span>
                <p className="text-xs text-gray-500">similar</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <p className="text-sm text-gray-500">No similarity data available</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-3 bg-gray-50 border border-gray-200 rounded">
        <h4 className="font-medium text-gray-700 mb-2">How Similarity is Calculated</h4>
        <p className="text-xs text-gray-600 mb-2">
          Districts are ranked by similarity based on their Social Determinants of Health Equity scores. 
          Currently, similarity is calculated using Health Behaviors domain indicators:
        </p>
        <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
          <li>Alcohol drinking rate</li>
          <li>Smoking rate</li>
          <li>Obesity rate</li>
          <li>Traffic death rate</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">
          As more SDHE domain data becomes available, similarity calculations will include additional indicators 
          such as education, economic stability, healthcare access, neighborhood environment, and community context.
        </p>
      </div>
    </div>
  );
};

export default SimilarDistrictsTab;