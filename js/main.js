//US MAP

us_state_to_abbrev = {
    "Alabama": "AL",
    "Alaska": "AK",
    "Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
    "Connecticut": "CT",
    "Delaware": "DE",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
    "Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
    "Nebraska": "NE",
    "Nevada": "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    "Ohio": "OH",
    "Oklahoma": "OK",
    "Oregon": "OR",
    "Pennsylvania": "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    "Tennessee": "TN",
    "Texas": "TX",
    "Utah": "UT",
    "Vermont": "VT",
    "Virginia": "VA",
    "Washington": "WA",
    "West Virginia": "WV",
    "Wisconsin": "WI",
    "Wyoming": "WY",
};

const width = 975;
const height = 610;
let selectedState = 0;

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
    selectedState = 0;
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

    selectedState = us_state_to_abbrev[d.properties.name];
  }

  FRAME2.call(zoom);

  FRAME2.on("click", reset);

})



// BAR PLOT

// Declare constants for frame
const FRAME_HEIGHT = 400;
const FRAME_WIDTH = 400;
const MARGINS = {left: 60, right: 60, top: 60, bottom: 100};

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
  .attr("class", "xAxisLabels")

// Initialize the Y axis
const Y_SCALE2 = d3.scaleLinear()
  .range([VIS_HEIGHT, 0]);
const yAxis = FRAME1.append("g")
  .attr("transform", "translate(" + MARGINS.left +
              "," + (MARGINS.top) + ")")
  .attr("class", "myYaxis");


// A function that create / update the plot for a given variable:
function update(selectedYear) {

  // if no state is selected
  if(selectedState == 0){
  // Parse the Data
  d3.csv("data/breach_types.csv").then((data) => {

    // X axis
    X_SCALE2.domain(data.map(function(d) { return d.Type; }));
    xAxis.transition().duration(1000).call(d3.axisBottom(X_SCALE2)).selectAll("text")
                                                                    .attr("dx", "-.8em")
                                                                    .attr("dy", ",15em")
                                                                    .style("text-anchor", "end")
                                                                    .attr("transform", "rotate(-30)");


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
        .attr("fill", "IndianRed");
  })
} else{

  if(selectedYear == 2021){
    dict = dataset_2021[selectedState]
  } else if(selectedYear == 2022){
    dict = dataset_2022[selectedState]
  } else if(selectedYear == 2023){
    dict = dataset_2023[selectedState]
  }

  types = Object.keys(dict)
  counts = Object.values(dict)

  const barData = [
    {type: types[0], count: counts[0]},
    {type: types[1], count: counts[1]},
    {type: types[2], count: counts[2]},
    {type: types[3], count: counts[3]},
    {type: types[4], count: counts[4]}
    ];

  X_SCALE2.domain(barData.map(function(d) { return d.type; }));
    xAxis.transition().duration(1000).call(d3.axisBottom(X_SCALE2)
      .tickFormat((d,i) => ["Hacking/IT Incident", "Unauthorized Access/Disclosure","Theft","Improper Disposal","Loss"][i]))
                                                                    .selectAll("text")
                                                                    .attr("dx", "-.8em")
                                                                    .attr("dy", ",15em")
                                                                    .style("text-anchor", "end")
                                                                    .attr("transform", "rotate(-30)");


    // Add Y axis
    Y_SCALE2.domain([0, d3.max(barData, function(d) { return d.count; }) ]);
    yAxis.transition().duration(1000).call(d3.axisLeft(Y_SCALE2));

    const u = FRAME1.selectAll("rect")
      .data(barData)

    // update bars
    u
      .enter()
      .append("rect")
      .merge(u)
      .transition()
      .duration(1000)
        .attr("x", function(d) { return X_SCALE2(d.type) + MARGINS.left; })
        .attr("y", function(d) { return Y_SCALE2(d.count) + MARGINS.top; })
        .attr("width", X_SCALE2.bandwidth())
        .attr("height", function(d) { return VIS_HEIGHT - Y_SCALE2(d.count); })
        .attr("fill", "IndianRed");

}

  // Add X axis label
  FRAME1.append("text")
    .attr("text-anchor", "end")
    .attr("x", VIS_WIDTH - 20)
    .attr("y", VIS_HEIGHT + MARGINS.top + 80)
    .text("Type of Breach");
}


// LINKING 

//nested dictionary
const dataset_2021 = {};
const dataset_2022 = {};
const dataset_2023 = {};
d3.csv("data/breach_report.csv").then(function(data) {
  //create empty dictionaries for states and type counts
  const typeDict = {HackingITIncident: 0, UnauthorizedAccessDisclosure: 0, Theft: 0, 
              ImproperDisposal: 0, Loss: 0}
  const stateList = [...new Set(data.map(d => d.State))].sort()
  for (const key of stateList) {
      dataset_2021[key] = {HackingITIncident: 0, UnauthorizedAccessDisclosure: 0, Theft: 0, 
              ImproperDisposal: 0, Loss: 0};
      dataset_2022[key] = {HackingITIncident: 0, UnauthorizedAccessDisclosure: 0, Theft: 0, 
              ImproperDisposal: 0, Loss: 0};
      dataset_2023[key] = {HackingITIncident: 0, UnauthorizedAccessDisclosure: 0, Theft: 0, 
              ImproperDisposal: 0, Loss: 0};
  }

  data.forEach(function (d,i){
    //cleaning type names
    if(d.Type == "Hacking/IT Incident"){
      d.Type = "HackingITIncident";
    }
    if(d.Type == "Unauthorized Access/Disclosure"){
      d.Type = "UnauthorizedAccessDisclosure";
    }
    if(d.Type == "Improper Disposal"){
      d.Type = "ImproperDisposal";
    }

    if (d.Year == 2021){
      temp = dataset_2021[d.State];
      temp[d.Type]++;
      dataset_2021[d.State] = temp;
      temp = typeDict;
    };
    if (d.Year == 2022){
      temp = dataset_2022[d.State];
      temp[d.Type]++;
      dataset_2022[d.State] = temp;
      temp = typeDict;
    };
    if (d.Year == 2023){
      temp = dataset_2023[d.State];
      temp[d.Type]++;
      dataset_2023[d.State] = temp;
      temp = typeDict;
    };


})

  console.log("2021", dataset_2021);
  console.log("2022", dataset_2022);
  console.log("2023", dataset_2023);

});

// Initialize plot
update('2021')



