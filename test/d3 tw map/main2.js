const width = 800;
const height = 600;
const svg = d3.select('#map')
    .append('svg')
    .attr('width', width)
    .attr('height', height);

const projection = d3.geoMercator()
    .center([121, 23.8])
    .scale(6000)
    .translate([width / 2, height / 2]);

const path = d3.geoPath()
    .projection(projection);

const popup = d3.select('#popup');

d3.json('twCounty2010.geo.json').then(data => {
    svg.append('g')
        .selectAll('path')
        .data(data.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', '#fa0')
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .on('mouseover', changeFill)
        .on('mouseout', resetFill)
});

function changeFill(){
    d3.select(this)
        .transition()
        .duration(200)
        .attr('fill', '#ff9800')
}