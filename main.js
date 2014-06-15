
var projection = d3.geo.mercator(); //.translate([0, 0]).scale(200);
projection.scale(7400).center([10.8,48.7]);

var path = d3.geo.path().projection(projection);

var vis = d3.select("#stage").append("svg").attr("width", 460).attr("height", 500);

var csv;
var json;
var age = "18-25";
var mode= "in";

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
	if (mode == "diff") {
		keyIn = "Zuzüge "+age+" Jahr 2012";
		keyOut = "Fortzüge "+age+" Jahr 2012";
	}
	if (mode == "fb")
		key = "Facebooklikes";

	var dataMax = d3.max(json.features, function (d) {
		var migration = toFloat(d.properties.daten[key]);
		var bev = toFloat(d.properties.daten[people]);
		var normalized = migration * 100 / bev;
		return normalized;
	});
	dataMax = 5;
	var dataMin = 0;
	if (mode=="diff") {
		dataMax = 2.5;
		dataMin = -2.5;
	}
	if (mode=="fb") {
		dataMax = 120000;
		dataMin = 0;
	}
	console.log('max/min:', dataMax, dataMin);

	targetColor = "#0000cc";
	if (mode == "in") targetColor = "#00cc00";
	if (mode == "out") targetColor = "#cc0000";
	if (mode == "fb") targetColor = "#0000cc";
	var colorMap = d3.scale.linear().domain([dataMin, dataMax]).range(["#cccccc", targetColor]);
	if (mode=="diff") colorMap = d3.scale.linear().domain([dataMin, 0, dataMax]).range(["#cc0000", "#cccccc", "#00cc00"]);

	kreise
		.attr("fill", function (d, i) {
			if (mode == "diff") {
				var inn = toFloat(d.properties.daten[keyIn]);
				var out = toFloat(d.properties.daten[keyOut]);
				var migration = inn - out;
			} else {
				var migration = toFloat(d.properties.daten[key]);
			}
			var bev = toFloat(d.properties.daten[people]);
			var normalized = migration * 100 / bev;
			if (mode == "fb") {
				var normalized = toFloat(d.properties.daten[key]);
			}
//			console.log(i, d.properties.GEN, bev, colorMap(bev));
			return colorMap(normalized);
		})
		.on('mouseover', function (d) {
			if (mode == "diff") {
				var inn = toFloat(d.properties.daten[keyIn]);
				var out = toFloat(d.properties.daten[keyOut]);
				var migration = inn - out;
			} else {
				var migration = toFloat(d.properties.daten[key]);
			}
			var bev = toFloat(d.properties.daten[people]);
			var normalized = migration * 100 / bev;

			if (mode == "fb") {
				var normalized = toFloat(d.properties.daten[key]);
			}

			console.log(d.properties.GEN);
			var coordinates = [0, 0];
			coordinates = d3.mouse(this);
			var x = coordinates[0];
			var y = coordinates[1];
			if (mode=="fb") {
				d3.select('#tooltip')
					.style('top', function () { return (y+150)+"px"})
					.style('left', function () { return x+"px"})
					.text(d.properties.GEN+" "+normalized);
			} else {
				d3.select('#tooltip')
					.style('top', function () { return (y+150)+"px"})
					.style('left', function () { return x+"px"})
					.text(d.properties.GEN+" "+normalized.toFixed(2)+"/100 EW");
				}

			d3.select('#info')
				.html(
					'<b>Kreis:</b> '+d.properties.GEN+"<br>"+
					"<b>Hauptstadt:</b> "+d.properties.daten["Capital"]+"<br>"+
					((d.properties.daten["Verarbeitendes Gewerbe (Umsatz 2013)"]=="")?"":("<b>Industrie Umsatz:</b> "+d.properties.daten["Verarbeitendes Gewerbe (Umsatz 2013)"]+" €<br>"))+
					((d.properties.daten["Badeseen"]=="")?"":("<b>Badeseen:</b> "+d.properties.daten["Badeseen"]+"<br>"))+
					((d.properties.daten["Freizeitparks"]=="")?"":("<b>Freizeitparks:</b> "+d.properties.daten["Freizeitparks"]+"<br>"))+
					((d.properties.daten["Facebooklikes"]=="")?"":("<b>Facebook-Likes:</b> "+d.properties.daten["Facebooklikes"]+"<br>"))+
					((d.properties.daten["1. Bundesliga"]=="")?"":("<b>1. Bundesliga:</b> "+d.properties.daten["1. Bundesliga"]+"<br>"))+
					((d.properties.daten["2. Bundesliga"]=="")?"":("<b>2. Bundesliga:</b> "+d.properties.daten["2. Bundesliga"]+"<br>"))+
					"<b>Arbeitslosenzahl 2012:</b> "+d.properties.daten["Arbeitslosenzahlen 2012"]+"<br>"+
					((d.properties.daten["Hochschulen/Universitäten"]=="")?"":("<b>Hochschulen / Universitäten:</b> "+d.properties.daten["Hochschulen/Universitäten"])));
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
d3.select('#btnFb').on('click', function () {
	mode = "fb";
	update();
});

d3.select('#btn18-25').on('click', function () {
	d3.select('#btn25-30').attr('class', '');
	d3.select(this).attr('class', 'active');
	age = "18-25";
	update();
});
d3.select('#btn25-30').on('click', function () {
	d3.select('#btn18-25').attr('class', '');
	d3.select(this).attr('class', 'active');
	age = "25-30";
	update();
});
