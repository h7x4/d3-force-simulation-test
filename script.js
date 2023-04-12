/**
 * Finds the intersection point between
 *     * a rectangle centered in point B
 *       with sides parallel to the x and y axes
 *     * a line passing through points A and B (the center of the rectangle)
 *
 * @param width: rectangle width
 * @param height: rectangle height
 * @param xB; rectangle center x coordinate
 * @param yB; rectangle center y coordinate
 * @param xA; point A x coordinate
 * @param yA; point A y coordinate
 * @author Federico Destefanis
 * @see <a href="https://stackoverflow.com/a/31254199/2668213">based on</a>
 */

function lineIntersectionOnRect(width, height, xB, yB, xA, yA) {

  var w = width / 2;
  var h = height / 2;

  var dx = xA - xB;
  var dy = yA - yB;

  //if A=B return B itself
  if (dx == 0 && dy == 0) return {
    x: xB,
    y: yB
  };

  var tan_phi = h / w;
  var tan_theta = Math.abs(dy / dx);

  //tell me in which quadrant the A point is
  var qx = Math.sign(dx);
  var qy = Math.sign(dy);


  if (tan_theta > tan_phi) {
    xI = xB + (h / tan_theta) * qx;
    yI = yB + h * qy;
  } else {
    xI = xB + w * qx;
    yI = yB + w * tan_theta * qy;
  }

  return {
    x: xI,
    y: yI
  };

}


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

  // if (hits_border_radius(angle, box_width, box_height, border_radius)) {
  //   return arc_border_box_intersection(angle, half_width, half_height, border_radius)
  // }

  return straight_border_box_intersection(angle, half_width, half_height)
}

const straight_border_box_intersection = (angle, box_width, box_height) => ({
  y: Math.cos(angle) * box_width,
  x: Math.sin(angle) * box_height,
});


const arc_border_box_intersection = (angle, box_width, box_height, border_radius) => {
	//TODO:
	return 1;
}

const SVG_WIDTH = 960;
const SVG_HEIGHT = 500;

const BOX_WIDTH = 120;
const BOX_HEIGHT = 40;
const BORDER_RADIUS = 10;

const MARKER_VIEWBOX = {
  minX: 0,
  minY: -5,
  maxX: 10,
  maxY: 10,
};

const graph = {
    nodes: [
        {
            name: 'from',
            fixed: true,
            x: 100,
            y: 100,
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
            source: 0,
            target: 1,
        }
    ]
}

const generateMarkerId = index => `arrowhead-${index}`.replace(/\s/g, '-');

const svg = d3
    .select('body')
    .append('svg')
    .attr('width', SVG_WIDTH)
    .attr('height', SVG_HEIGHT);


/****************************/
/* Node and link generation */
/****************************/

const link = svg
    .append('svg:g')
      .attr('class', 'links')
      .selectAll('g')
      .data(graph.links, link => `${link.source}-${link.target}`)
      .join('g')
      .call(g => g
        .append('svg:line')
        .attr('class', 'link-line')
        .style('stroke-width', '5')
        .attr('marker-end', (link, index) => `url(#${generateMarkerId(index)})`)
      )
      .call(g => g
        .append('svg:marker')
        .attr('id', (link, index) => generateMarkerId(index))
        .attr('viewBox', `${MARKER_VIEWBOX.minX} ${MARKER_VIEWBOX.minY} ${MARKER_VIEWBOX.maxX} ${MARKER_VIEWBOX.maxY}`)
        .attr('markerWidth', 2)
        .attr('markerHeight', 4)
        .attr('orient', 'auto')
        .append('svg:path')
          .attr("d", "M0,-5L10,0L0,5")
          // .attr('d', 'M 0 5 L 10 0 L 0 -5 Z')
          // .attr('fill', link.color); // Set the fill color to the link's color
      );

const forceDragDrop = d3.drag()
    .on('start', (event, node) => {
        if (!event.active) force.alphaTarget(0.03).restart();
        node.fx = event.x;
        node.fy = event.y;
    })
    .on('drag', (event, node) => {
        if (!event.active) force.alphaTarget(0.1).restart();
        node.fx = event.x;
        node.fy = event.y;
    })
    .on('end', (event, node) => {
        if (!event.active) force.alphaTarget(0.03).restart();
        node.fx = null;
        node.fy = null;
    })

const nodes = svg
  .append('svg:g')
    .attr('class', 'nodes')
    .selectAll('rect')
    .data(graph.nodes)
    .join('g')
    .call(g => g.append('rect')
      .attr('class', 'node-box')
      .attr('width', node => node.w)
      .attr('height', node => node.h)
      .attr('rx', BORDER_RADIUS)
      .attr('x', node => node.x)
      .attr('y', node => node.y)
      .attr('id', node => node.name)
      .call(forceDragDrop)
    )
    .call(g => g.append('text').text(node => node.name))

/********************/
/* Force Simulation */
/********************/

const forceLink = d3
    .forceLink()
    // .id((node, index) => node.name)
    .strength(_ => 0.002)
    .links(graph.links);

const forceNode = d3
    .forceManyBody()
    // .strength(-400);

const force = d3
    .forceSimulation(graph.nodes)
    .force('charge', forceNode)
    .force('link', forceLink)
    .on('tick', () => {
        link.selectAll('line')
            .attr('x1', link => link.source.x) // + d.source.w / 2
            .attr('y1', link => link.source.y) // + d.source.h / 2
            .attr('x2', link => link.target.x) // + d.target.w / 2
            .attr('y2', link => link.target.y) // + d.target.h / 2
            .each(link => {
              const markerId = generateMarkerId(link.index);

              //In radians
              const linkAngle = angle_between(
                link.source.x,
                -link.source.y,
                link.target.x,
                -link.target.y
              );
            
              const intersectionPoint = box_intersection(
                linkAngle,
                link.target.w,
                link.target.h,
                0
              );

              const intersect = lineIntersectionOnRect(BOX_WIDTH, BOX_HEIGHT, link.source.x, link.source.y, link.target.x, link.target.y);

              const marker = d3.select(`#${markerId}`)

              let distance;

              // if(hits_border_radius(linkAngle, link.target.w, link.target.h, BORDER_RADIUS)) {
              //   distance = Math.sqrt( ((intersectionPoint.x)**2) + ((intersectionPoint.y) ** 2) );
              // } else {
                distance = Math.sqrt(Math.pow(intersect.x - link.source.x, 2) + Math.pow(intersect.y - link.source.y, 2));
              // }
              marker.attr('refX', _ => {
                const markerHeight = MARKER_VIEWBOX.maxY - MARKER_VIEWBOX.minY
                return distance + markerHeight/2 + 2;
              });
            });

        nodes.selectAll('.node-box')
          .attr('x', node => node.x - (node.w / 2))
          .attr('y', node => node.y - (node.h / 2))
    });