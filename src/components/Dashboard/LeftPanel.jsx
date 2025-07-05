import React from 'react';
import DemographicsTab from './Tabs/DemographicsTab';
import SDHETab from './Tabs/SDHETab';
import SimilarDistrictsTab from './Tabs/SimilarDistrictsTab';
import DistrictMapTab from './Tabs/DistrictMapTab';
import HealthOutcomesTab from './Tabs/HealthOutcomesTab';
import PopulationGroupsTab from './Tabs/PopulationGroupsTab';

const LeftPanel = ({
  activeTab,
  setActiveTab,
  viewMode,
  selectedDistrict,
  comparisonDistrict,
  selectedPopulationGroup,
  healthBehaviorsData,
  similarDistricts,
  districtGeoJson,
  populationGroupData,
  allRateData
}) => {
  
  // Simplified tab structure based on view mode
  const getTabsForMode = () => {
    const commonTabs = [
      { key: 'demographics', label: 'Demographics', icon: '👥' },
      { key: 'sdhe', label: 'Health Indicators', icon: '📊' },
      { key: 'map', label: 'District Map', icon: '🗺️' }
    ];

    if (viewMode === 'district') {
      return [
        ...commonTabs.slice(0, 2),
        { key: 'similar', label: 'Similar Districts', icon: '🏘️' },
        ...commonTabs.slice(2),
        { key: 'outcomes', label: 'Health Outcomes', icon: '🏥' }
      ];
    } else {
      return [
        ...commonTabs.slice(0, 2),
        { key: 'population', label: 'Population Equity', icon: '⚖️' },
        ...commonTabs.slice(2),
        { key: 'outcomes', label: 'Health Outcomes', icon: '🏥' }
      ];
    }
  };

  const tabs = getTabsForMode();

  const renderTabContent = () => {
    switch(activeTab) {
      case 'demographics':
        return (
          <DemographicsTab 
            selectedDistrict={selectedDistrict}
            comparisonDistrict={comparisonDistrict}
            viewMode={viewMode}
            selectedPopulationGroup={selectedPopulationGroup}
          />
        );
      
      case 'sdhe':
        return (
          <SDHETab 
            selectedDistrict={selectedDistrict}
            healthBehaviorsData={healthBehaviorsData}
            viewMode={viewMode}
            selectedPopulationGroup={selectedPopulationGroup}
          />
        );
      
      case 'similar':
        return (
          <SimilarDistrictsTab 
            selectedDistrict={selectedDistrict}
            similarDistricts={similarDistricts}
          />
        );
      
      case 'population':
        return (
          <PopulationGroupsTab 
            selectedDistrict={selectedDistrict}
            populationGroupData={populationGroupData}
            overallPopulationData={[]}
            selectedPopulationGroup={selectedPopulationGroup}
            allRateData={allRateData}
          />
        );
      
      case 'map':
        return (
          <DistrictMapTab 
            selectedDistrict={selectedDistrict}
            districtGeoJson={districtGeoJson}
            viewMode={viewMode}
          />
        );
      
      case 'outcomes':
        return (
          <HealthOutcomesTab 
            viewMode={viewMode}
            selectedPopulationGroup={selectedPopulationGroup}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Clean Header */}
      <div className="px-4 py-3 border-b bg-gray-50">
        <h3 className="font-medium text-gray-800">
          {viewMode === 'district' ? 'District Analysis' : 'Population Equity Analysis'}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          {viewMode === 'district' 
            ? `${selectedDistrict} vs ${comparisonDistrict}`
            : `${selectedDistrict} - Population Groups`
          }
        </p>
      </div>

      {/* Simplified Tab Navigation */}
      <div className="border-b">
        <div className="flex flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key 
                  ? 'bg-blue-600 text-white border-b-2 border-blue-600' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 h-80 overflow-y-auto">
        {renderTabContent()}
      </div>

      {/* Quick Actions Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <span>
            {viewMode === 'district' ? 'District Comparison Mode' : 'Population Equity Mode'}
          </span>
          <button 
            onClick={() => setViewMode(viewMode === 'district' ? 'population' : 'district')}
            className="text-blue-600 hover:text-blue-800"
          >
            Switch to {viewMode === 'district' ? 'Equity' : 'District'} Mode
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;