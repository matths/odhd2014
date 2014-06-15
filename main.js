
var projection = d3.geo.mercator(); //.translate([0, 0]).scale(200);
projection.scale(7400).center([10.8,48.7]);

var path = d3.geo.path().projection(projection);

var vis = d3.select("#stage").append("svg").attr("width", 960).attr("height", 600);

var csv;

colorMap = d3.scale.linear()
	.domain([0,10])
	.range(["#cccccc","#ff0000"]);

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

function showMap(json) {
	var kreise;

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
				.on('mouseover', function () {
				});

	kreise
		.attr("fill", function (d, i) {
			var bev = d.properties.daten["Arbeitslosenzahlen 2005"];
			bev = bev.replace( /,/,"." );
			bev = parseFloat(bev);
//			console.log(i, d.properties.GEN, bev, colorMap(bev));
			return colorMap(bev);
		});

}

function loadJson(callback) {
	d3.json("maps/landkreise_bawue.json", function(error, json) { 
		if (error!=null) console.log(error);

		json.features.sort(function (a,b) {
			if(a.properties.GEN < b.properties.GEN) return -1;
			if(a.properties.GEN > b.properties.GEN) return 1;
			return 0;
		});

		callback(json);
	});
}

loadDaten(function () {
	loadJson(function (json) {
		var str = "";
		json.features.map(function (d,k) {
			for (var i = 0; i < csv.length; i++) {
				if (csv[i]["ID"] == d.properties.OBJECTID) {
					d.properties.daten = csv[i];
					//console.log(d.properties.GEN, d.properties.daten.Kreis);
				}
			}
		});
		showMap(json);
	});
});
