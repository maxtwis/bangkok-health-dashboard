import React from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import useSDHEData from '../hooks/useSDHEData';
import IndicatorDetail from '../components/Dashboard/IndicatorDetail';
import { LoadingScreen } from '../components/Loading/LoadingSpinner';
import { getDataState } from '../utils/dashboardUtils';

const IndicatorDetailPage = () => {
  const navigate = useNavigate();
  const { indicator } = useParams();
  const [searchParams] = useSearchParams();
  
  // Get URL parameters
  const domain = searchParams.get('domain') || 'economic_security';
  const district = searchParams.get('district') || 'Bangkok Overall';
  const group = searchParams.get('group') || 'all';
  
  const { 
    isLoading, 
    error, 
    data,
    surveyData,
    healthFacilitiesData,
    getIndicatorData 
  } = useSDHEData();

  const dataState = React.useMemo(() => 
    getDataState(isLoading, error, data), 
    [isLoading, error, data]
  );

  const handleBack = () => {
    navigate(`/analysis?domain=${domain}&district=${district}&group=${group}`);
  };

  // Loading state
  if (dataState.isLoading) {
    return <LoadingScreen message="Loading indicator details..." />;
  }

  // Error state
  if (dataState.hasError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Data</h3>
          <p className="text-sm text-gray-500 mb-6">{error}</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to Analysis
          </button>
        </div>
      </div>
    );
  }

  return (
    <IndicatorDetail
      indicator={indicator}
      domain={domain}
      district={district}
      populationGroup={group}
      onBack={handleBack}
      getIndicatorData={getIndicatorData}
      surveyData={surveyData}
      healthFacilitiesData={healthFacilitiesData}
    />
  );
};

export default IndicatorDetailPage;