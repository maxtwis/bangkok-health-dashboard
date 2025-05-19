import { useState, useEffect } from 'react';
import simulateGeoJsonLoading from '../utils/loadGeoJsonTest';

const useGeoJsonData = () => {
  const [districtGeoJson, setDistrictGeoJson] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadGeoJsonData = async () => {
      try {
        setIsLoading(true);
        
        let geoJsonData = null;

        try {
          // Fetch the GeoJSON file from the public folder
          const response = await fetch('/district.geojson');
          
          if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
          }
          
          geoJsonData = await response.json();
          console.log("Successfully loaded GeoJSON from public folder");
        } catch (fetchError) {
          console.warn('Could not load GeoJSON from public folder, using simulated data instead:', fetchError);
          
          // Use the simulated data as a fallback
          geoJsonData = await simulateGeoJsonLoading();
          
          if (!geoJsonData) {
            throw new Error('Failed to load GeoJSON data from both public folder and simulation');
          }
          
          console.log("Using simulated GeoJSON data");
        }
        
        setDistrictGeoJson(geoJsonData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading GeoJSON data:', err);
        setError('Failed to load district map data. Please ensure district.geojson is in the public folder.');
        setIsLoading(false);
      }
    };

    loadGeoJsonData();
  }, []);

  return { districtGeoJson, isLoading, error };
};

export default useGeoJsonData;