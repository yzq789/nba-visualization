var firstPainted = false;

var court_top_num = 570;
var court_left_num = 25;
var court_acc_left_num = 25 + 740;

var	court_width = "658px";
var	court_height =  "385px";
var	court_left = court_left_num + "px";
var	court_top = court_top_num + "px";
var court_acc_left = court_acc_left_num + "px";

d3.select("body").append("p")
	.text("进攻方向速度可视化")
	.style("position", "absolute")
	.style("top", court_top_num - 35 + "px")
	.style("left", court_left_num + 10 +  "px");

d3.select("body").append("p")
	.text("进攻方向加速度可视化")
	.style("position", "absolute")
	.style("top", court_top_num - 35 + "px")
	.style("left", court_acc_left_num + 10 +  "px");

d3.select("body").append("img")
	.attr("id", "speed-court-img")
	.attr("src", "./court.png")
	.style("width", court_width)
	.style("height", court_height)
	.style("left", court_left)
	.style("top", court_top)
	.style("opacity", "0.5");

d3.select("body").append("div")
	.style("position", "absolute")
	.style("width", court_width)
	.style("height", court_height)
	.style("left", court_left)
	.style("top", court_top)
	.style("opacity", "1")
	.style("background", "#E3E6E6")
	.style("z-index", "-100");

d3.select("body").append("img")
	.attr("id", "acc-court-img")
	.attr("src", "./court.png")
	.style("width", court_width)
	.style("height", court_height)
	.style("left", court_acc_left)
	.style("top", court_top)
	.style("opacity", "0.5");

d3.select("body").append("div")
	.style("position", "absolute")
	.style("width", court_width)
	.style("height", court_height)
	.style("left", court_acc_left)
	.style("top", court_top)
	.style("opacity", "1")
	.style("background", "#E3E6E6")
	.style("z-index", "-100");


function updateSpeedAndAcceleration(playerId){

	if(!firstPainted){
		firstPainted = true;
		return;
	}
	console.log("updateSpeedAndAcceleration: playerId=" + playerId);
	updateSpeed(playerId);
	updateAcceleration(playerId);

}

function updateAcceleration(playerId){
	d3.selectAll(".acc-svg").remove();

	d3.csv("./acc-data/player-" + playerId + "-cell.csv", function(error, data) {

		var cell_size = 14;

		var svg = d3.select("body").append("svg")
			.attr("class", "acc-svg")
		    .style("position", "absolute")
		    .style("width", court_width)
		    .style("height", court_height)
		    .style("left", court_acc_left)
		    .style("top", court_top);

		cells = svg.selectAll(".cell")
			.data(data)
			.enter()
			.append("g")
			.attr("transform", function(d, i){ return "translate( " + i % 47 * cell_size+ ", " + parseInt(i / 47) * cell_size + ")";})
			.attr("class", "cell")
			.attr("width", cell_size)
			.attr("height", cell_size);

		cells.each(function(d, i){
			d3.select(this).append("line")
				.attr("x1", cell_size / 2 - (d["acc_x"]) * cell_size * 5)
				.attr("y1", cell_size / 2 - (d["acc_y"]) * cell_size * 5)
				.attr("x2", cell_size / 2)
				.attr("y2", cell_size / 2)
				.attr("transform", "rotate(15, " + cell_size / 2 + " " + cell_size/2 + ")")
				.style("stroke", acc_color)
				.style("stroke-width", acc_bold)
	            .on("mouseover", function(d){
	            	console.log(Math.sqrt(d["acc_x"] * d["acc_x"] + d["acc_y"] * d["acc_y"]));
	            });

			d3.select(this).append("line")
				.attr("x1", cell_size / 2 - (d["acc_x"]) * cell_size * 5)
				.attr("y1", cell_size / 2 - (d["acc_y"]) * cell_size * 5)
				.attr("x2", cell_size / 2)
				.attr("y2", cell_size / 2)
				.attr("transform", "rotate(-15, " + cell_size / 2 + " " + cell_size/2 + ")")
				.style("stroke", acc_color)
				.style("stroke-width", acc_bold);
		})
	})
}


