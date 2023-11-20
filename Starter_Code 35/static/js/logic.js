//Use the URL of this JSON to pull in the data for the visualization

// Specify the query URL
let queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Use d3.json to make the GET request
d3.json(queryUrl)
  .then(data => {
    // Handle the earthquake data here
    console.log(data);
  })
  .catch(error => {
    console.error("Error fetching earthquake data:", error);
  });
//Import and visualize the data by doing the following:
//Using Leaflet, create a map that plots all the earthquakes from your dataset based on their longitude and latitude.

// Specify the query URL
let map = L.map('map').setView([0, 0], 2);

// Add a tile layer to the map 
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors'
}).addTo(map);

// Use d3.json to make the GET request
d3.json(queryUrl)
  .then(data => {
    // Access the features array in the GeoJSON data
    let earthquakes = data.features;

    // Determine the maximum depth for normalization
    let maxDepth = d3.max(earthquakes, d => d.geometry.coordinates[2]);

    // Loop through the earthquake data and create markers on the map
    earthquakes.forEach(earthquake => {
      let coordinates = earthquake.geometry.coordinates;
      let magnitude = earthquake.properties.mag;
      let depth = coordinates[2];

      // Size based on magnitude, color based on depth
      let size = magnitude * 5; 
      let color = getColor(depth, maxDepth);

      // Create a circle marker with size and color
      let marker = L.circleMarker([coordinates[1], coordinates[0]], {
        radius: size,
        fillColor: color,
        color: color,
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      });

      // Create a popup with additional information
      marker.bindPopup(
        `<b>Magnitude:</b> ${magnitude}<br><b>Depth:</b> ${depth} km`
      );

            // Create a tooltip with additional information
            let tooltipContent = `
            <b>Magnitude:</b> ${magnitude}<br>
            <b>Depth:</b> ${depth} km<br>
            <b>Location:</b> ${earthquake.properties.place}
          `;
          marker.bindTooltip(tooltipContent);
    

      // Add the marker to the map
      marker.addTo(map);
    });

    // Add Legend
    addLegend(map, maxDepth);
  })
  .catch(error => {
    console.error("Error fetching earthquake data:", error);
  });

// Function to determine color based on depth
function getColor(depth, maxDepth) {
    // Normalize depth and map it to a color gradient
    let normalizedDepth = depth / maxDepth;
    return d3.interpolateYlOrRd(normalizedDepth);
  }
  
 
  // Function to add legend to the map
function addLegend(map, maxDepth) {
    let legend = L.control({ position: 'bottomleft' });
  
    legend.onAdd = function () {
      let div = L.DomUtil.create('div', 'legend');
      let grades = [0, 1, 1, 1, 1, 1]; 
      let labels = [];
  
      // Add color bar to legend
      div.innerHTML += '<div class="legend-color-bar"></div>';
  
      // Loop through depth ranges and generate a label with a colored square for each
      for (let i = 0; i < grades.length - 1; i++) {
        let from = grades[i] * maxDepth;
        let to = grades[i + 1] * maxDepth;
        let color = getColor(from, maxDepth);
  
        div.innerHTML +=
          `<div class="legend-item">
            <i style="background:${color}; width: 20px; height: 20px;"></i>
            ${from.toFixed(0)}-${to.toFixed(0)} km
          </div>`;
      }
  
      return div;
    };
  
    legend.addTo(map);
  }
  