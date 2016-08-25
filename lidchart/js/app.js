// Our JavaScript
function scatterChart(dataset) {

  // Select tooltip
  var tooltip = d3.select('#tooltip');

  // TODO: Define dimensions
  var margin = {top: 20, right: 25, bottom: 40, left: 50},
      width = 1024 - margin.right - margin.left,
      height = 600 - margin.bottom - margin.top;
      padding = -80;

  // TODO: Define scales
  var xMin = 0, // Accessing the attribute, volume, via bracket notation
      xMax = d3.max(dataset, function(d) { return Math.round(d['avg_out_of_state_score']*100)/100; }),
      yMin = 0,
      yMax = d3.max(dataset, function(d) { return Math.round((d['max_score']*100)/100); });

  var xScale = d3.scale.linear()
      .domain([xMin, xMax])
      .range([0, width]);

  var yScale = d3.scale.linear()
      .domain([yMin, yMax])
      .range([height, 0]);

  // TODO: Create axes
  var xAxis = d3.svg.axis()
      .scale(xScale)
      .tickSize(-height)
      .ticks(20)
      .orient('bottom');
  var yAxis = d3.svg.axis()
      .scale(yScale)
      .tickSize(-width)
      .ticks(7)
      .tickPadding(8)
      .orient('left');
  // TODO: Create SVG
  var svg = d3.select("#chart-container").append("svg")
      .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
      .attr("preserveAspectRatio", "xMidYMid meet")
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // TODO:
  var container = svg.append('g');
  container.append('g')
    .attr('class', 'x axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis);

  container.append("text")
    .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.bottom - 5) + ")")
    .style("text-anchor", "middle")
    .text("Average out-of-state score");

  container.append('g')
    .attr('class', 'y axis')
    .call(yAxis);

  container.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x",0 - (height / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Highest score");


  // TODO: Draw dots
  svg.selectAll('circle')
      .data(dataset)
      .enter()
    .append('circle')
      .style("visibility", "visible")
      .attr('class', function(d) {
        return "dot " + d.party + " " + d.house_senate;
      })
      .attr("data-legend",function(d) {
        if(d.party === 'R'){
          return 'Republican sponsor';
        }else
        {
          return 'Democratic sponsor';
        }})
      .attr('cx', function(d) { return xScale(Math.round(d['avg_out_of_state_score']*100)/100); })
      .attr('cy', function(d) { return yScale(Math.round(d['max_score']*100)/100); })
      .attr('r', function(d) { return Math.sqrt(1/parseInt(d['uquintile'])*200)})
      .on('mouseover', function(d) {

        var dot = d3.select(this);
        dot.classed('active', true);

        this.parentNode.appendChild(this);

        // TODO: tooltips
        tooltip.selectAll('.bill').html(d['bill']);
        tooltip.selectAll('.title').html("Title: " + '<span>'+ d['title'] + '</span>');
        tooltip.selectAll('.sponsor').html("Sponsor: " + '<span>'+ d['sponsor'] + '</span>')
        tooltip.selectAll('.count').html("Count of matched phrases: " + '<span>'+ number_format(parseInt(d['count'])) + '</span>');
        tooltip.selectAll('.avg_out_of_state_score').html("Average score: " + '<span>'+ Math.round(d['avg_out_of_state_score']*100)/100 + '</span>');
        tooltip.selectAll('.max_score').html("Highest score: " + '<span>'+ Math.round(d['max_score']*100)/100 + '</span>');
        return tooltip.style('visibility', 'visible');

      })
      .on('mousemove', function(){
        var tipWidth = parseInt(tooltip.style('width'), 10);

        if (d3.event.offsetX > ((width - tipWidth))) {
          return tooltip
            .style('top', (d3.event.pageY - 40) + 'px')

            .style('left',(d3.event.pageX - (tipWidth + 32)) + 'px');
        } else {
          return tooltip
            .style('top', (d3.event.pageY - 40) + 'px')
            .style('left',(d3.event.pageX + 10) + 'px');
        }
      })
      .on('mouseout', function(d) {
        var dot = d3.select(this);
        d3.select(this).classed("active", false);
        return tooltip.style('visibility', 'hidden');
      });

  var legend = svg.append("g")
    .attr("class","legend")
    .attr("transform","translate(696, 400)")
    .attr("data-style-padding","10")
    .style('font-size', '16')
    .attr('data-legend-color', 'white')
    .call(d3.legend);

}//end of drawChart()


function number_format(number, decimals, dec_point, thousands_sep) {
    var n = !isFinite(+number) ? 0 : +number,
        prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
        sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
        dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
        toFixedFix = function (n, prec) {
            var k = Math.pow(10, prec);
            return Math.round(n * k) / k;
        },
        s = (prec ? toFixedFix(n, prec) : Math.round(n)).toString().split('.');
    if (s[0].length > 3) {
        s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
    }
    if ((s[1] || '').length < prec) {
        s[1] = s[1] || '';
        s[1] += new Array(prec - s[1].length + 1).join('0');
    }
    return s.join(dec);
}
// TODO: Load data
d3.csv('data/liddata.csv', function(error, data) {
  if(error) {
    console.log('Try again!');
  }
  else {
    var test = [];
    data.forEach(function(d){
      d.bill = d.bill;
      d.title = d.title;
      d.sponsor = d.sponsor;
      d.house_senate = d.house_senate;
      d.max_score = +d.max_score;
      d.count = +d.count;
      d.party = d.party;
      d.avg_out_of_state_score = +d.avg_out_of_state_score;

      test.push(d);
    });
  }
    scatterChart(test);
  });
