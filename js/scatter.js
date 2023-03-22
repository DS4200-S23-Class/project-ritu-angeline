// Declare constants for frame
const FRAME_HEIGHT = 400;
const FRAME_WIDTH = 400;
const MARGINS = {left: 60, right: 60, top: 60, bottom: 60};

// creates a scale for visualization
const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right; 

// create a new frame - scatterplot
const FRAME1 = d3.select("#vis1")
                  .append("svg")
                    .attr("height", FRAME_HEIGHT)
                    .attr("width", FRAME_WIDTH)
                    .attr("class", "left"); 

// read data and create plot
d3.csv("data/breach_report.csv").then((data) => {

console.log(data.columns);

  // VISUALIZATION

  // Define scale functions that maps our data values 
  const X_SCALE1 = d3.scaleTime()
                    .domain(d3.extent(data, function(d) { 
                            return new Date(d['Breach Submission Date']); }))
                    .range([0, VIS_WIDTH]);

  // Add an x axis to the visualization  
  FRAME1.append("g") 
        .attr("transform", "translate(" + MARGINS.top + 
              "," + (VIS_HEIGHT + MARGINS.top) + ")") 
        .call(d3.axisBottom(X_SCALE1).ticks(10)) 
          .attr("font-size", '10px'); 

   // find max Y
  const MAX_Y1 = d3.max(data, (d) => { return parseInt(d['Individuals Affected']); });

  // Define scale functions that map our data values
  const Y_SCALE1 = d3.scaleLinear()
             .domain([0, (MAX_Y1 + 1)])
             .range([VIS_HEIGHT, 0]);

   // Use X_SCALE1 and Y_SCALE1 to plot our points with appropriate x & y values
    let allPoints1 = FRAME1.append("g")
      .selectAll("points")
      .data(data) //passed from .then
      .enter()
      .append("circle")
      .attr("cx", function (d) { return (X_SCALE1(new Date(d['Breach Submission Date']))+MARGINS.left); })
      .attr("cy", (d) => { return (Y_SCALE1(d['Individuals Affected']) + MARGINS.top); })
      .attr("fill", "darksalmon")
      .attr("r", 4);


  // Add a y-axis to the visualization
  FRAME1.append("g")
      .attr("transform", "translate(" + MARGINS.left + 
              "," + (MARGINS.top) + ")") 
        .call(d3.axisLeft(Y_SCALE1).ticks(10)) 
          .attr("font-size", '10px'); 
});