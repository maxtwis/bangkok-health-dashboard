// src/utils/loadGeoJsonTest.js
// This is a utility for testing the GeoJSON loading functionality
// You can use this to simulate loading the GeoJSON file from window.fs

const simulateGeoJsonLoading = async () => {
  try {
    // This would normally come from: const response = await window.fs.readFile('district.geojson', { encoding: 'utf8' });
    // For testing purposes, if the file isn't available, you can use this sample data
    const sampleGeoJsonData = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "properties": {
            "FID": 0,
            "OBJECTID_1": 1,
            "dcode": 1012,
            "dname": "ยานนาวา"
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [100.5, 13.7],
                [100.52, 13.7],
                [100.52, 13.72],
                [100.5, 13.72],
                [100.5, 13.7]
              ]
            ]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "FID": 1,
            "OBJECTID_1": 2,
            "dcode": 1013,
            "dname": "สาทร"
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [100.51, 13.71],
                [100.53, 13.71],
                [100.53, 13.73],
                [100.51, 13.73],
                [100.51, 13.71]
              ]
            ]
          }
        },
        {
          "type": "Feature",
          "properties": {
            "FID": 2,
            "OBJECTID_1": 3,
            "dcode": 1014,
            "dname": "บางคอแหลม"
          },
          "geometry": {
            "type": "Polygon",
            "coordinates": [
              [
                [100.52, 13.69],
                [100.54, 13.69],
                [100.54, 13.71],
                [100.52, 13.71],
                [100.52, 13.69]
              ]
            ]
          }
        }
      ]
    };
    
    return sampleGeoJsonData;
  } catch (err) {
    console.error('Error in simulated GeoJSON loading:', err);
    return null;
  }
};

export default simulateGeoJsonLoading;