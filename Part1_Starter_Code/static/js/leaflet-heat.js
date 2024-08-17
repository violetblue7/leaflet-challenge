function createHeatLayer(data) {
    let heatArray = [];
    
    data.features.forEach(function(feature) {
        let lat = feature.geometry.coordinates[1];
        let lng = feature.geometry.coordinates[0];
        let magnitude = feature.properties.mag;
        heatArray.push([lat, lng, magnitude]);
    });
    
    return L.heatLayer(heatArray, {
        radius: 25,
        blur: 15,
        maxZoom: 17,
    });
}
