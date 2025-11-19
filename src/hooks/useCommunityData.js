import { useState, useEffect } from 'react';
import Papa from 'papaparse';

const useCommunityData = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/data/community_data.csv');

        if (!response.ok) {
          throw new Error(`Failed to load community data: ${response.statusText}`);
        }

        const csvText = await response.text();

        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true,
          transformHeader: (header) => {
            // Normalize header names
            return header.trim();
          },
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('CSV parsing warnings:', results.errors);
            }

            // Process and clean data
            const processedData = results.data.map(row => ({
              ...row,
              // Ensure numeric fields are properly typed
              age: parseInt(row.age) || 0,
              disable_status: parseInt(row.disable_status) || 0,
              occupation_status: parseInt(row.occupation_status) || 0,
              occupation_contract: parseInt(row.occupation_contract) || 0,
              occupation_type: parseInt(row.occupation_type) || 0,
              welfare: row.welfare === 'other' ? 'other' : parseInt(row.welfare) || null,
              oral_health_access: parseInt(row.oral_health_access) || 0,
              medical_skip_1: parseInt(row.medical_skip_1) || 0,
              medical_skip_2: parseInt(row.medical_skip_2) || 0,
              medical_skip_3: parseInt(row.medical_skip_3) || 0,
              house_status: parseInt(row.house_status) || 0,
              community_environment_3: parseInt(row.community_environment_3) || 0,
              community_disaster_1: parseInt(row.community_disaster_1) || 0,
              community_disaster_2: parseInt(row.community_disaster_2) || 0,
              community_disaster_3: parseInt(row.community_disaster_3) || 0,
              community_disaster_4: parseInt(row.community_disaster_4) || 0,
              community_disaster_5: parseInt(row.community_disaster_5) || 0,
              community_disaster_6: parseInt(row.community_disaster_6) || 0,
              community_disaster_7: parseInt(row.community_disaster_7) || 0,
              community_disaster_8: parseInt(row.community_disaster_8) || 0,
              helper: parseInt(row.helper) || 0,
              discrimination_1: parseInt(row.discrimination_1) || 0,
              discrimination_2: parseInt(row.discrimination_2) || 0,
              discrimination_3: parseInt(row.discrimination_3) || 0,
              discrimination_4: parseInt(row.discrimination_4) || 0,
              discrimination_5: parseInt(row.discrimination_5) || 0,
              discrimination_other: parseInt(row.discrimination_other) || 0,
              physical_violence: parseInt(row.physical_violence) || 0,
              psychological_violence: parseInt(row.psychological_violence) || 0,
              sexual_violence: parseInt(row.sexual_violence) || 0,
              exercise_status: parseInt(row.exercise_status) || 0,
              smoke_status: parseInt(row.smoke_status) || 0,
              drink_status: parseInt(row.drink_status) || 0,
              diseases_status: parseInt(row.diseases_status) || 0,
              diseases_type_1: parseInt(row.diseases_type_1) || 0,
              diseases_type_2: parseInt(row.diseases_type_2) || 0,
              food_insecurity_1: parseInt(row.food_insecurity_1) || 0,
              food_insecurity_2: parseInt(row.food_insecurity_2) || 0,
              // Keep string fields as is
              dname: row.dname,
              community_name: row.community_name,
              sex: row.sex
            }));

            setData(processedData);
            setLoading(false);
          },
          error: (error) => {
            console.error('CSV parsing error:', error);
            setError(`Error parsing CSV: ${error.message}`);
            setLoading(false);
          }
        });

      } catch (err) {
        console.error('Error loading community data:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    loadCommunityData();
  }, []);

  return { data, loading, error };
};

export default useCommunityData;
