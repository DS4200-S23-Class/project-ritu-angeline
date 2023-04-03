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






