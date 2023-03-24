const SVG_WIDTH = 960;
const SVG_HEIGHT = 500;

const BOX_WIDTH = 60;
const BOX_HEIGHT = 20;

const graph = {
    nodes: [
        {
            name: "from",
            fixed: true,
            x: 0,
            y: 0,
            w: BOX_WIDTH,
            h: BOX_HEIGHT,
        },
        {
            name: 'to',
            fixed: true,
            x: 250,
            y: 250,
            w: BOX_WIDTH,
            h: BOX_HEIGHT,
        }
    ],
    links: [
        {
            // id: 0,
            source: 0,
            target: 1,
        }
    ]
}

const generateMarkerId = link => `arrowhead-${link.source.index}-${link.target.index}`.replace(/\s/g, "-");

const svg = d3
    .select("body")
    .append("svg")
    .attr("width", SVG_WIDTH)
    .attr("height", SVG_HEIGHT);

const forceLink = d3
    .forceLink()
    .id(link => link.id)
    .strength(_ => 0.002);

const forceNode = d3
    .forceManyBody()
    .strength(-400);

const forceDragDrop = d3
    .drag()
    .on("start", node => {
        node.fx = node.x;
        node.fy = node.y;
    })
    .on("drag", (event, node) => {
        force.alphaTarget(0.1).restart();
        node.fx = event.x;
        node.fy = event.y;
    })
    .on("end", (event, node) => {
        if (!event.active) force.alphaTarget(0);
        node.fx = null;
        node.fy = null;
    })

const force = d3
    .forceSimulation()
    .force("charge", forceNode)
    .force("link", forceLink);

const link = svg
    .selectAll(".link")
    .data(graph.links)
    .enter()
    .append("line")
    .attr("class", "link")
    .style("stroke-width", "5")
    .attr("marker-end", "url(#arrow)")
    .each(link => {
        svg
          .append("marker")
          .attr("id", generateMarkerId(link))
          .attr("viewBox", "0 -5 10 5")
          .attr("markerWidth", 2)
          .attr("markerHeight", 4)
          .attr("orient", "auto")
          .attr("refX", 30)
          .attr("refY", 0)
          .append("path")
          .attr("d", "M 0 5 L 10 0 L 0 -5 Z")
          .attr("fill", link.color); // Set the fill color to the link's color
    })
    .attr("marker-end", link => `url(#${generateMarkerId(link)})`)
    .call(forceDragDrop)

const node = svg
    .selectAll(".node")
    .data(graph.nodes)
    .enter()
    .append("rect")
    .attr("class", "node")
    .attr("width", d => d.w)
    .attr("height", d => d.h)
    .style("fill", "blue")
    .call(forceDragDrop)
    .append("title")
    .text(d => d.name);

// force.start();

force.on("tick", () => {
    console.log("lmao")
    link
        .attr("x1", d => d.source.x) // + d.source.w / 2
        .attr("y1", d => d.source.y) // + d.source.h / 2
        .attr("x2", d => d.target.x) // + d.target.w / 2
        .attr("y2", d => d.target.y) // + d.target.h / 2
        // .each(link => {
		// 			const markerId = generateMarkerId(link);

        //   const linkAngle = angle_between(
        //     link.source.x,
        //     -link.source.y,
        //     link.target.x,
        //     -link.target.y
        //   );

        //   const intersectionPoint = box_intersection(
        //     linkAngle,
        //     link.target.w,
        //     link.target.h,
        //     0
        //   );

        //   const x = d3.select(`#${markerId}`)
        //   const distance = Math.sqrt( ((intersectionPoint.x)**2) + ((intersectionPoint.y) ** 2) );
        //   //console.log(distance)
        //   x.attr('refX', _ => distance);
        // });

    node
        .attr("x", d => d.x)
        .attr("y", d => d.y);
});

const angle_between = (x1, y1, x2, y2) => {
	let angle = Math.atan2(y2-y1, x2-x1);
  if (angle < 0) angle += 2*Math.PI
  return angle;
}

const mod = (n, m) => ((n % m) + m) % m;

const hits_border_radius = (angle, box_width, box_height, border_radius) => {
  const height = box_height / 2;
  const width = box_width / 2;

  const p1 = [width, height - border_radius]
  const p2 = [width - border_radius, height]

  const border_angle1 = angle_between(0,0, p1[0], p1[1])
  const border_angle2 = angle_between(0,0, p2[0], p2[1])

  return [
    angle,
    mod(angle-(Math.PI/2), Math.PI*2),
    mod(angle-(Math.PI), Math.PI*2),
    mod(angle-(3*Math.PI/2), Math.PI*2)
  ].some(angle => border_angle1 < angle && angle < border_angle2);
}

const box_intersection = (angle, box_width, box_height, border_radius) => {
  const half_height = box_height / 2;
  const half_width = box_width / 2;

  if (hits_border_radius(angle, half_width, half_height, border_radius)) {
  	return arc_border_box_intersection(angle, half_width, half_height, border_radius)
  }

  return straight_border_box_intersection(angle, half_width, half_height)
}

const straight_border_box_intersection = (angle, box_width, box_height) => {
	return {y: Math.cos(angle)*box_width, x: Math.sin(angle)*box_height}
}

const arc_border_box_intersection = (angle, box_width, box_height, border_radius) => {
	//TODO:
	return 1;
}

// console.log(straight_border_box_intersection(angle_between(10,0,0,10), 10, 10))
