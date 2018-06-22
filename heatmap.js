function showheatmap() {
    var svg = d3.select("svg"),
        margin = {top: 50, right: 20, bottom: 30, left: 40},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    x_scales = width / 94.0;
    y_scales = height / 50.0;
    console.log(my_points);
    var points = d3.range(my_points.length).map(function (i) {
        return [my_points[i][0] * x_scales, (50 - my_points[i][1]) * y_scales];
    });
    var color = d3.scaleSequential(d3.interpolateLab("white", "steelblue"))
        .domain([0, 200]);

    var radius = d3.scaleSqrt()
        .domain([0, 500])
        .range([0, 10]);

    var hexbin = d3.hexbin()
        .radius(10)
        .extent([[0, 0], [94, 50]]);

    var x = d3.scaleLinear()
        .domain([0, 94])
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain([0, 50])
        .range([height, 0]);

    g.append("clipPath")
        .attr("id", "clip")
        .append("rect")
        .attr("width", width)
        .attr("height", height);

    g.append("g")
        .attr("class", "hexagon")
        .attr("clip-path", "url(#clip)")
        .selectAll("path")
        .data(hexbin(points))
        .enter().append("path")
        .attr("d", function (d) { return hexbin.hexagon(radius(Math.min(d.length, 500)));})
        .attr("transform", function (d) {
            return "translate(" + d.x + "," + d.y + ")";
        })
        .attr("fill", function (d) {
            return color(d.length);
        });

    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).tickSizeOuter(-width));

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(-height));
}