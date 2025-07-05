import React from 'react';
import DemographicsTab from './Tabs/DemographicsTab';
import SDHETab from './Tabs/SDHETab';
import SimilarDistrictsTab from './Tabs/SimilarDistrictsTab';
import DistrictMapTab from './Tabs/DistrictMapTab';
import HealthOutcomesTab from './Tabs/HealthOutcomesTab';

const LeftPanel = ({
  activeTab,
  setActiveTab,
  selectedDistrict,
  comparisonDistrict,
  healthBehaviorsData,
  similarDistricts,
  districtGeoJson,
  allRateData
}) => {
  const tabs = [
    { key: 'demographics', label: 'Demographics', color: 'bg-teal-600' },
    { key: 'sdhe', label: 'Social Determinants of Health', color: 'bg-teal-600' },
    { key: 'similar', label: 'My Most Similar Districts', color: 'bg-teal-600' },
    { key: 'map', label: 'District Map', color: 'bg-teal-600' },
    { key: 'outcomes', label: 'Health Outcomes', color: 'bg-teal-600' }
  ];

  const renderTabContent = () => {
    switch(activeTab) {
      case 'demographics':
        return (
          <DemographicsTab 
            selectedDistrict={selectedDistrict}
            comparisonDistrict={comparisonDistrict}
          />
        );
      case 'sdhe':
        return (
          <SDHETab 
            selectedDistrict={selectedDistrict}
            healthBehaviorsData={healthBehaviorsData}
          />
        );
      case 'similar':
        return (
          <SimilarDistrictsTab 
            selectedDistrict={selectedDistrict}
            similarDistricts={similarDistricts}
          />
        );
      case 'map':
        return (
          <DistrictMapTab 
            selectedDistrict={selectedDistrict}
            districtGeoJson={districtGeoJson}
          />
        );
      case 'outcomes':
        return <HealthOutcomesTab />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${
                activeTab === tab.key 
                  ? `${tab.color} text-white` 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 h-96 overflow-y-auto">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default LeftPanel;