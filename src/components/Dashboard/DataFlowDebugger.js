import React, { useState, useEffect } from 'react';
import useBasicSDHEData from '../hooks/useBasicSDHEData';

const DataFlowDebugger = () => {
  const { isLoading, error, data, getAvailableDistricts, getAvailableDomains, getIndicatorData } = useBasicSDHEData();
  const [debugResults, setDebugResults] = useState(null);

  useEffect(() => {
    if (!isLoading && data && !error) {
      // Debug the specific data flow for district 1024
      const debug = debugDataFlow();
      setDebugResults(debug);
    }
  }, [isLoading, data, error]);

  const debugDataFlow = () => {
    console.log('🔍 Starting Data Flow Debug for District 1024...');
    
    // Step 1: Check available districts
    const availableDistricts = getAvailableDistricts();
    console.log('📋 Available Districts:', availableDistricts);
    
    // Step 2: Check if ราษฎร์บูรณะ is in the list
    const hasRatsadorn = availableDistricts.includes('ราษฎร์บูรณะ');
    console.log('🎯 Has ราษฎร์บูรณะ in district list:', hasRatsadorn);
    
    // Step 3: Check available domains
    const availableDomains = getAvailableDomains();
    console.log('📊 Available Domains:', availableDomains);
    
    // Step 4: Try to get data for each population group
    const populationGroups = ['informal_workers', 'elderly', 'disabled', 'lgbtq'];
    const testResults = {};
    
    populationGroups.forEach(group => {
      console.log(`\n🧑‍🤝‍🧑 Testing Population Group: ${group}`);
      
      availableDomains.forEach(domain => {
        console.log(`  📈 Testing Domain: ${domain}`);
        
        // Test with exact district name
        const indicatorData = getIndicatorData(domain, 'ราษฎร์บูรณะ', group);
        console.log(`    🔍 Indicator Data Length: ${indicatorData.length}`);
        
        if (indicatorData.length > 0) {
          const domainScore = indicatorData.find(item => item.isDomainScore);
          console.log(`    📊 Domain Score:`, domainScore);
          
          if (!testResults[group]) testResults[group] = {};
          testResults[group][domain] = {
            indicatorCount: indicatorData.length,
            domainScore: domainScore,
            sampleSize: domainScore?.sample_size
          };
        } else {
          console.log(`    ❌ No data found for ${group} in ${domain}`);
        }
      });
    });
    
    // Step 5: Check the raw SDHE results structure
    if (data?.processor) {
      console.log('\n🔧 Checking Raw SDHE Results Structure...');
      const processor = data.processor;
      const rawResults = processor.sdheResults;
      
      // Check if economic_security domain exists
      if (rawResults.economic_security) {
        console.log('✅ economic_security domain exists');
        
        // Check district level data
        const economicSecurityData = rawResults.economic_security;
        console.log('🏘️ Districts in economic_security:', Object.keys(economicSecurityData));
        
        // Check if ราษฎร์บูรณะ exists in any form
        const districtKeys = Object.keys(economicSecurityData);
        const ratsadornVariants = districtKeys.filter(key => 
          key.includes('ราษฎร์') || 
          key.includes('บูรณะ') || 
          key.includes('1024')
        );
        console.log('🔍 Possible ราษฎร์บูรณะ variants:', ratsadornVariants);
        
        // Check Bangkok Overall vs individual districts
        if (economicSecurityData['Bangkok Overall']) {
          console.log('✅ Bangkok Overall data exists');
          const bangkokData = economicSecurityData['Bangkok Overall'];
          console.log('👥 Population groups in Bangkok Overall:', Object.keys(bangkokData));
          
          if (bangkokData.informal_workers) {
            console.log('✅ Informal workers data in Bangkok Overall:', bangkokData.informal_workers);
          }
        }
        
        // Check specific district
        if (economicSecurityData['ราษฎร์บูรณะ']) {
          console.log('✅ ราษฎร์บูรณะ data exists');
          const districtData = economicSecurityData['ราษฎร์บูรณะ'];
          console.log('👥 Population groups in ราษฎร์บูรณะ:', Object.keys(districtData));
        } else {
          console.log('❌ ราษฎร์บูรณะ data does NOT exist');
        }
      }
    }
    
    return {
      availableDistricts,
      hasRatsadorn,
      availableDomains,
      testResults,
      totalDistricts: availableDistricts.length,
      timestamp: new Date().toLocaleTimeString()
    };
  };

  const retryDataLoad = () => {
    window.location.reload();
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-center">Loading SDHE data for debugging...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-red-600">Error loading data: {error}</p>
        <button onClick={retryDataLoad} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded">
          Retry
        </button>
      </div>
    );
  }

  if (!debugResults) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <p className="text-gray-600">Preparing debug analysis...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm space-y-6">
      <h2 className="text-xl font-bold text-gray-900">
        🔧 Data Flow Debug for District ราษฎร์บูรณะ
      </h2>
      <p className="text-sm text-gray-600">Debug completed at: {debugResults.timestamp}</p>
      
      {/* District List Check */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-3">📋 District Availability Check</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm"><strong>Total Districts:</strong> {debugResults.totalDistricts}</p>
            <p className="text-sm">
              <strong>Has ราษฎร์บูรณะ:</strong> 
              <span className={debugResults.hasRatsadorn ? 'text-green-600' : 'text-red-600'}>
                {debugResults.hasRatsadorn ? ' ✅ Yes' : ' ❌ No'}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm"><strong>Available Domains:</strong> {debugResults.availableDomains.length}</p>
            <p className="text-xs text-gray-600">{debugResults.availableDomains.join(', ')}</p>
          </div>
        </div>
      </div>

      {/* District List */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3">🏘️ All Available Districts</h3>
        <div className="max-h-40 overflow-y-auto bg-white p-3 rounded border text-sm">
          {debugResults.availableDistricts.map((district, index) => (
            <div key={index} className={`py-1 ${district === 'ราษฎร์บูรณะ' ? 'bg-yellow-100 font-bold' : ''}`}>
              {index + 1}. {district}
            </div>
          ))}
        </div>
      </div>

      {/* Test Results */}
      <div className="bg-green-50 p-4 rounded-lg">
        <h3 className="font-semibold text-green-900 mb-3">🧪 Data Retrieval Test Results</h3>
        {Object.keys(debugResults.testResults).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(debugResults.testResults).map(([group, domains]) => (
              <div key={group} className="bg-white p-3 rounded border">
                <h4 className="font-medium text-gray-800 mb-2">👥 {group}</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {Object.entries(domains).map(([domain, result]) => (
                    <div key={domain} className="text-xs">
                      <div className="font-medium">{domain}</div>
                      <div>Indicators: {result.indicatorCount}</div>
                      <div>Sample Size: {result.sampleSize || 'N/A'}</div>
                      <div className={result.domainScore ? 'text-green-600' : 'text-red-600'}>
                        Score: {result.domainScore?.value?.toFixed(1) || 'None'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-red-100 p-3 rounded border text-red-800">
            ❌ No data found for any population group in any domain for ราษฎร์บูรณะ
          </div>
        )}
      </div>

      {/* Next Steps */}
      <div className="bg-yellow-50 p-4 rounded-lg">
        <h3 className="font-semibold text-yellow-900 mb-3">🔍 Analysis & Next Steps</h3>
        <div className="text-sm space-y-2">
          {!debugResults.hasRatsadorn && (
            <p className="text-red-600">
              ❌ <strong>Issue Found:</strong> ราษฎร์บูรณะ is not in the available districts list from getAvailableDistricts()
            </p>
          )}
          {debugResults.hasRatsadorn && Object.keys(debugResults.testResults).length === 0 && (
            <p className="text-red-600">
              ❌ <strong>Issue Found:</strong> District exists in list but getIndicatorData() returns empty arrays
            </p>
          )}
          {debugResults.hasRatsadorn && Object.keys(debugResults.testResults).length > 0 && (
            <p className="text-green-600">
              ✅ <strong>Data Found:</strong> Some population groups have data for ราษฎร์บูรณะ
            </p>
          )}
          
          <div className="mt-3 p-3 bg-white rounded border">
            <p className="font-medium">Recommended Actions:</p>
            <ul className="list-disc list-inside text-xs mt-1 space-y-1">
              <li>Check the district name mapping in BasicSDHEProcessor.js</li>
              <li>Verify the population group classification logic</li>
              <li>Check if minimum sample size requirements are filtering out the data</li>
              <li>Examine the SDHE results structure in the processor</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Console Instructions */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">📝 Console Output</h3>
        <p className="text-sm text-blue-800">
          Check your browser console for detailed debug logs. This will show exactly where the data flow breaks.
        </p>
      </div>
    </div>
  );
};

export default DataFlowDebugger;