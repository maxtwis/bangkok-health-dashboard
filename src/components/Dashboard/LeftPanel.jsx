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
  analysisLevel, // 'bangkok' or 'district'
  selectedDistrict,
  selectedPopulationGroup,
  healthBehaviorsData,
  districtGeoJson,
  populationGroupData,
  allRateData
}) => {
  
  // Simplified tab structure using existing tabs
  const getBangkokTabs = () => [
    { key: 'population-groups', label: 'Population Groups', icon: '⚖️' },
    { key: 'sdhe', label: 'SDHE Overview', icon: '📊' },
    { key: 'demographics', label: 'Demographics', icon: '👥' }
  ];

  const getDistrictTabs = () => [
    { key: 'demographics', label: 'Demographics', icon: '👥' },
    { key: 'sdhe', label: 'SDHE Detailed', icon: '📋' },
    { key: 'population-groups', label: 'Population Groups', icon: '⚖️' },
    { key: 'similar', label: 'Similar Districts', icon: '🏘️' },
    { key: 'map', label: 'District Map', icon: '🗺️' },
    { key: 'outcomes', label: 'Health Outcomes', icon: '🏥' }
  ];

  const tabs = analysisLevel === 'bangkok' ? getBangkokTabs() : getDistrictTabs();

  // Auto-select appropriate first tab when switching levels
  React.useEffect(() => {
    if (analysisLevel === 'bangkok' && !['population-groups', 'sdhe', 'demographics'].includes(activeTab)) {
      setActiveTab('population-groups');
    } else if (analysisLevel === 'district' && !['demographics', 'sdhe', 'population-groups', 'similar', 'map', 'outcomes'].includes(activeTab)) {
      setActiveTab('demographics');
    }
  }, [analysisLevel, activeTab, setActiveTab]);

  const renderTabContent = () => {
    switch(activeTab) {
      case 'demographics':
        return (
          <DemographicsTab 
            selectedDistrict={selectedDistrict}
            comparisonDistrict={selectedDistrict} // Use same district for Bangkok level
            viewMode={analysisLevel === 'bangkok' ? 'population' : 'district'}
            selectedPopulationGroup={selectedPopulationGroup}
          />
        );
      
      case 'sdhe':
        return (
          <SDHETab 
            selectedDistrict={selectedDistrict}
            healthBehaviorsData={healthBehaviorsData}
            viewMode={analysisLevel === 'bangkok' ? 'population' : 'district'}
            selectedPopulationGroup={selectedPopulationGroup}
          />
        );
      
      case 'population-groups':
        return (
          <PopulationGroupsTab 
            selectedDistrict={analysisLevel === 'bangkok' ? 'Bangkok' : selectedDistrict}
            populationGroupData={populationGroupData}
            overallPopulationData={[]}
            selectedPopulationGroup={selectedPopulationGroup}
            allRateData={allRateData}
          />
        );
      
      case 'similar':
        // Only available for district level
        if (analysisLevel === 'district') {
          return (
            <SimilarDistrictsTab 
              selectedDistrict={selectedDistrict}
              similarDistricts={[]} // You can pass actual similar districts data here
            />
          );
        }
        return null;
      
      case 'map':
        return (
          <DistrictMapTab 
            selectedDistrict={selectedDistrict}
            districtGeoJson={districtGeoJson}
            viewMode={analysisLevel}
          />
        );
      
      case 'outcomes':
        return (
          <HealthOutcomesTab 
            viewMode={analysisLevel}
            selectedPopulationGroup={selectedPopulationGroup}
          />
        );
      
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            <p>Select a tab to view analysis</p>
          </div>
        );
    }
  };

  const getPopulationGroupLabel = (populationGroup) => {
    const labels = {
      'informal_workers': 'แรงงานนอกระบบ',
      'elderly': 'ผู้สูงอายุ',
      'disabled': 'คนพิการ', 
      'lgbtq': 'กลุ่มเพศหลากหลาย'
    };
    return labels[populationGroup] || populationGroup;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header with Context */}
      <div className="px-4 py-3 border-b">
        <div className="flex items-center space-x-2 mb-1">
          <div className={`w-3 h-3 rounded-full ${
            analysisLevel === 'bangkok' ? 'bg-blue-500' : 'bg-green-500'
          }`}></div>
          <h3 className="font-medium text-gray-800">
            {analysisLevel === 'bangkok' ? 'Bangkok Overview' : 'District Deep Dive'}
          </h3>
        </div>
        <p className="text-sm text-gray-600">
          {analysisLevel === 'bangkok' 
            ? `${getPopulationGroupLabel(selectedPopulationGroup)} across 50 districts`
            : `${selectedDistrict} - ${getPopulationGroupLabel(selectedPopulationGroup)}`
          }
        </p>
        <div className="mt-2 text-xs text-gray-500">
          {analysisLevel === 'bangkok' 
            ? '📊 4,000 surveys • 🎯 Population equity focus'
            : '📍 Local data • 🔬 Comprehensive indicators'
          }
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <div className="flex flex-wrap">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-0 px-3 py-3 text-xs font-medium transition-colors ${
                activeTab === tab.key 
                  ? `${analysisLevel === 'bangkok' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}` 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <div className="flex flex-col items-center space-y-1">
                <span className="text-base">{tab.icon}</span>
                <span className="text-center leading-tight">{tab.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4 h-80 overflow-y-auto">
        {renderTabContent()}
      </div>

      {/* Footer with Level Info */}
      <div className="px-4 py-3 bg-gray-50 border-t">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-500">
            {analysisLevel === 'bangkok' ? 'Bangkok-wide Analysis' : 'District-specific Analysis'}
          </span>
          <button 
            onClick={() => setAnalysisLevel(analysisLevel === 'bangkok' ? 'district' : 'bangkok')}
            className={`px-2 py-1 rounded text-xs font-medium ${
              analysisLevel === 'bangkok' 
                ? 'text-green-600 hover:text-green-800 hover:bg-green-50' 
                : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
            }`}
          >
            Switch to {analysisLevel === 'bangkok' ? 'District Level' : 'Bangkok Level'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeftPanel;