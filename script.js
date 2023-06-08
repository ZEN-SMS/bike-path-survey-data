var public_spreadsheet_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7gM8gporkXhMJaSXHf2TnuQZ_pzp5T74IMpTE3J8iLjaSOCVnAuSCj7vz6iu0DB7E4rXvyMVw7NVE/pub?output=csv"

var encodedData = [];
var data = {};

// Display the leaflet map
const map = L.map('map').setView([63.42, 10.43], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	attribution: 'Service © <a href="https://openrouteservice.org/">openrouteservice.org</a> | Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
	maxZoom: 19
}).addTo(map);




// Download the Google Sheet with the surveys responses
function DLGoogleSheet() {
	Papa.parse(public_spreadsheet_url, {
		download: true,
		header: true,
		complete: showInfo
	})
  }
 
function showInfo(results) {
	encodedData = results.data;
	data = toGeoJSON(encodedData);
}

function toGeoJSON(data) {
	var features = [];
	
	for (let i = 0; i < data.length; i +=1) {
		var rep = data[i]
		var horodateur = rep["Horodateur"];
		var split = rep["Path"].split(";");
		
		var gender = split[0];
		var age = split[1];
		for (let j = 0; j < (split.length - 3)/4; j+=1) {
			
			path = polyline.decode(split[4*j+2]);
			for (let k = 0; k < path.length; k+=1) {
				path[k].reverse(); 
			};
			
			const feature = {
				type: 'Feature',
				geometry: {
					type: 'LineString',
					coordinates: path
				},
				properties: {
					Horodateur: horodateur,
					Gender: gender,
					Age: age,
					Purpose: split[4*j+3],
					Frequency: split[4*j+4],
					Season: split[4*j+5]
				}
			};
		features.push(feature);
		};
	};
	const geojson = {
		type: 'FeatureCollection',
		features: features
	};
	document.getElementById("displayButton").disabled = false;
	document.getElementById("downloadButton").disabled = false;
	return geojson;
}



function downloadGeoJSON(data) {
	// Create a data URI from the GeoJSON content
	const dataURI = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

	// Create a link element and simulate a click
	const link = document.createElement('a');
	link.href = dataURI;
	link.download = 'data.geojson';
	link.click();
}

function displayData(data) {
	L.geoJSON(data).addTo(map);
};

DLGoogleSheet();



