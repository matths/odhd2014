
var projection = d3.geo.mercator(); //.translate([0, 0]).scale(200);
projection.scale(7400).center([10.8,48.7]);

var path = d3.geo.path().projection(projection);

var vis = d3.select("#stage").append("svg").attr("width", 960).attr("height", 600);

var mode, age;
var csv;
var json;
var age = "18-25";

function loadDaten (callback) {
	var dataset = [];
	d3.csv("bw-daten.csv", function(d) {
		d = d.filter(function (d) {
			return (d.ID!="");
		});
		csv = d;
		callback();
	});	
}

var kreise;
function showMap() {

    kreise = vis.selectAll("path")
		.data(json.features)
		.enter()
			.append("path")
				.attr("id", function (d,i) {
					return d.properties.GEN;
				})
				.attr("class","kreis")
				.attr("d", path)
				.attr("stroke", "white")
				.attr("stroke-width", 1)
	update();
}

function loadJson(callback) {
	d3.json("maps/landkreise_bawue.json", function(error, jsonD) { 
		if (error!=null) console.log(error);

		json = jsonD;
		json.features.sort(function (a,b) {
			if(a.properties.GEN < b.properties.GEN) return -1;
			if(a.properties.GEN > b.properties.GEN) return 1;
			return 0;
		});

		callback();
	});
}

loadDaten(function () {
	loadJson(function () {
		var str = "";
		json.features.map(function (d,k) {
			for (var i = 0; i < csv.length; i++) {
				if (csv[i]["ID"] == d.properties.OBJECTID) {
					d.properties.daten = csv[i];
					//console.log(d.properties.GEN, d.properties.daten.Kreis);
				}
			}
		});
		showMap();
	});
});

function toFloat(str) {
	str = str.replace( /,/,"." );
	return parseFloat(str);
}

function update() {
	var people = "Bevölkerungsstand 2012";

	console.log(mode);
	var key = "Zuzüge "+age+" Jahr 2012";
	if (mode == "in")
		key = "Zuzüge "+age+" Jahr 2012";
	if (mode == "out")
		key = "Fortzüge "+age+" Jahr 2012";

	var dataMax = d3.max(json.features, function (d) {
		var migration = toFloat(d.properties.daten[key]);
		var bev = toFloat(d.properties.daten[people]);
		var normalized = migration * 100 / bev;
		return normalized;
	});
	console.log('max/min:', dataMax, 0);

	targetColor = "#000099";
	if (mode == "in") targetColor = "#009900";
	if (mode == "out") targetColor = "#990000";
	var colorMap = d3.scale.linear().domain([0, 5]).range(["#cccccc", targetColor]);

	kreise
		.attr("fill", function (d, i) {
			var migration = toFloat(d.properties.daten[key]);
			var bev = toFloat(d.properties.daten[people]);
			var normalized = migration * 100 / bev;
//			console.log(i, d.properties.GEN, bev, colorMap(bev));
			return colorMap(normalized);
		})
		.on('mouseover', function (d) {
			var migration = toFloat(d.properties.daten[key]);
			var bev = toFloat(d.properties.daten[people]);
			var normalized = migration * 100 / bev;

			console.log(d.properties.GEN);
			var coordinates = [0, 0];
			coordinates = d3.mouse(this);
			var x = coordinates[0];
			var y = coordinates[1];
			d3.select('#tooltip')
				.style('top', function () { return (y+100)+"px"})
				.style('left', function () { return x+"px"})
				.text(d.properties.GEN+" "+normalized.toFixed(2)+"/100 EW");
		});
};

d3.select('#btnIn').on('click', function () {
	mode = "in";
	update();
});
d3.select('#btnOut').on('click', function () {
	mode = "out";
	update();
});
d3.select('#btnDiff').on('click', function () {
	mode = "diff";
	update();
});

d3.select('#btn18-25').on('click', function () {
	age = "18-25";
	update();
});
d3.select('#btn25-30').on('click', function () {
	age = "25-30";
	update();
});
