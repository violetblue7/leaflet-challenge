// Initialize the map
let map = L.map('map').setView([0, 0], 2);

// Base layers
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
});

// Add the street map as the default base layer
street.addTo(map);

// Create layers for markers, circles, heatmap, and tectonic plates
let markers = L.markerClusterGroup();
let circleArray = [];
let tectonicPlatesLayer;

// Base layers
let baseLayers = {
    "Street Map": street,
    "Topographic Map": topo
};

// Overlay layers
let overlayLayers = {};

// Function to get color based on depth
function getColor(depth) {
    return depth > 90 ? '#FF0000' :        
           depth > 70 ? '#FF4500' :        
           depth > 50 ? '#FF8C00' :         
           depth > 30 ? '#FFD700' :         
           depth > 10 ? '#9ACD32' :         
           depth > -10 ? '#00FF7F' :       
                        '#ADD8E6';         
}

// Function to get radius based on magnitude
function getRadius(magnitude) {
    return magnitude * 4;
}

// Create heatmap layer function
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
        maxZoom: 17
    });
}

// Fetch the earthquake data
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson").then(function(data) {
    // Create heatmap layer
    let heatLayer = createHeatLayer(data);

    // Add heatmap layer to the map
    heatLayer.addTo(map);

    // Add heatmap to overlay layers
    overlayLayers["Heatmap"] = heatLayer;

    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            let magnitude = feature.properties.mag;
            let depth = feature.geometry.coordinates[2];
            
            // Create circle markers
            let circleMarker = L.circleMarker(latlng, {
                radius: getRadius(magnitude),
                fillColor: getColor(depth),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).bindPopup(`<h3>${feature.properties.place}</h3><hr><p>Magnitude: ${magnitude}</p><p>Depth: ${depth} km</p>`);

            circleArray.push(circleMarker);
            markers.addLayer(circleMarker);

            return circleMarker;
        }
    });

    // Add layers to overlayLayers
    overlayLayers["Markers"] = markers;
    overlayLayers["Circles"] = L.layerGroup(circleArray);

    // Fetch the tectonic plates data and add it to overlayLayers
    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(geoData) {
        tectonicPlatesLayer = L.geoJSON(geoData, {
            style: {
                color: "navy",
                weight: 2
            }
        });

        // Add tectonic plates layer to overlay layers
        overlayLayers["Tectonic Plates"] = tectonicPlatesLayer;

        // Add the layer control to the map (must be done after all layers are added)
        L.control.layers(baseLayers, overlayLayers).addTo(map);
    });
});

// Create the legend control
let legend = L.control({ position: "bottomright" });

legend.onAdd = function() {
    let div = L.DomUtil.create("div", "info legend");
    let limits = [-10, 10, 30, 50, 70, 90]; // Depth limits
    let labels = [];

    // Add the title to the legend
    let legendInfo = "<h4>Earthquake Depth (km)</h4>";
    div.innerHTML = legendInfo;

    // Loop through depth intervals and generate a label with a colored square and explanation
    for (let i = 0; i < limits.length; i++) {
        div.innerHTML +=
            '<i style="background:' + getColor(limits[i] + 1) + '; width: 18px; height: 18px; display: inline-block; margin-right: 5px;"></i> ' +
            limits[i] + (limits[i + 1] ? '&ndash;' + limits[i + 1] + ' km' : '+ km') +
            '<span style="margin-left: 5px;">' + getExplanation(limits[i]) + '</span><br>'; // Add explanation
    }

    return div;
};

// Function to get explanation based on depth
function getExplanation(depth) {
    if (depth > 90) return "Very Deep";
    if (depth > 70) return "Deep";
    if (depth > 50) return "Moderately Deep";
    if (depth > 30) return "Shallow";
    if (depth > 10) return "Very Shallow";
    if (depth > -10) return "Surface";
    return "Unknown Depth";
}

// Add the legend to the map
legend.addTo(map);
