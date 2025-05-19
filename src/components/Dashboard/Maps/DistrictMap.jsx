import React, { useEffect, useState, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import './LeafletMapStyles.css';

const DistrictMap = ({ 
  geoJsonData, 
  rateData, 
  selectedYear, 
  selectedIndicator,
  indicatorName
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);
  const legendRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  // Function to get color based on value
  const getColor = (value) => {
    return value > 25 ? '#800026' :
           value > 20 ? '#BD0026' :
           value > 15 ? '#E31A1C' :
           value > 10 ? '#FC4E2A' :
           value > 7.5 ? '#FD8D3C' :
           value > 5 ? '#FEB24C' :
           value > 2.5 ? '#FED976' :
                    '#FFEDA0';
  };

  // Initialize map only once
  useEffect(() => {
    let mapInstance = null;
    
    const initMap = async () => {
      try {
        if (mapInstanceRef.current) {
          console.log('Map already initialized, skipping initialization');
          setIsLoading(false);
          setMapReady(true);
          return;
        }

        if (!mapRef.current) {
          console.log('Map container not available');
          return;
        }

        setIsLoading(true);
        setError(null);

        // Import Leaflet dynamically
        const L = await import('leaflet');
        
        // Fix Leaflet's icon paths
        delete L.Icon.Default.prototype._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        // Create new map instance
        console.log('Creating new map instance');
        
        // First, check if a Leaflet map is already attached to this DOM element
        if (mapRef.current._leaflet_id) {
          console.log('Detected existing Leaflet instance, destroying it first');
          mapRef.current._leaflet_id = null;
        }
        
        mapInstance = L.map(mapRef.current, {
          center: [13.7563, 100.5018], // Bangkok coordinates
          zoom: 10,
          zoomControl: true,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        // Store map instance in ref
        mapInstanceRef.current = mapInstance;
        
        console.log('Map initialized successfully');
        setIsLoading(false);
        setMapReady(true); // Mark map as ready for GeoJSON
      } catch (err) {
        console.error('Error initializing map:', err);
        setError(`Error initializing map: ${err.message}`);
        setIsLoading(false);
      }
    };
    
    initMap();
    
    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        console.log('Cleaning up map');
        // Remove existing layers to avoid duplicates
        if (geoJsonLayerRef.current) {
          geoJsonLayerRef.current.remove();
          geoJsonLayerRef.current = null;
        }
        
        if (legendRef.current) {
          legendRef.current.remove();
          legendRef.current = null;
        }
        
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setMapReady(false);
      }
    };
  }, []); // Empty dependency array ensures this only runs once

  // Create or update the legend
  const updateLegend = async () => {
    if (!mapInstanceRef.current) return;
    
    try {
      const L = await import('leaflet');
      
      // Remove existing legend if it exists
      if (legendRef.current) {
        legendRef.current.remove();
        legendRef.current = null;
      }

      // Create new legend
      const legend = L.control({ position: 'bottomright' });

      legend.onAdd = () => {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = [0, 2.5, 5, 7.5, 10, 15, 20, 25];

        // Add legend title based on selected indicator
        div.innerHTML = `<h4>${indicatorName} (%)</h4>`;
        
        // Add colored squares for each interval
        for (let i = 0; i < grades.length; i++) {
          div.innerHTML +=
            '<i style="background:' + getColor(grades[i] + 0.1) + '"></i> ' +
            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
      };

      legend.addTo(mapInstanceRef.current);
      legendRef.current = legend;
      
    } catch (error) {
      console.error('Error updating legend:', error);
    }
  };
  
  // Function to update GeoJSON layer
  const updateGeoJsonLayer = async () => {
    if (!mapInstanceRef.current || !geoJsonData || !rateData || !selectedYear) {
      console.log('Missing data for GeoJSON update:', {
        map: !!mapInstanceRef.current,
        geoJson: !!geoJsonData,
        rateData: !!rateData,
        year: selectedYear
      });
      return;
    }

    try {
      console.log('Updating GeoJSON layer with year:', selectedYear, 'and indicator:', selectedIndicator);
      const L = await import('leaflet');
      
      // Remove existing GeoJSON layer if it exists
      if (geoJsonLayerRef.current) {
        geoJsonLayerRef.current.remove();
        geoJsonLayerRef.current = null;
      }
      
      // Create a mapping of district codes to rate values for the selected year
      const districtValues = {};
      rateData
        .filter(d => d.year === selectedYear)
        .forEach(d => {
          districtValues[d.dcode] = d.value;
        });

      console.log('District values for year', selectedYear, ':', districtValues);
      console.log('GeoJSON features count:', geoJsonData.features.length);

      // Add new GeoJSON layer
      geoJsonLayerRef.current = L.geoJSON(geoJsonData, {
        style: (feature) => {
          const dcode = feature.properties.dcode;
          const value = districtValues[dcode];
          return {
            fillColor: value !== undefined ? getColor(value) : '#ccc',
            weight: 2,
            opacity: 1,
            color: 'white',
            dashArray: '3',
            fillOpacity: 0.7
          };
        },
        onEachFeature: (feature, layer) => {
          const dcode = feature.properties.dcode;
          const value = districtValues[dcode];
          
          // Add tooltip
          layer.bindTooltip(
            `<strong>${feature.properties.dname}</strong><br>` +
            `${indicatorName}: ${value !== undefined ? value.toFixed(2) + '%' : 'No data'}`
          );

          // Add hover interactions
          layer.on({
            mouseover: (e) => {
              const layer = e.target;
              layer.setStyle({
                weight: 5,
                color: '#666',
                dashArray: '',
                fillOpacity: 0.9
              });
              if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
                layer.bringToFront();
              }
            },
            mouseout: (e) => {
              geoJsonLayerRef.current.resetStyle(e.target);
            },
            click: (e) => {
              mapInstanceRef.current.fitBounds(e.target.getBounds());
            }
          });
        }
      }).addTo(mapInstanceRef.current);

      console.log('GeoJSON layer added successfully');

      // Fit map to GeoJSON bounds
      const bounds = geoJsonLayerRef.current.getBounds();
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds);
      }
      
      // Update legend
      updateLegend();
      
    } catch (error) {
      console.error('Error updating GeoJSON layer:', error);
    }
  };

  // Effect for first-time rendering of GeoJSON after map is ready
  useEffect(() => {
    if (mapReady && selectedYear) {
      console.log('Map is ready and year is selected, doing initial GeoJSON render');
      updateGeoJsonLayer();
    }
  }, [mapReady, selectedYear, selectedIndicator]); 

  // Update GeoJSON data when selected year or indicator changes
  useEffect(() => {
    if (mapReady && selectedYear) {
      console.log('Selected year or indicator changed, updating map');
      updateGeoJsonLayer();
    }
  }, [selectedYear, selectedIndicator]); // Respond to year and indicator changes

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10">
          <p className="text-lg">Loading map...</p>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75 z-10">
          <p className="text-lg text-red-600">{error}</p>
        </div>
      )}
      
      <div 
        ref={mapRef} 
        className="h-96 w-full rounded-lg shadow-md" 
        style={{ 
          minHeight: '400px',
          zIndex: 0 
        }}
      />
      
      <div className="absolute bottom-2 left-2 z-10 bg-white p-2 rounded shadow text-sm">
        Year: {selectedYear ? selectedYear - 543 : ''} (B.E. {selectedYear})
      </div>
    </div>
  );
};

export default DistrictMap;