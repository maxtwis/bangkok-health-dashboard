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
  const [colorScale, setColorScale] = useState({ breaks: [], colors: [] });

  // Function to calculate dynamic color scale based on data distribution
  const calculateColorScale = (values) => {
    if (!values || values.length === 0) {
      return {
        breaks: [0, 5, 10, 15, 20, 25],
        colors: ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026']
      };
    }

    // Remove null/undefined values and sort
    const validValues = values.filter(v => v !== null && v !== undefined && !isNaN(v)).sort((a, b) => a - b);
    
    if (validValues.length === 0) {
      return {
        breaks: [0, 5, 10, 15, 20, 25],
        colors: ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026']
      };
    }

    const min = validValues[0];
    const max = validValues[validValues.length - 1];
    
    // If all values are the same or very close, create a simple scale
    if (max - min < 0.1) {
      const baseValue = Math.floor(min);
      return {
        breaks: [baseValue, baseValue + 1, baseValue + 2, baseValue + 3, baseValue + 4, baseValue + 5],
        colors: ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026']
      };
    }

    // Calculate percentiles for more meaningful breaks
    const getPercentile = (arr, percentile) => {
      const index = (percentile / 100) * (arr.length - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      if (lower === upper) return arr[lower];
      return arr[lower] * (upper - index) + arr[upper] * (index - lower);
    };

    // Create breaks based on data distribution
    const breaks = [
      Math.floor(min * 10) / 10, // Round down to 1 decimal
      Math.round(getPercentile(validValues, 20) * 10) / 10,
      Math.round(getPercentile(validValues, 40) * 10) / 10,
      Math.round(getPercentile(validValues, 60) * 10) / 10,
      Math.round(getPercentile(validValues, 80) * 10) / 10,
      Math.ceil(max * 10) / 10 // Round up to 1 decimal
    ];

    // Ensure breaks are unique and increasing
    const uniqueBreaks = [...new Set(breaks)].sort((a, b) => a - b);
    
    // If we have fewer than 6 unique breaks, interpolate
    while (uniqueBreaks.length < 6) {
      for (let i = 0; i < uniqueBreaks.length - 1; i++) {
        const mid = (uniqueBreaks[i] + uniqueBreaks[i + 1]) / 2;
        if (mid !== uniqueBreaks[i] && mid !== uniqueBreaks[i + 1]) {
          uniqueBreaks.splice(i + 1, 0, Math.round(mid * 10) / 10);
          break;
        }
      }
      if (uniqueBreaks.length >= 6) break;
      // If we can't add more breaks, just duplicate the last one
      uniqueBreaks.push(uniqueBreaks[uniqueBreaks.length - 1] + 0.1);
    }

    return {
      breaks: uniqueBreaks.slice(0, 6),
      colors: ['#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026']
    };
  };

  // Function to get color based on value and current color scale
  const getColor = (value, scale) => {
    if (value === null || value === undefined || isNaN(value)) return '#ccc';
    
    const { breaks, colors } = scale;
    
    for (let i = breaks.length - 1; i >= 0; i--) {
      if (value >= breaks[i]) {
        return colors[i] || colors[colors.length - 1];
      }
    }
    return colors[0];
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
  const updateLegend = async (scale) => {
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
        const { breaks, colors } = scale;

        // Add legend title based on selected indicator
        const unit = selectedIndicator === 'traffic_death_rate' ? 'per 100,000' : '%';
        div.innerHTML = `<h4>${indicatorName} (${unit})</h4>`;
        
        // Add colored squares for each interval
        for (let i = 0; i < breaks.length; i++) {
          const color = colors[i] || colors[colors.length - 1];
          const nextBreak = breaks[i + 1];
          
          div.innerHTML +=
            '<i style="background:' + color + '"></i> ' +
            breaks[i] + (nextBreak !== undefined ? '&ndash;' + nextBreak + '<br>' : '+');
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
      const yearData = rateData.filter(d => d.year === selectedYear);
      
      yearData.forEach(d => {
        districtValues[d.dcode] = d.value;
      });

      // Calculate dynamic color scale based on current year's data
      const allValues = Object.values(districtValues);
      const currentColorScale = calculateColorScale(allValues);
      setColorScale(currentColorScale);

      console.log('District values for year', selectedYear, ':', districtValues);
      console.log('Color scale:', currentColorScale);
      console.log('GeoJSON features count:', geoJsonData.features.length);

      // Add new GeoJSON layer
      geoJsonLayerRef.current = L.geoJSON(geoJsonData, {
        style: (feature) => {
          const dcode = feature.properties.dcode;
          const value = districtValues[dcode];
          return {
            fillColor: value !== undefined ? getColor(value, currentColorScale) : '#ccc',
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
          const unit = selectedIndicator === 'traffic_death_rate' ? ' per 100,000' : '%';
          
          // Add tooltip
          layer.bindTooltip(
            `<strong>${feature.properties.dname}</strong><br>` +
            `${indicatorName}: ${value !== undefined ? value.toFixed(2) + unit : 'No data'}`
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
      
      // Update legend with new color scale
      updateLegend(currentColorScale);
      
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