var court_width = "658px";
var court_height = "385px";
var margin = {top: 30, right: 20, bottom: 30, left: 40};
var width = 644;
var height = 366;

function func(value) {
    return value == this;
}
function getdirection(playerId) {
    a = [3062, 3257, 3497, 61849, 75344, 172631, 214152, 226806, 265013, 296572, 410831];
    h = [2989, 3329, 3235, 3315, 3501, 66858, 172537, 173147, 253980, 292404, 330047];
    //0 to-right 1 to-left
    if (a.find(func, playerId)) {
        return 0;
    } else {
        return 1;
    }
}

function showheatmap(state, playerId, blockSize) {
    d3.selectAll("svg > *").remove();
    if (state === 1) {
        $("#explain").text("进攻");
        my_points = offensive_points[playerId];
    } else {
        $("#explain").text("防守");
        my_points = defensive_points[playerId];
    }

    d3.select("#main_panel").append("div").attr("id", "speed-wrap-div").style("position", "relative");
    d3.select("#speed-wrap-div").append("img")
        .style("position", "absolute")
        .attr("id", "speed-court-img")
        .attr("src", "./court.png")
        .style("width", court_width)
        .style("height", court_height)
        .style("opacity", "0.5");


    d3.select("#speed-wrap-div").append("div")
        .style("position", "absolute")
        .style("width", court_width)
        .style("height", court_height)
        .style("left", 0)
        .style("top", 0)
        .style("opacity", "1")
        .style("background", "#E3E6E6")
        .style("z-index", "-100");


    var svg = d3.select("#speed-wrap-div").append("svg")
        .attr("class", "speed-svg")
        .style("position", "absolute")
        .style("width", 640 + 50)
        .style("height", 360 + 60)
        .style("left", -33)
        .style("top", -22);
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Arrow
    defs = svg.append("defs");
    defs.append("marker")
        .attr({
            "id": "arrow",
            "viewBox": "0 0 12 12",
            "refX": 6,
            "refY": 6,
            "markerWidth": 12,
            "markerHeight": 12,
            "orient": "auto"
        })
        .append("path")
        .attr("d", "M2,2 L10,6 L2,10 L6,6 L2,2")
        .attr("class", "arrowHead");
    if (getdirection(playerId) === 0) {
        g.append('line')
            .attr({
                "class": "arrow",
                "marker-end": "url(#arrow)",
                "x1": 200,
                "y1": 180,
                "x2": 420,
                "y2": 180
            });
    } else {
        g.append('line')
            .attr({
                "class": "arrow",
                "marker-end": "url(#arrow)",
                "x1": 420,
                "y1": 180,
                "x2": 200,
                "y2": 180

            });
    }

    x_scales = width / 94.0;
    y_scales = height / 50.0;
    var points = d3.range(my_points.length).map(function (i) {
        return [my_points[i][0] * x_scales, (50 - my_points[i][1]) * y_scales];
    });
    var color = d3.interpolateLab("white", "steelblue");
    var scale_linear = d3.scale.linear()
        .domain([1, 5])
        .range([200, 800]);

    var color_linear = d3.scale.linear()
        .domain([0, scale_linear(5 - blockSize)])    //400 is proper
        .range([0, 1]);

    var radius = d3.scale.sqrt()
        .domain([0, 500])
        .range([0, 10]);

    var hexbin = d3.hexbin()
        .radius(10)
        .extent([[0, 0], [94, 50]]);

    var x = d3.scale.linear()
        .domain([0, 94])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, 50])
        .range([height, 0]);

    g.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);
    // hexpts = hexbin(points);
    g.append("g")
        .attr("class", "hexagon")
        .attr("clip-path", "url(#clip)")
        .selectAll("path")
        .data(hexbin(points))
        .enter().append("path")
        .attr("d", function (d) {
            return hexbin.hexagon(radius(Math.min(d.length, 500)));
        })
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .attr("fill", function (d) {
            return color(color_linear(d.length));
        });

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.svg.axis().scale(y).outerTickSize(1).orient("left"));

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.svg.axis().scale(x).outerTickSize(1).orient("bottom"));
}