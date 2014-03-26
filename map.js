// do all of this on window load
window.onload = function() {
  var width = 960,
      height = 500;

  // constructs a new map, basically a d3js version of a key-value object (id:rate)
  var rateById = d3.map();

  // given a value x in the input domain, returns the corresponding value in the output range.
  var quantize = d3.scale.quantize()
      // set the domain from -1 to 1 for the incoming data
      .domain([-1,1])
      // convert the data into a scaled range from 0-8, mapping to the class-name in the CSS
      .range(d3.range(9).map(function(i) { return "q" + i + "-9"; }));

  // stores the code for drawing each state
  var path = d3.geo.path();

  // add the SVG canvas with width and height
  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  // an aysnchronous js helper that lets you defer an action until something is loaded
  queue()
      // start loading us.json
      .defer(d3.json, "us.json")
      // start loading votes.csv ... when fully loaded, run rateById.set(d.id, d.rate)
                                 //  this is the callback function!
      .defer(d3.csv, "votes.csv", function(d) { rateById.set(d.id, {county: d.county, state: d.state, score: d.single_score, whole_foods: d.whole_foods, cb: d.cracker_barrel}); })
      // sets the callback to be invoked when all deferred tasks have finished.
      .await(ready);

  // once all the aysnchronous actions are done, ready() fires off the action
  // 1st param is for error, 2nd param is how we send in the shapes to draw the map
  function ready(error, us) {
    // appends one g to the SVG, class counties
    svg.append("g")
      .attr("class", "counties")
      // within the g (counties), select all paths
      .selectAll("path")
        // bind data to each county
        .data(topojson.feature(us, us.objects.counties).features)
      .enter().append("path")
        .attr("title", function(d) {return d.id; })
        .attr("data-value", function(d) {
          var current_local = rateById.get(d.id);
          if (current_local) {
            return current_local.score;
          }
        })
        .attr("class", function(d) {
          var current_local = rateById.get(d.id);
          if (current_local) {
            return quantize(current_local.score);
          }
        })
        .attr("d", path);

    svg.append("path")
        .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);
  }

};
