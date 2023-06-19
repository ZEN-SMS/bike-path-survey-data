var public_spreadsheet_url = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQ7gM8gporkXhMJaSXHf2TnuQZ_pzp5T74IMpTE3J8iLjaSOCVnAuSCj7vz6iu0DB7E4rXvyMVw7NVE/pub?output=csv"

var encodedData = [];
var data = [];
var layer = [];


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
	displayData(data);
}

function toGeoJSON(data) {
	var features = [];
	
	for (let i = 0; i < data.length; i +=1) {
		var rep = data[i]
		var horodateur = rep["Horodateur"];
		var split = rep["Path"].split(";");
		
		var gender = split[0];
		var age = split[1];
		for (let j = 0; j < (split.length - 3)/5; j+=1) {
			
			path = polyline.decode(split[5*j+2]);
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
					Purpose: split[5*j+3],
					Frequency: split[5*j+4],
					Season: split[5*j+5],
					Electric_bike: split[5*j+6],
				}
			};
		features.push(feature);
		};
	};
	const geojson = {
		type: 'FeatureCollection',
		features: features
	};
	document.getElementById("downloadButton").disabled = false;
	return geojson;
}



function downloadGeoJSON(data) {
	console.log(data);

	// Create a data URI from the GeoJSON content
	const dataURI = 'data:application/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data));

	// Create a link element and simulate a click
	const link = document.createElement('a');
	link.href = dataURI;
	link.download = 'data.geojson';
	link.click();
}

function displayData(data) {
	map.removeLayer(layer);
	layer = L.geoJSON(data, {
		style: function(feature) {
			const day = document.getElementById("daySlider").value;
			var horodateur = feature.properties.Horodateur;
			var horodateurDate = new Date(horodateur);
			const d = horodateurDate.getDate()
			const m = horodateurDate.getMonth()
			horodateurDate.setMonth(d-1);
			horodateurDate.setDate(m+1);
			
			if (new Date() - horodateurDate < 86400000*day) {
				return { color: "red" };
			} else {
				return { color: "blue" };
			}
		}
	}).addTo(map);
};




//[{Horodateur: "02/06/2023 11:46:54", "Path": "prefernottosay;36-65;atabKolq~@Za@\{@Hc@Fk@Do@BaD@]wAuAyAaB{AuBW]Bq@?y@Fm@f@kDPwAYqAEQk@kCnA_HF[D_@GGDU|@cF\mB@KO{COw@AS?KA[GKcA_BeAaB@Oj@wJFqARcDLqBNqBFaAFs@RuDHiATsDEE?WC_@K]@E@G@W@E@K][{@cAW[yCqDSWZ}CRgBB]Dq@@}BAgACoAEkACaA_@{LCg@Ce@Ca@Gk@Ku@Q_AMg@WeAYw@Me@g@mAm@uAb@iBQYQKg@@Ca@Kw@Y}AU{@[u@KSwAaC}@yAOOIEOMOOSURmATkAVw@^w@Z_AbAgDTb@r@{@`CeCBE;work;1-2 ganger i uken;kun sommer;" }, {Horodateur: "07/06/2023 11:48:03", "Path": "female;65plus;cvcbKctk~@F~BFzBTBD?PBn@BZBt@JzCd@P@|@JB?B?^BNLJHFNzE~NDLZw@b@gAb@_AdAoBtAvAH?HIHIDGLLHHFFpAtAj@fAr@rAzA`DvBwDNWvHmK@I?MNQNSTYLEJHPt@RXXB^Wf@k@j@w@BBBF@DlBlLDNBHDFFBZKlAcANKHAJBBDFNBJ@F@BBRDXFZBLBBLB`A]pAYd@I@^^Ir@DV^LvAAhABfARvARpA@B@FB`@ELq@hAQRBNBN@HDFV@BH?JCLWTKPAl@Bx@F\HV\p@c@j@OUMNUz@CT?N?XDVAj@;shop;3-4 ganger i uken;hele året;q}cbKmz}~@A\a@lHc@vEQ~C?BEt@IhGEj@]|GC^YrFIpAS~Ci@rHcBjOStASbAm@pBOj@CXI~@Af@@zAAT?RAPa@jCO|@_@vB_@pAYbBQhACn@SfBE^kAhJEHMHCHCHUtACLCLFVFl@?LTNLD@@OfAKn@OfAS|AGj@Ep@MhBMxBMfBSpDQrCGdBA^MlFEhAGdBG~AQpEI`BKfC_@pJMxCt@Fp@fDBDHh@DhEB~@Fp@N`@p@ZNNFTDVBZ@ZFt@Jb@P^PZWxAAFIjA@vBl@dK@`@Bn@@l@CzCK`AKVRp@h@lBl@pBhArDNp@Nz@Hx@FfAJrAX~AJx@Bn@r@`EPx@^bBhApENj@lDxLJ`@JVLVj@nBDJ\lA~@fDRv@rA`FJ^FTBJlAnEJ`@jBdHXdAHNTPCJAPCZLLHBE|AFHLPBLf@~BFVLn@PjAHHJBD?BHh@bBf@z@PNADOr@Gr@IhCBvBCdBDt@L^R^DHPd@FP@TDKrBLd@LGRNA^MJ@Xd@n@^f@?Vn@DPTPh@n@Qp@a@dCc@xCEd@El@Cj@?FC\GjAIjA@@JFD?CVBB@BDFp@bAOz@MAA^?B?|@`@Jd@Nl@Rf@p@PVx@pA;work;3-4 ganger i uken;kun vinter;" }];
DLGoogleSheet();

document.getElementById("daySlider").oninput = function() {
	document.getElementById("sliderValue").innerHTML = this.value + " days";
	displayData(data);
}

