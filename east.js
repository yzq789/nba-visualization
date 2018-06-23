var courtwidth = 50;
var courtlength = 94;

var shift = 10;
var left = 0;
var up = -100;
var courtUp = 0;

function update(team, player, shots, blockSize) {
    console.log("team");
    console.log(team);

    console.log("player");
    console.log(player);

    console.log("shots");
    console.log(shots);

    console.log("blockSize");
    console.log(blockSize);

    points = [];

    var tooltip = d3.select("body")
        .append("div")
        .attr("class","tooltip")
        .style("opacity",0.0);

    svg = d3.select("#main_panel").append("svg")
        .attr("id", "east")
        .attr("width", 600)
        .attr("height", 400);

    rate = 0;
    var updateShots = function(shots, player, team){
        if(player == undefined){
            if(team == undefined){
                for(var i = 0;i < shots.length;i++){
                    points.push(shots[i]);
                }
            }else{
                for(var i = 0;i < shots.length;i++){
                    if(shots[i].team == team){
                        points.push(shots[i]);
                    }
                }
            }
        }else{
            for(var i = 0;i < shots.length;i++){
                if(shots[i].id == player.id){
                    points.push(shots[i]);
                }
            }
        }

        var count = 0;
        for(var i = 0;i < points.length;i++){
            if(points[i].score)count++;
        }
        rate = count / points.length;
        d3.select("#rate").text(rate.toPrecision(2) + "%");

        updateBlocks();
    };

    var updateBlocks = function(){
        svg.select("#blocks").remove();

        blockXNum = parseInt(courtwidth / blockSize);
        blockYNum = parseInt(courtlength / 2 / blockSize);
        blocks = new Array();
        for(i = 0;i <= blockYNum;i++){
            blocks.push(new Array());
            for(j = 0;j <= blockXNum;j++){
                block = [0,0];
                blocks[i].push(block);
            }
        }
        for(i = 0;i < points.length;i++){
            point = points[i];
            x = parseInt(point.x / blockSize);
            y = parseInt(point.y / blockSize);
            blocks[y][x][0] += 1;
            if(point.score)
                blocks[y][x][1] += 1;
        }

        blockList = []
        for(i = 0;i <= blockYNum;i++){
            for(j = 0;j <= blockXNum;j++){
                if(blocks[i][j][0] == 0)continue;

                block = blocks[i][j];
                block.x = j * blockSize + blockSize/2;
                block.y = i * blockSize + blockSize/2;
                block.rate = block[1] / block[0];
                blockList.push(block);
            }
        }
        console.log("blockList");
        console.log(blockList);
        if(blockList.length == 0)return;

        //定义命中率颜色函数
        var maxRate = blockList[0].rate;
        var minRate = blockList[0].rate;
        for(i = 0; i < blockList.length; i++){
            rate = blockList[i].rate;
            if(maxRate < rate)maxRate = rate;
            if(minRate > rate)minRate = rate;
        }

        var linearRate = d3.scale.linear()
                        .domain([minRate, maxRate])
                        .range([0, 1]);

        var maxColor = d3.rgb(255,0,0); //红色
        var minColor = d3.rgb(255,255,0); //黄色
        var computeRateColor = d3.interpolate(minColor, maxColor);

        //定义投球数大小函数
        var maxNum = blockList[0][0];
        var minNum = blockList[0][0];
        for(i = 0; i < blockList.length; i++){
            num = blockList[i][0];
            if(maxNum < num)maxNum = num;
            if(minNum > num)minNum = num;
        }
        var linearNum = d3.scale.linear()
                        .domain([minNum, maxNum])
                        .range([1, 5]);

        //画点
        gb = svg.append("g").attr("id", "blocks");
        gb.selectAll("circle")
            .data(blockList)
            .enter()
            .append("circle")
            .attr("cx",function(d,i){
                return d.x * shift + left;
            })
            .attr("cy",function(d,i){
                return d.y * shift + up;
            })
            .attr("fill",function(d,i){
                var t = linearRate(d.rate);
                var color = computeRateColor(t);
                return color.toString();
            })
            .attr("r",function(d){
                return blockSize * linearNum(d[0]) * 1.5;
            })
            .on("mouseover",function(d){
                tooltip.html("num:" + d[0] + "<br />" + "hit:" + d[1] + "<br />" + "rate:" + d.rate.toPrecision(2))
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("opacity",1.0);
                console.log(1111111);
                console.log(d3.event.pageX);
                console.log(d3.event.pageY);
            })
            .on("mouseout",function(d){
                tooltip.style("left", "0px")
                    .style("top", "0px")
                    .style("opacity",0.0);
                console.log("leave");
            });
    };

    updateShots(shots, player, team);
};

