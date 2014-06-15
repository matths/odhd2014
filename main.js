
var projection = d3.geo.mercator(); //.translate([0, 0]).scale(200);
var path = d3.geo.path().projection(projection);

var vis = d3.select("#stage").append("svg").attr("width", 960).attr("height", 600);

//d3.json("maps/ortenau.json", function(error, json) { 
d3.json("maps/landkreise_bawue.json", function(error, json) { 
	if (error!=null) console.log(error);

   projection.scale(9000).center([10.4,48.8]);

   console.log(json);

    vis.append("path")
		.datum(json)
    .attr("d", path);

});
