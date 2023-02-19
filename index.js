const express = require("express");
const app = express();
const fs = require('fs')
const parseKML = require('parse-kml')
const axios = require('axios')
const d3 = require('d3-node')
const { parse } = require('rss-to-json');

const port = 4000;

const geoData = JSON.parse(fs.readFileSync('./county.geo.json'))
async function fetchData(url, name) {
	axios({
		method: "get",
		url: url
	})
		.then((penis) => {
			fs.writeFileSync(name, JSON.stringify(penis.data))
		})
}

async function parseXml(url, name) {
	const unparsed = await parseKML.toJson(url)
	fs.writeFileSync(name, JSON.stringify(unparsed))
}

function getEarthquakeLocation(name, earthquakeNumber) {
	return (name.features.earthquakeNumber.geometry.coordinates)
}

function prefetchData() {
	fetchData("https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries", "fema.json")

	fetchData("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", "USEarthquakes.json")
}

function pointInFeature(feature, lat, long) {
	let fakeCollection = {
		type: "FeatureCollection",
		features: [feature]
	}

	return d3.d3.geoContains(fakeCollection, [lat, long])
}

function grabGeojsonFeature(declaration) {
	const geoFeatures = geoData.features

	for (let i = 0; i < geoFeatures.length; i++) {
		let feature = geoFeatures[i]
		let countyName = feature.properties.NAME10.toLowerCase()
		if (countyName === declaration.county)
			return feature
	}
}

function mapToFire(declaration, geoCounty, fn) {
	const readline = require("readline");
	const stream = fs.createReadStream("./nasa_fire.csv");
	const rl = readline.createInterface({ input: stream });
	let data = [];

	rl.on("line", (row) => {
		data.push(row.split(","));
	});

	rl.on("close", () => {
		for (let i = 1; i < data.length; i++) {
			let point = data[i]
			let lat = point[0]
			let long = point[1]
			let brightness = point[2]

			if(pointInFeature(geoCounty, lat, long))
				console.log("DICK!")
		}

		fn()
	});
}

app.get('/mapData', (req, res) => {
	//grab the fema data
	const femaData = JSON.parse(fs.readFileSync("fema.json"))

	let declarations = femaData.DisasterDeclarationsSummaries
	let selectedDeclarations = []

	for (let i = 0; i < declarations.length; i++) {
		let declaration = declarations[i]
		let county = declaration.designatedArea.trim().split(" ")
		let title = declaration.declarationTitle
		let type = declaration.incidentType
		county.pop()

		let disaster = {
			title,
			county: county.join(" "),
			type
		}

		let endDate = declaration.incidentEndDate
		if (endDate === null)
			selectedDeclarations.push(disaster)
	}

	for (let i = 0; i < selectedDeclarations.length; i++) {
		let decleration = selectedDeclarations[i]
		let geoCounty = grabGeojsonFeature(decleration)
		
		switch (decleration.type) {
			case "Fire":
				mapToFire(decleration, geoCounty, () => {
					return res.send("dick!")
				})
				break
			default:
				break
		}
	}
})





app.use(express.static(__dirname + "/public"));
prefetchData()
app.listen(port);