function updateSpeed(playerId){
	d3.selectAll(".speed-svg").remove();

	d3.csv("./speed-data/player-" + playerId + "-cell.csv", function(error, data) {

		var cell_size = 56;

		domain = {}

		domain["speed_x"] = d3.extent(data, function(d) { return d["speed_x"]; });
		domain["speed_y"] = d3.extent(data, function(d) { return d["speed_y"]; });

		var svg = d3.select("body").append("svg")
			.attr("class", "speed-svg")
		    .style("position", "absolute")
		    .style("width", court_width)
		    .style("height", court_height)
		    .style("left", court_left)
		    .style("top", court_top);

		cells = svg.selectAll(".cell")
			.data(data)
			.enter()
			.append("g")
			.attr("transform", function(d, i){ return "translate( " + i % 12 * cell_size+ ", " + parseInt(i / 12) * cell_size + ")";})
			.attr("class", "cell")
			.attr("width", cell_size)
			.attr("height", cell_size);

		var scale_x =  d3.scale.linear()
				.domain(domain["speed_x"])
    			.range([domain["speed_x"][0] * 0.5, domain["speed_x"][1]]);

		var scale_y =  d3.scale.linear()
				.domain(domain["speed_y"])
    			.range([domain["speed_y"][0] * 0.5, domain["speed_y"][1]]);


		cells.each(function(d, i){
			d3.select(this).append("line")
				.attr("x1", cell_size / 2 - scale_x(d["speed_x"]) * cell_size )
				.attr("y1", cell_size / 2 - scale_y(d["speed_y"]) * cell_size )
				.attr("x2", cell_size / 2)
				.attr("y2", cell_size / 2)
				.attr("transform", "rotate(15, " + cell_size / 2 + " " + cell_size/2 + ")")
				.style("stroke", speed_color)
				.style("stroke-width", speed_bold)
				.on("mouseover", function(d){
	            	console.log(Math.sqrt(d["speed_x"] * d["speed_x"] + d["speed_y"] * d["speed_y"]));
	            });

			d3.select(this).append("line")
				.attr("x1", cell_size / 2 - scale_x(d["speed_x"]) * cell_size * 1.2)
				.attr("y1", cell_size / 2 - scale_y(d["speed_y"]) * cell_size * 1.2)
				.attr("x2", cell_size / 2)
				.attr("y2", cell_size / 2)
				.attr("transform", "rotate(-15, " + cell_size / 2 + " " + cell_size/2 + ")")
				.style("stroke", speed_color)
				.style("stroke-width", speed_bold)
				.on("mouseover", function(d){
	            	console.log(Math.sqrt(d["speed_x"] * d["speed_x"] + d["speed_y"] * d["speed_y"]));
	            });
		})
	})
}

function speed_color(d, i){
	var length = Math.sqrt(d["speed_x"] * d["speed_x"] + d["speed_y"] * d["speed_y"]);
	if(length > 0.5)  return "#6A52A4";
	else if(length > 0.4) return "#4C9B71";
	else if(length > 0.3) return "#64BD79"
	else return "#9edae5";
}

function speed_bold(d, i){
	var length = Math.sqrt(d["speed_x"] * d["speed_x"] + d["speed_y"] * d["speed_y"]);
	if(length > 1)  return "5";
	else if(length > 0.15) return "4";
	else return "3";
}

function acc_bold(d, i){
	var length = Math.sqrt(d["acc_x"] * d["acc_x"] + d["acc_y"] * d["acc_y"]);
	if(length > 1)  return "5";
	else if(length > 0.15) return "4";
	else return "4";
}

function acc_color(d, i){
	var length = Math.sqrt(d["acc_x"] * d["acc_x"] + d["acc_y"] * d["acc_y"]);
	if(length > 1)  return "#6A52A4";
	else if(length > 0.15) return "#4C9B71";
	else return "#64BD79";
}