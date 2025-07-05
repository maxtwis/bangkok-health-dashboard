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
  viewMode, // 'district', 'population', or 'both'
  selectedDistrict,
  comparisonDistrict,
  selectedPopulationGroup,
  healthBehaviorsData,
  similarDistricts,
  districtGeoJson,
  populationGroupData,
  allRateData
}) => {
  
  // Define tabs based on view mode
  const getAvailableTabs = () => {
    const baseTabs = [
      { key: 'demographics', label: 'Demographics', color: 'bg-teal-600' },
      { key: 'sdhe', label: 'Social Determinants of Health', color: 'bg-teal-600' },
      { key: 'map', label: 'District Map', color: 'bg-teal-600' },
      { key: 'outcomes', label: 'Health Outcomes', color: 'bg-teal-600' }
    ];

    if (viewMode === 'district' || viewMode === 'both') {
      baseTabs.splice(2, 0, { key: 'similar', label: 'Most Similar Districts', color: 'bg-teal-600' });
    }
    
    if (viewMode === 'population' || viewMode === 'both') {
      baseTabs.splice(-2, 0, { key: 'population', label: 'Population Groups Equity', color: 'bg-green-600' });
    }

    return baseTabs;
  };

  const tabs = getAvailableTabs();

  // Auto-switch to appropriate tab when view mode changes
  React.useEffect(() => {
    if (viewMode === 'population' && activeTab === 'similar') {
      setActiveTab('population');
    } else if (viewMode === 'district' && activeTab === 'population') {
      setActiveTab('similar');
    }
  }, [viewMode, activeTab, setActiveTab]);

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
        if (viewMode === 'population') return null; // Hide in population mode
        return (
          <SimilarDistrictsTab 
            selectedDistrict={selectedDistrict}
            similarDistricts={similarDistricts}
          />
        );
      
      case 'population':
        if (viewMode === 'district') return null; // Hide in district mode
        return (
          <PopulationGroupsTab 
            selectedDistrict={selectedDistrict}
            populationGroupData={populationGroupData}
            overallPopulationData={[]} // Will be populated with actual data
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
      {/* View Mode Indicator */}
      <div className="px-4 py-2 border-b bg-gray-50">
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-3 h-3 rounded-full ${
            viewMode === 'district' ? 'bg-blue-500' :
            viewMode === 'population' ? 'bg-green-500' :
            'bg-purple-500'
          }`}></div>
          <span className="font-medium text-gray-700">
            {viewMode === 'district' && 'District Comparison'}
            {viewMode === 'population' && 'Population Equity Analysis'}
            {viewMode === 'both' && 'Combined Analysis'}
          </span>
        </div>
      </div>

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
              title={tab.label}
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

      {/* View Mode Help */}
      <div className="px-4 py-2 bg-gray-50 border-t text-xs text-gray-600">
        {viewMode === 'district' && (
          <p>💡 Switch to "Population Equity Analysis" to compare demographic groups within districts.</p>
        )}
        {viewMode === 'population' && (
          <p>💡 Switch to "District Comparison" to compare overall health between different districts.</p>
        )}
        {viewMode === 'both' && (
          <p>💡 Combined view shows both district comparisons and population equity analysis.</p>
        )}
      </div>
    </div>
  );
};

export default LeftPanel;