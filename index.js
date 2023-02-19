const express = require("express");
const app = express();
const fs = require('fs')
const parseKML = require('parse-kml')
const axios = require('axios')
const d3 = require('d3-node')
const { parse } = require('rss-to-json');

const port = 4000;
let geoData = {}

async function fetchData(url, name) {
	axios({
		method: "get",
		url: url
	})
		.then((penis) => {
			fs.writeFileSync(name, JSON.stringify(penis.data))
		})
}

function prefetchData() {
	fetchData("https://www.fema.gov/api/open/v2/DisasterDeclarationsSummaries", "fema.json")

	fetchData("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson", "USEarthquakes.json")

	geoData = JSON.parse(fs.readFileSync('./county.geo.json'))
}

function grabGeojsonFeature(declaration) {
	const geoFeatures = geoData.features

	for (let i = 0; i < geoFeatures.length; i++) {
		let feature = geoFeatures[i]
		let countyName = feature.properties.NAME10.toLowerCase().trim()
		if(countyName === declaration.county.toLowerCase())
			return feature
	}
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
		let femaId = declaration.disasterNumber
		county.pop()

		let disaster = {
			title,
			county: county.join(" "),
			type,
			femaId: femaId
		}

		let endDate = declaration.incidentEndDate
		if (endDate === null)
			selectedDeclarations.push(disaster)
	}

	let features = []
	let addedIds = []
	for (let i = 0; i < selectedDeclarations.length; i++) {
		let decleration = selectedDeclarations[i]
		if(addedIds.includes(decleration.femaId))
			continue

		let geoCounty = grabGeojsonFeature(decleration)
		if(geoCounty === undefined)
			continue

		geoCounty.properties.declaration = decleration
		features.push(geoCounty)
		addedIds.push(declarations.femaId)
	}

	return res.json({ type: "FeaturesCollection", features })
})


app.get('/', (req, res) => {
	res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
})

app.use(express.static(path.join(__dirname, 'build')))
prefetchData()
app.listen(port, () => { console.log('david dyke roh') });