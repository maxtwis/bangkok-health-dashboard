import React, { useRef, useEffect, useState } from 'react';

const DistrictMapTab = ({ selectedDistrict, districtGeoJson }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        if (!mapRef.current || mapInstanceRef.current) return;

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

        // Create map instance
        const mapInstance = L.map(mapRef.current, {
          center: [13.7563, 100.5018], // Bangkok coordinates
          zoom: 11,
          zoomControl: true,
        });

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance);

        // Add GeoJSON if available
        if (districtGeoJson && districtGeoJson.features) {
          const geoJsonLayer = L.geoJSON(districtGeoJson, {
            style: (feature) => ({
              fillColor: feature.properties.dname === selectedDistrict ? '#059669' : '#e5e7eb',
              weight: 2,
              opacity: 1,
              color: 'white',
              dashArray: '3',
              fillOpacity: feature.properties.dname === selectedDistrict ? 0.8 : 0.4
            }),
            onEachFeature: (feature, layer) => {
              layer.bindTooltip(
                `<strong>${feature.properties.dname}</strong>`,
                { permanent: false, direction: 'top' }
              );

              layer.on({
                mouseover: (e) => {
                  const layer = e.target;
                  layer.setStyle({
                    weight: 3,
                    color: '#666',
                    fillOpacity: 0.9
                  });
                },
                mouseout: (e) => {
                  geoJsonLayer.resetStyle(e.target);
                }
              });
            }
          }).addTo(mapInstance);

          // Fit map to Bangkok bounds
          mapInstance.fitBounds(geoJsonLayer.getBounds());

          // Highlight selected district
          if (selectedDistrict) {
            const selectedFeature = districtGeoJson.features.find(
              f => f.properties.dname === selectedDistrict
            );
            if (selectedFeature) {
              const selectedLayer = L.geoJSON(selectedFeature, {
                style: {
                  fillColor: '#059669',
                  weight: 3,
                  opacity: 1,
                  color: '#047857',
                  fillOpacity: 0.8
                }
              }).addTo(mapInstance);
              
              mapInstance.fitBounds(selectedLayer.getBounds(), { padding: [20, 20] });
            }
          }
        }

        mapInstanceRef.current = mapInstance;
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedDistrict, districtGeoJson]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium mb-3">District Map</h3>
      
      <div className="bg-blue-50 p-3 rounded border border-blue-200 mb-4">
        <p className="text-sm text-blue-600">
          Interactive map showing <strong>{selectedDistrict}</strong> district highlighted in green.
        </p>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-75 z-10 rounded">
            <p className="text-sm text-gray-600">Loading map...</p>
          </div>
        )}
        
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-100 bg-opacity-75 z-10 rounded">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        
        <div 
          ref={mapRef} 
          className="h-64 w-full rounded border border-gray-200" 
          style={{ minHeight: '250px' }}
        />
      </div>

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded">
        <h4 className="font-medium text-gray-700 mb-2">Map Information</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Green highlighted area shows the selected district</li>
          <li>• Hover over districts to see their names</li>
          <li>• Use mouse wheel or controls to zoom in/out</li>
          <li>• Drag to pan around the map</li>
        </ul>
      </div>
    </div>
  );
};

export default DistrictMapTab;