function draw(){
    opts = {
        basketDiameter: 1.5,
        basketProtrusionLength: 4,
        basketWidth: 6,
        courtLength: 94,
        courtWidth: 50,
        freeThrowLineLength: 19,
        freeThrowCircleRadius: 6,
        keyMarkWidth: .5,
        keyWidth: 16,
        restrictedCircleRadius: 4,
        threePointCutoffLength: 14,
        threePointRadius: 23.75,
        threePointSideRadius: 22
    };
    var o = opts;
    calculateVisibleCourtLength = function () {
          var halfCourtLength = o.courtLength / 2;
          var threePointLength = o.threePointRadius + 
            o.basketProtrusionLength;
          o.visibleCourtLength = threePointLength + 
            (halfCourtLength - threePointLength) / 2;
    };
    calculateVisibleCourtLength();
    // helper to create an arc path
    appendArcPath = function (base, radius, startAngle, endAngle) {
          var points = 30;

          var angle = d3.scale.linear()
              .domain([0, points - 1])
              .range([startAngle, endAngle]);

          var line = d3.svg.line.radial()
              .interpolate("basis")
              .tension(0)
              .radius(radius)
              .angle(function(d, i) { return angle(i); });

          return base.append("path").datum(d3.range(points))
              .attr("d", line);
    };
    // draw basketball court
    var drawCourt = function () {
        base = d3.select("#east")
            .append('g')
            .attr('class', 'shot-chart-court');
                           
        base.append("rect")
            .attr('class', 'shot-chart-court-key')
            .attr("x", (o.courtWidth / 2 - o.keyWidth / 2)*shift+left)
            .attr("y", (o.visibleCourtLength - o.freeThrowLineLength)*shift+courtUp)
            .attr("width", o.keyWidth*shift)
            .attr("height", o.freeThrowLineLength*shift);

        base.append("line")
            .attr('class', 'shot-chart-court-baseline')
            .attr("x1", 0+left)
            .attr("y1", o.visibleCourtLength*shift+courtUp)
            .attr("x2", o.courtWidth*shift+left)
            .attr("y2", o.visibleCourtLength*shift+courtUp);

        base.append("line")
            .attr('class', 'shot-chart-court-baseline')
            .attr("x1", 0+left)
            .attr("y1", o.visibleCourtLength*shift+courtUp)
            .attr("x2", 0+left)
            .attr("y2", o.halfCourtLength*shift+courtUp);

        base.append("line")
            .attr('class', 'shot-chart-court-baseline')
            .attr("x1", o.courtWidth*shift+left)
            .attr("y1", o.visibleCourtLength*shift+courtUp)
            .attr("x2", o.courtWidth*shift+left)
            .attr("y2", o.halfCourtLength*shift+courtUp);

        base.append("line")
            .attr('class', 'shot-chart-court-baseline')
            .attr("x1", 0+left)
            .attr("y1", o.halfCourtLength*shift+courtUp)
            .attr("x2", o.courtWidth*shift+left)
            .attr("y2", o.halfCourtLength*shift+courtUp);
                  
          var tpAngle = Math.atan(o.threePointSideRadius / 
            (o.threePointCutoffLength - o.basketProtrusionLength - o.basketDiameter/2));
          appendArcPath(base, o.threePointRadius*shift, -1 * tpAngle, tpAngle)
            .attr('class', 'shot-chart-court-3pt-line')
            .attr("transform", "translate(" + (o.courtWidth*shift/2+left) + ", " + 
              ((o.visibleCourtLength - o.basketProtrusionLength - o.basketDiameter / 2)*shift+courtUp) + 
              ")");
             
          [1, -1].forEach(function (n) {
            base.append("line")
              .attr('class', 'shot-chart-court-3pt-line')
              .attr("x1", (o.courtWidth / 2 + o.threePointSideRadius * n)*shift+left)
              .attr("y1", (o.visibleCourtLength - o.threePointCutoffLength)*shift+courtUp)
              .attr("x2", (o.courtWidth / 2 + o.threePointSideRadius * n)*shift+left)
              .attr("y2", o.visibleCourtLength*shift+courtUp);
          });
            
          appendArcPath(base, o.restrictedCircleRadius*shift, -1 * Math.PI/2, Math.PI/2)
            .attr('class', 'shot-chart-court-restricted-area')
            .attr("transform", "translate(" + ((o.courtWidth / 2)*shift+left) + ", " + 
              ((o.visibleCourtLength - o.basketProtrusionLength - o.basketDiameter / 2)*shift+courtUp) + ")");
                                                          
          [7, 8, 11, 14].forEach(function (mark) {
            [1, -1].forEach(function (n) {
              base.append("line")
                .attr('class', 'shot-chart-court-key-mark')
                .attr("x1", (o.courtWidth / 2 + o.keyWidth / 2 * n + o.keyMarkWidth * n)*shift+left)
                .attr("y1", (o.visibleCourtLength - mark)*shift+courtUp)
                .attr("x2", (o.courtWidth / 2 + o.keyWidth / 2 * n)*shift+left)
                .attr("y2", (o.visibleCourtLength - mark)*shift+courtUp)
            });
          });    

          base.append("line")
            .attr('class', 'shot-chart-court-backboard')
            .attr("x1", (o.courtWidth / 2 - o.basketWidth / 2)*shift+left)
            .attr("y1", (o.visibleCourtLength - o.basketProtrusionLength)*shift+courtUp)
            .attr("x2", (o.courtWidth / 2 + o.basketWidth / 2)*shift+left)
            .attr("y2", (o.visibleCourtLength - o.basketProtrusionLength)*shift+courtUp)
                                         
          base.append("circle")
            .attr('class', 'shot-chart-court-hoop')
            .attr("cx", o.courtWidth / 2 * shift + left)
            .attr("cy", (o.visibleCourtLength - o.basketProtrusionLength - o.basketDiameter / 2)*shift+courtUp)
            .attr("r", o.basketDiameter / 2 * shift)
    }
    drawCourt();
}