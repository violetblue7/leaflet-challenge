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
    return depth > 90 ? '#d73027' :
           depth > 70 ? '#fc8d59' :
           depth > 50 ? '#fee08b' :
           depth > 30 ? '#d9ef8b' :
           depth > 10 ? '#91cf60' :
                        '#1a9850';
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
    let limits = [0, 10, 20, 30]; // Example limits
    let colors = ["#ff0000", "#ff7f00", "#ffff00", "#7fff00"]; // Example colors
    let labels = [];

    // Add the minimum and maximum
    let legendInfo = "<h4>Legend Title</h4>" +
        "<div class=\"labels\">" +
            "<div class=\"min\">" + limits[0] + "</div>" +
            "<div class=\"max\">" + limits[limits.length - 1] + "</div>" +
        "</div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
        labels.push("<li style=\"background-color: " + colors[index] + "\"></li>");
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
};

// Add the legend to the map
legend.addTo(myMap);