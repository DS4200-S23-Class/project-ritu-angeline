//US MAP
const width = 975;
const height = 610;

const FRAME2 = d3.select("#map")
                .append("svg")
                .attr("viewBox", [0,0, width, height])
                
let path = d3.geoPath()
d3.json("states-albers-10m.json").then((us) => {
  
const g = FRAME2.append("g");

let states = FRAME2.append("g")
                      .attr("fill", "#0d3a59")
                      .attr("cursor", "pointer")
                      .selectAll("path")
                      .data(topojson.feature(us, us.objects.states).features)
                      .join("path")
                      .on("click", clicked)
                      .attr("d", path);

  
  states.append("title")
      .text(d => d.properties.name);

  g.append("path")
      .attr("fill", "none")
      .attr("stroke", "white")
      .attr("stroke-linejoin", "round")
      .attr("d", path(topojson.mesh(us, us.objects.states, (a, b) => a !== b)));


   function zoomed(event) {
    const {transform} = event;
    g.attr("transform", transform);
    g.attr("stroke-width", 1 / transform.k);
  }


  const zoom = d3.zoom()
      .scaleExtent([1, 8])
      .on("zoom", zoomed);

  function reset() {
    states.transition().style("fill", null);
    FRAME2.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity,
      d3.zoomTransform(FRAME2.node()).invert([width / 2, height / 2])
    );
  }

  function clicked(event, d) {
    const [[x0, y0], [x1, y1]] = path.bounds(d);
    event.stopPropagation();
    states.transition().style("fill", null);
    d3.select(this).transition().style("fill", "red");
    FRAME2.transition().duration(750).call(
      zoom.transform,
      d3.zoomIdentity
        .translate(width / 2, height / 2)
        .scale(Math.min(8, 0.9 / Math.max((x1 - x0) / width, (y1 - y0) / height)))
        .translate(-(x0 + x1) / 2, -(y0 + y1) / 2),
      d3.pointer(event, FRAME2.node())
    );
  }

  FRAME2.call(zoom);

  FRAME2.on("click", reset);

})

// BAR PLOT

// Declare constants for frame
const FRAME_HEIGHT = 400;
const FRAME_WIDTH = 400;
const MARGINS = {left: 60, right: 60, top: 60, bottom: 60};

// creates a scale for visualization
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

//create a new frame - barplot
const FRAME1 = d3.select("#vis2")
                  .append("svg")
                    .attr("height", FRAME_HEIGHT)
                    .attr("width", FRAME_WIDTH)

const X_SCALE2 = d3.scaleBand()
  .range([ 0, VIS_WIDTH])
  .padding(0.2);
const xAxis = FRAME1.append("g")
  .attr("transform", "translate(" + MARGINS.top +
              "," + (VIS_HEIGHT + MARGINS.top) + ")")

// Initialize the Y axis
const Y_SCALE2 = d3.scaleLinear()
  .range([VIS_HEIGHT, 0]);
const yAxis = FRAME1.append("g")
  .attr("transform", "translate(" + MARGINS.left +
              "," + (MARGINS.top) + ")")
  .attr("class", "myYaxis");


// A function that create / update the plot for a given variable:
function update(selectedYear) {

  // Parse the Data
  d3.csv("data/breach_types.csv").then((data) => {

    // X axis
    X_SCALE2.domain(data.map(function(d) { return d.Type; }));
    xAxis.transition().duration(1000).call(d3.axisBottom(X_SCALE2));


    // Add Y axis
    Y_SCALE2.domain([0, d3.max(data, function(d) { return + d[selectedYear] }) ]);
    yAxis.transition().duration(1000).call(d3.axisLeft(Y_SCALE2));

    // variable u: map data to existing bars
    const u = FRAME1.selectAll("rect")
      .data(data)

    // update bars
    u
      .enter()
      .append("rect")
      .merge(u)
      .transition()
      .duration(1000)
        .attr("x", function(d) { return X_SCALE2(d.Type) + MARGINS.left; })
        .attr("y", function(d) { return Y_SCALE2(d[selectedYear]) + MARGINS.top; })
        .attr("width", X_SCALE2.bandwidth())
        .attr("height", function(d) { return VIS_HEIGHT - Y_SCALE2(d[selectedYear]); })
        .attr("fill", "IndianRed")
  })

  // Add X axis label
  FRAME1.append("text")
    .attr("text-anchor", "end")
    .attr("x", VIS_WIDTH - 20)
    .attr("y", VIS_HEIGHT + MARGINS.top + 50)
    .text("Type of Breach");

  // Rotate x-tick labels
  FRAME1.append("g")
        .call(xAxis)
        .selectAll(".class xticks")  
            .attr("transform", "rotate(60)");
}


// Initialize plot
update('2021')






