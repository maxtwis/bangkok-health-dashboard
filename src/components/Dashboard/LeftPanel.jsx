import React from 'react';
import BangkokPopulationEquityTab from './Tabs/BangkokPopulationEquityTab';
import BangkokSDHEOverviewTab from './Tabs/BangkokSDHEOverviewTab';
import BangkokInsightsTab from './Tabs/BangkokInsightsTab';
import DistrictDemographicsTab from './Tabs/DistrictDemographicsTab';
import DistrictSDHETab from './Tabs/DistrictSDHETab';
import DistrictHealthOutcomesTab from './Tabs/DistrictHealthOutcomesTab';
import DistrictAccessibilityTab from './Tabs/DistrictAccessibilityTab';
import DistrictMapTab from './Tabs/DistrictMapTab';

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
  
  // Different tab sets for Bangkok vs District level
  const getBangkokTabs = () => [
    { key: 'population-equity', label: 'Population Groups', icon: '⚖️', description: 'Compare 4 groups across Bangkok' },
    { key: 'sdhe-overview', label: 'SDHE Overview', icon: '📊', description: 'Health determinants summary' },
    { key: 'insights', label: 'Key Insights', icon: '💡', description: 'Automated insights & recommendations' }
  ];

  const getDistrictTabs = () => [
    { key: 'demographics', label: 'Demographics', icon: '👥', description: 'Population characteristics' },
    { key: 'sdhe-detailed', label: 'SDHE Detailed', icon: '📋', description: 'All health determinants' },
    { key: 'health-outcomes', label: 'Health Outcomes', icon: '🏥', description: 'Disease rates & mortality' },
    { key: 'accessibility', label: 'Accessibility', icon: '🏢', description: 'Health, parks, schools access' },
    { key: 'district-map', label: 'District Map', icon: '🗺️', description: 'Geographic visualization' }
  ];

  const tabs = analysisLevel === 'bangkok' ? getBangkokTabs() : getDistrictTabs();

  // Auto-select appropriate first tab when switching levels
  React.useEffect(() => {
    if (analysisLevel === 'bangkok' && !['population-equity', 'sdhe-overview', 'insights'].includes(activeTab)) {
      setActiveTab('population-equity');
    } else if (analysisLevel === 'district' && !['demographics', 'sdhe-detailed', 'health-outcomes', 'accessibility', 'district-map'].includes(activeTab)) {
      setActiveTab('demographics');
    }
  }, [analysisLevel, activeTab, setActiveTab]);

  const renderTabContent = () => {
    switch(activeTab) {
      // Bangkok Level Tabs
      case 'population-equity':
        return (
          <BangkokPopulationEquityTab 
            selectedPopulationGroup={selectedPopulationGroup}
            populationGroupData={populationGroupData}
            allRateData={allRateData}
          />
        );
      
      case 'sdhe-overview':
        return (
          <BangkokSDHEOverviewTab 
            selectedPopulationGroup={selectedPopulationGroup}
            healthBehaviorsData={healthBehaviorsData}
          />
        );
      
      case 'insights':
        return (
          <BangkokInsightsTab 
            selectedPopulationGroup={selectedPopulationGroup}
            populationGroupData={populationGroupData}
          />
        );

      // District Level Tabs
      case 'demographics':
        return (
          <DistrictDemographicsTab 
            selectedDistrict={selectedDistrict}
            selectedPopulationGroup={selectedPopulationGroup}
          />
        );
      
      case 'sdhe-detailed':
        return (
          <DistrictSDHETab 
            selectedDistrict={selectedDistrict}
            selectedPopulationGroup={selectedPopulationGroup}
            healthBehaviorsData={healthBehaviorsData}
          />
        );
      
      case 'health-outcomes':
        return (
          <DistrictHealthOutcomesTab 
            selectedDistrict={selectedDistrict}
            selectedPopulationGroup={selectedPopulationGroup}
          />
        );

      case 'accessibility':
        return (
          <DistrictAccessibilityTab 
            selectedDistrict={selectedDistrict}
            selectedPopulationGroup={selectedPopulationGroup}
          />
        );
      
      case 'district-map':
        return (
          <DistrictMapTab 
            selectedDistrict={selectedDistrict}
            districtGeoJson={districtGeoJson}
            analysisLevel={analysisLevel}
          />
        );
      
      default:
        return null;
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
              className={`group flex-1 min-w-0 px-3 py-3 text-xs font-medium transition-colors ${
                activeTab === tab.key 
                  ? `${analysisLevel === 'bangkok' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}` 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
              title={tab.description}
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