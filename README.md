# leaflet-challenge
## Module 15 Mapping

This JavaScript(js) code sets up an interactive map using Leaflet and integrates various data layers to visualize earthquake and tectonic plate information. 

### Deployment
The deployed project can be view at:  
 [https://github.com/violetblue7/leaflet-challenge](https://github.com/violetblue7/leaflet-challenge)

### Code Explanation

Here’s a detailed breakdown of what each part of the code does:

1. Initialize the Map
javascript

let map = L.map('map').setView([0, 0], 2);
L.map('map'): Creates a Leaflet map and attaches it to an HTML element with the ID map.
.setView([0, 0], 2): Centers the map at latitude 0 and longitude 0 (the equator and the prime meridian) with a zoom level of 2 (zoomed out view).

2. Define Base Layers
Base layers are the primary layers on which other layers will be overlaid. Two base layers are defined:

javascript

let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
});

let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
});
L.tileLayer: Creates a tile layer with the specified URL template for fetching map tiles.
{s}, {z}, {x}, {y}: Placeholders in the URL for the tile server to provide the appropriate tiles based on zoom level and coordinates.
attribution: Provides credits for the map data and style.

3. Add Default Base Layer
javascript

street.addTo(map);
Adds the street map layer to the map as the default base layer.

4. Create Layers for Additional Features
javascript

let markers = L.markerClusterGroup();
let circleArray = [];
let tectonicPlatesLayer;
L.markerClusterGroup(): Creates a layer group for clustering markers to improve performance with many points.
circleArray: An array to store circle markers.
tectonicPlatesLayer: Variable to hold the tectonic plates layer.

5. Define Base Layers and Overlay Layers
javascript

let baseLayers = {
    "Street Map": street,
    "Topographic Map": topo
};

let overlayLayers = {};
baseLayers: Object storing base layers with their names.
overlayLayers: Object for overlay layers, initially empty.

6. Define Helper Functions
getColor(depth): Returns a color based on the depth of the earthquake.
getRadius(magnitude): Returns the radius for the circle marker based on the magnitude of the earthquake.
createHeatLayer(data): Converts earthquake data into an array format suitable for the heatmap layer and creates a L.heatLayer.

7. Fetch and Display Earthquake Data
javascript

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson").then(function(data) {
    let heatLayer = createHeatLayer(data);
    heatLayer.addTo(map);
    overlayLayers["Heatmap"] = heatLayer;
    
    L.geoJSON(data, {
        pointToLayer: function(feature, latlng) {
            let magnitude = feature.properties.mag;
            let depth = feature.geometry.coordinates[2];
            
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

    overlayLayers["Markers"] = markers;
    overlayLayers["Circles"] = L.layerGroup(circleArray);
d3.json: Fetches the earthquake data in GeoJSON format.
createHeatLayer(data): Creates and adds a heatmap layer to the map.
L.geoJSON(data, { pointToLayer: ... }): Creates circle markers for each earthquake and adds them to the markers cluster group and circleArray.

8. Fetch and Display Tectonic Plates Data
javascript

    d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(geoData) {
        tectonicPlatesLayer = L.geoJSON(geoData, {
            style: {
                color: "navy",
                weight: 2
            }
        });

        overlayLayers["Tectonic Plates"] = tectonicPlatesLayer;

        L.control.layers(baseLayers, overlayLayers).addTo(map);
    });
});
d3.json: Fetches tectonic plates data in GeoJSON format.
L.geoJSON(geoData, { style: ... }): Creates a GeoJSON layer with custom styling for tectonic plates.
L.control.layers(baseLayers, overlayLayers).addTo(map): Adds a layer control to the map allowing users to toggle between base layers and overlay layers.

Summary
The code initializes a Leaflet map, sets up base layers (street and topographic maps), and overlays earthquake data, including heatmaps, circle markers, and tectonic plates. It uses d3.json to fetch data, processes it into visual layers, and adds these layers to the map with interactive controls for user selection.

References:
DATA-PT-EAST-APRIL-041524/02-Homework/15-Mapping Profesor Alexande Booth
Libraries and Technologies:
Leaflet:

Documentation: Leaflet Documentation
Purpose: Leaflet is used for creating interactive maps. It provides functions like L.map, L.tileLayer, L.markerClusterGroup, L.geoJSON, and L.control.layers.
OpenStreetMap (OSM):

URL for Street Map Tiles: https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png
Attribution: &copy; OpenStreetMap contributors
Purpose: Provides free, editable map tiles for the street base layer.
OpenTopoMap:

URL for Topographic Map Tiles: https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png
Attribution: Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)
Purpose: Provides topographic map tiles for the topographic base layer.
Leaflet.heat:

Documentation: Leaflet.heat GitHub
Purpose: Adds a heatmap layer to Leaflet maps. It is used to visualize earthquake data as a heatmap.
D3.js:

Documentation: D3.js Documentation
Purpose: Used for fetching and processing GeoJSON data with d3.json.
GeoJSON:

USGS Earthquake Feed: https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson
Tectonic Plates Data: https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json
Purpose: GeoJSON format is used for representing geographic data. The USGS feed provides earthquake data, and the tectonic plates data is used for displaying tectonic boundaries.
Concepts and Techniques:
Marker Clustering:

Documentation: Leaflet.markercluster GitHub
Purpose: To cluster markers and improve map performance when displaying many points.
Popup Bindings:

Purpose: Attach popups to map markers to display detailed information (e.g., magnitude, depth, and place of earthquakes).
Dynamic Layer Control:

Purpose: Allows users to toggle between different layers (base and overlay layers) on the map using L.control.layers.


[ChatGPT](https://chatgpt.com/) an AI language model developed by OpenAI, providing guidance on coding, libraries, and technologies.
